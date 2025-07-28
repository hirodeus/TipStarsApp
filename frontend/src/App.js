import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SoccerOdds = ({ odds, onSelectBet }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-gray-800">
          {odds.home_team} vs {odds.away_team}
        </h3>
        <span className="text-sm text-gray-500">{odds.bookmaker}</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => onSelectBet({...odds, selection: 'home', selectedOdds: odds.home_odds})}
          className="bg-green-100 hover:bg-green-200 text-green-800 py-2 px-4 rounded transition-colors"
        >
          <div className="text-xs text-gray-600">Home</div>
          <div className="font-bold">{odds.home_odds}</div>
        </button>
        {odds.draw_odds && (
          <button
            onClick={() => onSelectBet({...odds, selection: 'draw', selectedOdds: odds.draw_odds})}
            className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 py-2 px-4 rounded transition-colors"
          >
            <div className="text-xs text-gray-600">Draw</div>
            <div className="font-bold">{odds.draw_odds}</div>
          </button>
        )}
        <button
          onClick={() => onSelectBet({...odds, selection: 'away', selectedOdds: odds.away_odds})}
          className="bg-blue-100 hover:bg-blue-200 text-blue-800 py-2 px-4 rounded transition-colors"
        >
          <div className="text-xs text-gray-600">Away</div>
          <div className="font-bold">{odds.away_odds}</div>
        </button>
      </div>
    </div>
  );
};

const ParlayCard = ({ parlay, totalOdds, riskLevel, potentialPayout }) => {
  const getRiskColor = (risk) => {
    switch(risk) {
      case 'conservative': return 'text-green-600 bg-green-100';
      case 'balanced': return 'text-yellow-600 bg-yellow-100';
      case 'aggressive': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4 border-l-4 border-blue-500">
      <div className="flex justify-between items-center mb-3">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(riskLevel)}`}>
          {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)}
        </span>
        <div className="text-right">
          <div className="text-sm text-gray-600">Total Odds</div>
          <div className="text-lg font-bold text-blue-600">{totalOdds}</div>
        </div>
      </div>
      
      <div className="space-y-2 mb-3">
        {parlay.map((bet, index) => (
          <div key={index} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
            <div>
              <div className="font-medium text-sm">{bet.home_team} vs {bet.away_team}</div>
              <div className="text-xs text-gray-600">Pick: {bet.selection}</div>
            </div>
            <div className="text-right">
              <div className="font-bold text-green-600">{bet.odds}</div>
              <div className="text-xs text-gray-500">Score: {bet.confidence_score}</div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="border-t pt-3 flex justify-between items-center">
        <span className="text-sm text-gray-600">Potential Payout ($10 bet)</span>
        <span className="text-lg font-bold text-green-600">${potentialPayout}</span>
      </div>
    </div>
  );
};

const UserPreferencesForm = ({ preferences, onUpdate }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Preferences</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Min Odds</label>
          <input
            type="number"
            step="0.1"
            value={preferences.min_odds}
            onChange={(e) => onUpdate({...preferences, min_odds: parseFloat(e.target.value)})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Max Legs</label>
          <select
            value={preferences.max_legs}
            onChange={(e) => onUpdate({...preferences, max_legs: parseInt(e.target.value)})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Risk Level</label>
          <select
            value={preferences.risk_level}
            onChange={(e) => onUpdate({...preferences, risk_level: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="low">Low Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="high">High Risk</option>
          </select>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [odds, setOdds] = useState([]);
  const [parlayRecommendations, setParlayRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    min_odds: 1.5,
    max_legs: 4,
    risk_level: 'medium'
  });
  const [selectedBets, setSelectedBets] = useState([]);

  const fetchOdds = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/odds/soccer`);
      setOdds(response.data.odds || []);
    } catch (error) {
      console.error('Error fetching odds:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateParlays = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API}/generate/parlay`, preferences);
      setParlayRecommendations(response.data);
    } catch (error) {
      console.error('Error generating parlays:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBet = (bet) => {
    setSelectedBets(prev => [...prev, bet]);
  };

  useEffect(() => {
    fetchOdds();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">⚽</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                AI Sports Betting Assistant
              </h1>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={fetchOdds}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Refresh Odds'}
              </button>
              <button
                onClick={generateParlays}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Generate AI Parlays
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Preferences */}
        <UserPreferencesForm 
          preferences={preferences} 
          onUpdate={setPreferences} 
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Live Odds Section */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Live Soccer Odds
              </h2>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                {odds.length} Games Available
              </span>
            </div>
            
            <div className="max-h-96 overflow-y-auto space-y-4">
              {odds.length > 0 ? (
                odds.slice(0, 10).map((odd, index) => (
                  <SoccerOdds 
                    key={index} 
                    odds={odd} 
                    onSelectBet={handleSelectBet}
                  />
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-500 mb-4">No odds available</div>
                  <button
                    onClick={fetchOdds}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Fetch Live Odds
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* AI Parlay Recommendations */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                AI Parlay Recommendations
              </h2>
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                Powered by AI
              </span>
            </div>

            {parlayRecommendations ? (
              <div className="space-y-4">
                {parlayRecommendations.parlays.map((parlay, index) => (
                  <ParlayCard
                    key={index}
                    parlay={parlay}
                    totalOdds={parlayRecommendations.total_odds[index]}
                    riskLevel={parlayRecommendations.risk_levels[index]}
                    potentialPayout={parlayRecommendations.potential_payouts[index]}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="text-6xl mb-4">🤖</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  AI-Powered Analysis Ready
                </h3>
                <p className="text-gray-600 mb-4">
                  Click "Generate AI Parlays" to get intelligent betting recommendations based on live odds and advanced analysis.
                </p>
                <div className="grid grid-cols-3 gap-4 text-sm text-gray-500">
                  <div>
                    <div className="font-medium">Smart Filtering</div>
                    <div>Based on your preferences</div>
                  </div>
                  <div>
                    <div className="font-medium">Risk Analysis</div>
                    <div>AI-scored confidence levels</div>
                  </div>
                  <div>
                    <div className="font-medium">Value Detection</div>
                    <div>Optimal odds combinations</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Selected Bets Preview */}
        {selectedBets.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Your Selected Bets ({selectedBets.length})
            </h3>
            <div className="bg-white rounded-lg shadow-md p-4">
              {selectedBets.map((bet, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                  <span>{bet.home_team} vs {bet.away_team} - {bet.selection}</span>
                  <span className="font-bold text-green-600">{bet.selectedOdds}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;