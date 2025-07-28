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
import random

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="Asistente de Apuestas Deportivas", description="API para análisis inteligente de apuestas deportivas")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# API Keys
ODDS_API_KEY = os.environ.get('ODDS_API_KEY')
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')

# Supported sports configuration
SPORTS_CONFIG = {
    "soccer": {
        "name": "Fútbol",
        "emoji": "⚽",
        "api_keys": ["soccer_epl", "soccer_spain_la_liga", "soccer_uefa_champs_league"],
        "markets": ["h2h", "spreads", "totals"]
    },
    "basketball": {
        "name": "Baloncesto (NBA)",
        "emoji": "🏀", 
        "api_keys": ["basketball_nba"],
        "markets": ["h2h", "spreads", "totals"]
    },
    "americanfootball": {
        "name": "Fútbol Americano (NFL)",
        "emoji": "🏈",
        "api_keys": ["americanfootball_nfl"],
        "markets": ["h2h", "spreads", "totals"]
    },
    "tennis": {
        "name": "Tenis",
        "emoji": "🎾",
        "api_keys": ["tennis_atp", "tennis_wta"],
        "markets": ["h2h"]
    },
    "esports": {
        "name": "Esports",
        "emoji": "🎮",
        "api_keys": ["esports_lol", "esports_dota2", "esports_csgo"],
        "markets": ["h2h"]
    }
}

