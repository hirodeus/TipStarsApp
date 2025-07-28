from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime
import httpx
import asyncio
from emergentintegrations.llm.chat import LlmChat, UserMessage
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# API Keys
ODDS_API_KEY = os.environ.get('ODDS_API_KEY')
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')

class OddsData(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    sport: str
    home_team: str
    away_team: str
    commence_time: str
    bookmaker: str
    home_odds: float
    away_odds: float
    draw_odds: Optional[float] = None
    fetched_at: datetime = Field(default_factory=datetime.utcnow)

class UserPreferences(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    min_odds: float = 1.5
    max_legs: int = 4
    risk_level: str = "medium"  # low, medium, high
    preferred_leagues: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ParlayBet(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    home_team: str
    away_team: str
    selection: str  # home, away, draw
    odds: float
    confidence_score: float
    reasoning: str

class ParlayRecommendation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    parlays: List[List[ParlayBet]]
    total_odds: List[float]
    risk_levels: List[str]
    potential_payouts: List[float]
    generated_at: datetime = Field(default_factory=datetime.utcnow)

@api_router.get("/")
async def root():
    return {"message": "Sports Betting Assistant API"}

@api_router.get("/odds/soccer")
async def get_soccer_odds():
    """Fetch live soccer odds from TheOddsAPI"""
    try:
        async with httpx.AsyncClient() as client:
            url = f"https://api.the-odds-api.com/v4/sports/soccer_epl/odds"
            params = {
                "apiKey": ODDS_API_KEY,
                "regions": "uk",
                "markets": "h2h",
                "oddsFormat": "decimal"
            }
            
            response = await client.get(url, params=params)
            response.raise_for_status()
            
            odds_data = response.json()
            processed_odds = []
            
            for game in odds_data:
                for bookmaker in game.get('bookmakers', []):
                    for market in bookmaker.get('markets', []):
                        if market['key'] == 'h2h':
                            outcomes = {outcome['name']: outcome['price'] for outcome in market['outcomes']}
                            
                            odds_entry = OddsData(
                                sport='soccer_epl',
                                home_team=game['home_team'],
                                away_team=game['away_team'],
                                commence_time=game['commence_time'],
                                bookmaker=bookmaker['title'],
                                home_odds=outcomes.get(game['home_team'], 0),
                                away_odds=outcomes.get(game['away_team'], 0),
                                draw_odds=outcomes.get('Draw', None)
                            )
                            processed_odds.append(odds_entry)
            
            # Store in database
            if processed_odds:
                odds_dicts = [odds.dict() for odds in processed_odds]
                await db.odds_data.insert_many(odds_dicts)
            
            return {"odds": processed_odds[:20], "total_games": len(processed_odds)}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching odds: {str(e)}")

@api_router.post("/analyze/bet")
async def analyze_bet(bet_data: Dict[str, Any]):
    """Analyze a single bet using AI"""
    try:
        chat = LlmChat(
            api_key=OPENAI_API_KEY,
            session_id=f"bet_analysis_{uuid.uuid4()}",
            system_message="""You are an expert sports betting analyst specializing in soccer.
            Analyze the provided bet data and return a JSON response with:
            - confidence_score (0-100)
            - reasoning (brief explanation)
            - risk_level (low/medium/high)
            
            Consider team form, recent performance, odds value, and any other relevant factors."""
        ).with_model("openai", "gpt-4o")
        
        analysis_prompt = f"""
        Analyze this soccer bet:
        Match: {bet_data.get('home_team')} vs {bet_data.get('away_team')}
        Selection: {bet_data.get('selection')}
        Odds: {bet_data.get('odds')}
        Bookmaker: {bet_data.get('bookmaker')}
        
        Provide analysis in JSON format.
        """
        
        user_message = UserMessage(text=analysis_prompt)
        response = await chat.send_message(user_message)
        
        try:
            analysis = json.loads(response)
        except:
            # Fallback if AI doesn't return proper JSON
            analysis = {
                "confidence_score": 70,
                "reasoning": "Standard analysis based on odds value",
                "risk_level": "medium"
            }
        
        return analysis
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing bet: {str(e)}")

@api_router.post("/generate/parlay")
async def generate_parlay_recommendations(preferences: Dict[str, Any]):
    """Generate AI-powered parlay recommendations"""
    try:
        # Get latest odds from database
        latest_odds = await db.odds_data.find().sort("fetched_at", -1).limit(50).to_list(50)
        
        if not latest_odds:
            raise HTTPException(status_code=404, detail="No odds data available")
        
        # Filter odds based on preferences
        min_odds = preferences.get('min_odds', 1.5)
        max_legs = preferences.get('max_legs', 4)
        risk_level = preferences.get('risk_level', 'medium')
        
        filtered_bets = []
        
        for odds in latest_odds:
            # Check home bet
            if odds['home_odds'] >= min_odds:
                filtered_bets.append({
                    'home_team': odds['home_team'],
                    'away_team': odds['away_team'],
                    'selection': 'home',
                    'odds': odds['home_odds'],
                    'bookmaker': odds['bookmaker']
                })
            
            # Check away bet
            if odds['away_odds'] >= min_odds:
                filtered_bets.append({
                    'home_team': odds['home_team'],
                    'away_team': odds['away_team'],
                    'selection': 'away',
                    'odds': odds['away_odds'],
                    'bookmaker': odds['bookmaker']
                })
            
            # Check draw bet if available
            if odds.get('draw_odds') and odds['draw_odds'] >= min_odds:
                filtered_bets.append({
                    'home_team': odds['home_team'],
                    'away_team': odds['away_team'],
                    'selection': 'draw',
                    'odds': odds['draw_odds'],
                    'bookmaker': odds['bookmaker']
                })
        
        # Generate AI analysis for parlay combinations
        chat = LlmChat(
            api_key=OPENAI_API_KEY,
            session_id=f"parlay_gen_{uuid.uuid4()}",
            system_message="""You are an expert sports betting analyst. Generate 3 parlay recommendations:
            1. Conservative (low risk, higher probability)
            2. Balanced (medium risk, good value)
            3. Aggressive (higher risk, higher reward)
            
            For each parlay, select 2-4 bets and provide reasoning."""
        ).with_model("openai", "gpt-4o")
        
        parlay_prompt = f"""
        Available soccer bets (first 20):
        {json.dumps(filtered_bets[:20], indent=2)}
        
        User preferences:
        - Min odds per leg: {min_odds}
        - Max legs per parlay: {max_legs}
        - Risk level: {risk_level}
        
        Generate 3 parlay recommendations in JSON format:
        {{
            "conservative": [list of bet indices],
            "balanced": [list of bet indices],
            "aggressive": [list of bet indices]
        }}
        """
        
        user_message = UserMessage(text=parlay_prompt)
        response = await chat.send_message(user_message)
        
        try:
            ai_recommendations = json.loads(response)
        except:
            # Fallback recommendations
            ai_recommendations = {
                "conservative": [0, 1],
                "balanced": [2, 3, 4],
                "aggressive": [5, 6, 7, 8]
            }
        
        # Build parlay recommendations
        parlays = []
        risk_levels = []
        total_odds = []
        
        for risk_type, bet_indices in ai_recommendations.items():
            parlay_bets = []
            parlay_odds = 1.0
            
            for idx in bet_indices:
                if idx < len(filtered_bets):
                    bet = filtered_bets[idx]
                    
                    parlay_bet = ParlayBet(
                        home_team=bet['home_team'],
                        away_team=bet['away_team'],
                        selection=bet['selection'],
                        odds=bet['odds'],
                        confidence_score=75.0,  # Placeholder
                        reasoning=f"Good value at {bet['odds']} odds"
                    )
                    
                    parlay_bets.append(parlay_bet)
                    parlay_odds *= bet['odds']
            
            if parlay_bets:
                parlays.append(parlay_bets)
                risk_levels.append(risk_type)
                total_odds.append(round(parlay_odds, 2))
        
        recommendation = ParlayRecommendation(
            parlays=parlays,
            total_odds=total_odds,
            risk_levels=risk_levels,
            potential_payouts=[round(odds * 10, 2) for odds in total_odds]  # Assuming $10 bet
        )
        
        # Store recommendation in database
        await db.parlay_recommendations.insert_one(recommendation.dict())
        
        return recommendation
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating parlays: {str(e)}")

@api_router.get("/history/parlays")
async def get_parlay_history():
    """Get recent parlay recommendations"""
    try:
        history = await db.parlay_recommendations.find().sort("generated_at", -1).limit(10).to_list(10)
        return {"history": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching history: {str(e)}")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()