class OddsData(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    sport: str
    sport_name: str
    home_team: str
    away_team: str
    commence_time: str
    bookmaker: str
    home_odds: float
    away_odds: float
    draw_odds: Optional[float] = None
    spread_home: Optional[float] = None
    spread_away: Optional[float] = None
    total_over: Optional[float] = None
    total_under: Optional[float] = None
    fetched_at: datetime = Field(default_factory=datetime.utcnow)

class UserPreferences(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    min_odds: float = 1.5
    max_legs: int = 4
    risk_level: str = "medio"  # bajo, medio, alto
    preferred_sports: List[str] = ["soccer"]
    preferred_leagues: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

class MockBet(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    home_team: str
    away_team: str
    selection: str  # home, away, draw
    odds: float
    confidence_score: float
    reasoning: str
    sport: str
    sport_name: str

class MockParlayRecommendation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    parlays: List[List[MockBet]]
    total_odds: List[float]
    risk_levels: List[str]
    potential_payouts: List[float]
    generated_at: datetime = Field(default_factory=datetime.utcnow)

@api_router.get("/")
async def root():
    return {"message": "API del Asistente de Apuestas Deportivas", "status": "activo"}

@api_router.get("/deportes")
async def get_supported_sports():
    """Obtener lista de deportes soportados"""
    return {"deportes": SPORTS_CONFIG}

@api_router.get("/odds/{sport}")
async def get_odds_by_sport(sport: str):
    """Obtener odds en vivo para un deporte específico"""
    if sport not in SPORTS_CONFIG:
        raise HTTPException(status_code=404, detail=f"Deporte '{sport}' no soportado")
    
    try:
        sport_config = SPORTS_CONFIG[sport]
        all_odds = []
        
        async with httpx.AsyncClient() as client:
            # Fetch odds for each league/tournament in this sport
            for api_key in sport_config["api_keys"]:
                try:
                    url = f"https://api.the-odds-api.com/v4/sports/{api_key}/odds"
                    params = {
                        "apiKey": ODDS_API_KEY,
                        "regions": "uk,us,eu",
                        "markets": "h2h,spreads,totals",
                        "oddsFormat": "decimal"
                    }
                    
                    response = await client.get(url, params=params)
                    if response.status_code == 200:
                        odds_data = response.json()
                        
                        for game in odds_data:
                            for bookmaker in game.get('bookmakers', []):
                                for market in bookmaker.get('markets', []):
                                    odds_entry = OddsData(
                                        sport=sport,
                                        sport_name=sport_config["name"],
                                        home_team=game['home_team'],
                                        away_team=game['away_team'],
                                        commence_time=game['commence_time'],
                                        bookmaker=bookmaker['title']
                                    )
                                    
                                    if market['key'] == 'h2h':
                                        outcomes = {outcome['name']: outcome['price'] for outcome in market['outcomes']}
                                        odds_entry.home_odds = outcomes.get(game['home_team'], 0)
                                        odds_entry.away_odds = outcomes.get(game['away_team'], 0)
                                        odds_entry.draw_odds = outcomes.get('Draw', None)
                                    
                                    elif market['key'] == 'spreads':
                                        for outcome in market['outcomes']:
                                            if outcome['name'] == game['home_team']:
                                                odds_entry.spread_home = outcome['point']
                                            elif outcome['name'] == game['away_team']:
                                                odds_entry.spread_away = outcome['point']
                                    
                                    elif market['key'] == 'totals':
                                        for outcome in market['outcomes']:
                                            if outcome['name'] == 'Over':
                                                odds_entry.total_over = outcome['price']
                                            elif outcome['name'] == 'Under':
                                                odds_entry.total_under = outcome['price']
                                    
                                    if odds_entry.home_odds > 0 or odds_entry.away_odds > 0:
                                        all_odds.append(odds_entry)
                
                except Exception as e:
                    logging.warning(f"Error fetching {api_key}: {str(e)}")
                    continue
        
        # Store in database
        if all_odds:
            odds_dicts = [odds.dict() for odds in all_odds]
            await db.odds_data.insert_many(odds_dicts)
        
        return {
            "odds": all_odds[:30], 
            "total_games": len(all_odds),
            "sport": sport_config["name"],
            "emoji": sport_config["emoji"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo odds: {str(e)}")

@api_router.post("/generar/parlay-mock")
async def generate_mock_parlay(preferences: Dict[str, Any]):
    """Generar recomendaciones de parlay temporales (sin IA)"""
    try:
        # Get latest odds from database for selected sports
        selected_sports = preferences.get('preferred_sports', ['soccer'])
        latest_odds = []
        
        for sport in selected_sports:
            sport_odds = await db.odds_data.find({"sport": sport}).sort("fetched_at", -1).limit(20).to_list(20)
            latest_odds.extend(sport_odds)
        
        if not latest_odds:
            raise HTTPException(status_code=404, detail="No hay datos de odds disponibles")
        
        # Filter odds based on preferences
        min_odds = preferences.get('min_odds', 1.5)
        max_legs = preferences.get('max_legs', 4)
        
        filtered_bets = []
        
        for odds in latest_odds:
            # Add home bet if odds meet criteria
            if odds.get('home_odds', 0) >= min_odds:
                filtered_bets.append({
                    'home_team': odds['home_team'],
                    'away_team': odds['away_team'],
                    'selection': 'local',
                    'odds': odds['home_odds'],
                    'sport': odds['sport'],
                    'sport_name': odds['sport_name']
                })
            
            # Add away bet if odds meet criteria
            if odds.get('away_odds', 0) >= min_odds:
                filtered_bets.append({
                    'home_team': odds['home_team'],
                    'away_team': odds['away_team'],
                    'selection': 'visitante',
                    'odds': odds['away_odds'],
                    'sport': odds['sport'],
                    'sport_name': odds['sport_name']
                })
            
            # Add draw bet if available and meets criteria
            if odds.get('draw_odds') and odds['draw_odds'] >= min_odds:
                filtered_bets.append({
                    'home_team': odds['home_team'],
                    'away_team': odds['away_team'],
                    'selection': 'empate',
                    'odds': odds['draw_odds'],
                    'sport': odds['sport'],
                    'sport_name': odds['sport_name']
                })
        
        if len(filtered_bets) < 6:
            raise HTTPException(status_code=404, detail="No hay suficientes apuestas que cumplan los criterios")
        
        # Generate mock parlays with realistic logic
        mock_parlays = []
        risk_levels = ['conservador', 'equilibrado', 'agresivo']
        
        for risk_level in risk_levels:
            parlay_bets = []
            
            if risk_level == 'conservador':
                # Conservative: 2-3 legs, lower odds, higher confidence
                legs = random.randint(2, 3)
                selected_bets = random.sample([b for b in filtered_bets if b['odds'] <= 2.5], min(legs, len(filtered_bets)))
                confidence_range = (75, 90)
            elif risk_level == 'equilibrado':
                # Balanced: 3-4 legs, medium odds, medium confidence  
                legs = random.randint(3, min(4, max_legs))
                selected_bets = random.sample([b for b in filtered_bets if 1.8 <= b['odds'] <= 3.5], min(legs, len(filtered_bets)))
                confidence_range = (60, 80)
            else:  # agresivo
                # Aggressive: 4+ legs, higher odds, lower confidence
                legs = random.randint(4, max_legs)
                selected_bets = random.sample([b for b in filtered_bets if b['odds'] >= 2.0], min(legs, len(filtered_bets)))
                confidence_range = (45, 70)
            
            parlay_odds = 1.0
            for bet in selected_bets:
                confidence = random.randint(confidence_range[0], confidence_range[1])
                
                # Generate realistic reasoning based on bet
                reasoning_options = [
                    f"Buena forma reciente del equipo",
                    f"Valor interesante con odds de {bet['odds']}",
                    f"Estadísticas favorables en casa/visitante",
                    f"Análisis técnico positivo",
                    f"Tendencia histórica favorable"
                ]
                
                mock_bet = MockBet(
                    home_team=bet['home_team'],
                    away_team=bet['away_team'], 
                    selection=bet['selection'],
                    odds=bet['odds'],
                    confidence_score=confidence,
                    reasoning=random.choice(reasoning_options),
                    sport=bet['sport'],
                    sport_name=bet['sport_name']
                )
                
                parlay_bets.append(mock_bet)
                parlay_odds *= bet['odds']
            
            if parlay_bets:
                mock_parlays.append(parlay_bets)
        
        # Calculate total odds and payouts
        total_odds = []
        potential_payouts = []
        
        for parlay in mock_parlays:
            parlay_total = 1.0
            for bet in parlay:
                parlay_total *= bet.odds
            total_odds.append(round(parlay_total, 2))
            potential_payouts.append(round(parlay_total * 10, 2))  # Assuming $10 bet
        
        recommendation = MockParlayRecommendation(
            parlays=mock_parlays,
            total_odds=total_odds,
            risk_levels=risk_levels,
            potential_payouts=potential_payouts
        )
        
        # Store in database
        await db.mock_parlay_recommendations.insert_one(recommendation.dict())
        
        return recommendation
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generando parlays: {str(e)}")

@api_router.get("/historial/parlays")
async def get_parlay_history():
    """Obtener historial reciente de recomendaciones de parlay"""
    try:
        # Get both real and mock recommendations
        real_history = await db.parlay_recommendations.find().sort("generated_at", -1).limit(5).to_list(5)
        mock_history = await db.mock_parlay_recommendations.find().sort("generated_at", -1).limit(10).to_list(10)
        
        return {
            "historial": mock_history + real_history,
            "total": len(mock_history + real_history)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo historial: {str(e)}")

@api_router.post("/favoritos")
async def add_to_favorites(bet_data: Dict[str, Any]):
    """Agregar apuesta a favoritos"""
    try:
        favorite = {
            "id": str(uuid.uuid4()),
            "bet_data": bet_data,
            "created_at": datetime.utcnow()
        }
        
        await db.favorites.insert_one(favorite)
        return {"message": "Agregado a favoritos", "id": favorite["id"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error agregando a favoritos: {str(e)}")

@api_router.get("/favoritos")
async def get_favorites():
    """Obtener apuestas favoritas"""
    try:
        favorites = await db.favorites.find().sort("created_at", -1).limit(20).to_list(20)
        return {"favoritos": favorites}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo favoritos: {str(e)}")

@api_router.post("/calcular/parlay")
async def calculate_parlay_odds(bets: List[Dict[str, Any]]):
    """Calcular odds totales de un parlay manualmente"""
    try:
        if not bets:
            raise HTTPException(status_code=400, detail="No se proporcionaron apuestas")
        
        total_odds = 1.0
        total_bets = len(bets)
        
        for bet in bets:
            bet_odds = bet.get('odds', 1.0)
            total_odds *= bet_odds
        
        # Calculate different stake payouts
        payouts = {
            "10": round(total_odds * 10, 2),
            "25": round(total_odds * 25, 2), 
            "50": round(total_odds * 50, 2),
            "100": round(total_odds * 100, 2)
        }
        
        return {
            "total_odds": round(total_odds, 2),
            "total_bets": total_bets,
            "potential_payouts": payouts,
            "probability": round(100 / total_odds, 2) if total_odds > 0 else 0
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculando parlay: {str(e)}")

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