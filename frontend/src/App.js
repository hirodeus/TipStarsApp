import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Sports configuration
const SPORTS_CONFIG = {
  soccer: { name: "Fútbol", emoji: "⚽", color: "emerald" },
  basketball: { name: "NBA", emoji: "🏀", color: "orange" },
  americanfootball: { name: "NFL", emoji: "🏈", color: "purple" },
  tennis: { name: "Tenis", emoji: "🎾", color: "green" },
  esports: { name: "Esports", emoji: "🎮", color: "blue" }
};

const ApiKeyModal = ({ isOpen, onClose, onSave, currentKey }) => {
  const [apiKey, setApiKey] = useState(currentKey || '');
  
  if (!isOpen) return null;

  const handleSave = () => {
    onSave(apiKey);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="flex items-center space-x-3 mb-6">
          <span className="text-3xl">🔑</span>
          <h3 className="text-2xl font-bold text-gray-800">Configurar API Key</h3>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            OpenAI API Key (Opcional)
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-proj-..."
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          <p className="text-xs text-gray-500 mt-2">
            💡 Con tu API key personal podrás usar todas las funciones de IA
          </p>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h4 className="font-bold text-blue-800 mb-2">🆓 Sin API Key:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>✅ Ver odds de todos los deportes</li>
            <li>✅ Calculadora manual de parlays</li>
            <li>✅ Sistema de favoritos</li>
          </ul>
          
          <h4 className="font-bold text-green-800 mb-2 mt-3">🤖 Con API Key:</h4>
          <ul className="text-sm text-green-700 space-y-1">
            <li>✅ Análisis IA de apuestas</li>
            <li>✅ Generación automática de parlays</li>
            <li>✅ Recomendaciones personalizadas</li>
          </ul>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

const SportSelector = ({ selectedSport, onSportChange, loading }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        🏆 Selecciona tu Deporte
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {Object.entries(SPORTS_CONFIG).map(([key, sport]) => (
          <button
            key={key}
            onClick={() => onSportChange(key)}
            disabled={loading}
            className={`relative p-4 rounded-lg transition-all duration-300 transform hover:scale-105 ${
              selectedSport === key
                ? `bg-gradient-to-r from-${sport.color}-500 to-${sport.color}-600 text-white shadow-lg`
                : "bg-gray-50 hover:bg-gray-100 text-gray-700"
            } disabled:opacity-50`}
          >
            <div className="text-2xl mb-1">{sport.emoji}</div>
            <div className="font-medium text-sm">{sport.name}</div>
            {selectedSport === key && (
              <div className="absolute top-1 right-1 w-3 h-3 bg-white rounded-full"></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

const OddsCard = ({ odds, onSelectBet, sportConfig }) => {
  const formatTime = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleDateString('es-ES', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 mb-4 border-l-4 border-gradient-to-b from-blue-500 to-purple-600">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{sportConfig.emoji}</span>
          <div>
            <h3 className="text-lg font-bold text-gray-800">
              {odds.home_team} vs {odds.away_team}
            </h3>
            <p className="text-sm text-gray-500">{formatTime(odds.commence_time)}</p>
          </div>
        </div>
        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
          {odds.bookmaker}
        </span>
      </div>
      
      <div className={`grid ${odds.draw_odds ? 'grid-cols-3' : 'grid-cols-2'} gap-3`}>
        <button
          onClick={() => onSelectBet({...odds, selection: 'local', selectedOdds: odds.home_odds})}
          className="bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md"
        >
          <div className="text-xs font-medium opacity-90">Local</div>
          <div className="text-lg font-bold">{odds.home_odds}</div>
        </button>
        
        {odds.draw_odds && (
          <button
            onClick={() => onSelectBet({...odds, selection: 'empate', selectedOdds: odds.draw_odds})}
            className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md"
          >
            <div className="text-xs font-medium opacity-90">Empate</div>
            <div className="text-lg font-bold">{odds.draw_odds}</div>
          </button>
        )}
        
        <button
          onClick={() => onSelectBet({...odds, selection: 'visitante', selectedOdds: odds.away_odds})}
          className="bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md"
        >
          <div className="text-xs font-medium opacity-90">Visitante</div>
          <div className="text-lg font-bold">{odds.away_odds}</div>
        </button>
      </div>
    </div>
  );
};

const ParlayCard = ({ parlay, totalOdds, riskLevel, potentialPayout, index }) => {
  const getRiskStyle = (risk) => {
    switch(risk) {
      case 'conservador': 
        return {
          bg: 'bg-gradient-to-r from-green-500 to-emerald-600',
          text: 'text-green-600',
          bgLight: 'bg-green-50',
          icon: '🛡️'
        };
      case 'equilibrado': 
        return {
          bg: 'bg-gradient-to-r from-yellow-500 to-orange-500',
          text: 'text-yellow-600', 
          bgLight: 'bg-yellow-50',
          icon: '⚖️'
        };
      case 'agresivo': 
        return {
          bg: 'bg-gradient-to-r from-red-500 to-pink-600',
          text: 'text-red-600',
          bgLight: 'bg-red-50',
          icon: '🚀'
        };
      default: 
        return {
          bg: 'bg-gradient-to-r from-gray-500 to-gray-600',
          text: 'text-gray-600',
          bgLight: 'bg-gray-50',
          icon: '📊'
        };
    }
  };

  const riskStyle = getRiskStyle(riskLevel);

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 mb-6 border-l-4 border-gradient-to-b from-purple-500 to-pink-500">
      <div className="flex justify-between items-center mb-4">
        <div className={`${riskStyle.bg} text-white px-4 py-2 rounded-full flex items-center space-x-2`}>
          <span>{riskStyle.icon}</span>
          <span className="font-bold text-sm">
            {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)}
          </span>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500 font-medium">Odds Totales</div>
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {totalOdds}
          </div>
        </div>
      </div>
      
      <div className="space-y-3 mb-4">
        {parlay.map((bet, betIndex) => (
          <div key={betIndex} className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-lg">{SPORTS_CONFIG[bet.sport]?.emoji || '⚽'}</span>
                <div className="font-semibold text-gray-800 text-sm">
                  {bet.home_team} vs {bet.away_team}
                </div>
              </div>
              <div className="text-xs text-gray-600 flex items-center space-x-2">
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  {bet.selection}
                </span>
                <span>• {bet.reasoning}</span>
              </div>
            </div>
            <div className="text-right ml-4">
              <div className="font-bold text-green-600 text-lg">{bet.odds}</div>
              <div className="text-xs text-gray-500 flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                {bet.confidence_score}% confianza
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="border-t pt-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-sm text-gray-600 font-medium">Ganancia Potencial (€10)</span>
            <div className="text-xs text-gray-500">{parlay.length} selecciones</div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-green-600">€{potentialPayout}</span>
            <div className="text-xs text-gray-500">+{((potentialPayout - 10) / 10 * 100).toFixed(0)}% ROI</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserPreferencesForm = ({ preferences, onUpdate }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
        ⚙️ Tus Preferencias de Apuesta
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Odds Mínimas
          </label>
          <input
            type="number"
            step="0.1"
            min="1.0"
            max="5.0"
            value={preferences.min_odds}
            onChange={(e) => onUpdate({...preferences, min_odds: parseFloat(e.target.value)})}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          <p className="text-xs text-gray-500 mt-1">Valor mínimo por selección</p>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Máximo de Selecciones
          </label>
          <select
            value={preferences.max_legs}
            onChange={(e) => onUpdate({...preferences, max_legs: parseInt(e.target.value)})}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value={2}>2 selecciones</option>
            <option value={3}>3 selecciones</option>
            <option value={4}>4 selecciones</option>
            <option value={5}>5 selecciones</option>
            <option value={6}>6 selecciones</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">Máximo por parlay</p>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Nivel de Riesgo
          </label>
          <select
            value={preferences.risk_level}
            onChange={(e) => onUpdate({...preferences, risk_level: e.target.value})}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value="bajo">🛡️ Riesgo Bajo</option>
            <option value="medio">⚖️ Riesgo Medio</option>
            <option value="alto">🚀 Riesgo Alto</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">Tu tolerancia al riesgo</p>
        </div>
      </div>
    </div>
  );
};

const LoadingSpinner = ({ text = "Cargando..." }) => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500 mr-4"></div>
    <span className="text-gray-600 font-medium">{text}</span>
  </div>
);

const EmptyState = ({ title, description, action, onAction }) => (
  <div className="bg-white rounded-xl shadow-lg p-8 text-center">
    <div className="text-gray-400 text-6xl mb-4">📊</div>
    <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-600 mb-6">{description}</p>
    {action && (
      <button
        onClick={onAction}
        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
      >
        {action}
      </button>
    )}
  </div>
);

const ManualParlayCalculator = ({ selectedBets, onRemoveBet }) => {
  if (selectedBets.length === 0) return null;

  const calculateTotalOdds = () => {
    return selectedBets.reduce((total, bet) => total * bet.selectedOdds, 1);
  };

  const totalOdds = calculateTotalOdds();
  const stakes = [10, 25, 50, 100];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
        <span>🧮</span>
        <span>Calculadora de Parlay ({selectedBets.length} selecciones)</span>
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-bold text-gray-700 mb-3">Tus Selecciones:</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {selectedBets.map((bet, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{SPORTS_CONFIG[bet.sport]?.emoji || '⚽'}</span>
                  <div>
                    <div className="font-medium text-sm text-gray-800">
                      {bet.home_team} vs {bet.away_team}
                    </div>
                    <div className="text-xs text-gray-600">
                      {bet.selection} • {bet.selectedOdds}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onRemoveBet(index)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  ❌
                </button>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="font-bold text-gray-700 mb-3">Ganancias Potenciales:</h4>
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 mb-4">
            <div className="text-center mb-3">
              <div className="text-sm text-gray-600">Odds Totales</div>
              <div className="text-3xl font-bold text-green-600">{totalOdds.toFixed(2)}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {stakes.map(stake => (
              <div key={stake} className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-sm text-gray-600">Apuesta €{stake}</div>
                <div className="text-lg font-bold text-green-600">
                  €{(totalOdds * stake).toFixed(2)}
                </div>
                <div className="text-xs text-gray-500">
                  +€{((totalOdds - 1) * stake).toFixed(2)} ganancia
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-center">
            <div className="text-xs text-gray-500">
              Probabilidad implícita: {(100 / totalOdds).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [selectedSport, setSelectedSport] = useState('soccer');
  const [odds, setOdds] = useState([]);
  const [parlayRecommendations, setParlayRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    min_odds: 1.5,
    max_legs: 4,
    risk_level: 'medio',
    preferred_sports: ['soccer']
  });
  const [selectedBets, setSelectedBets] = useState([]);
  const [showApiModal, setShowApiModal] = useState(false);
  const [userApiKey, setUserApiKey] = useState(localStorage.getItem('openai_api_key') || '');
  const [aiMode, setAiMode] = useState(false);

  const fetchOdds = async (sport = selectedSport) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/odds/${sport}`);
      setOdds(response.data.odds || []);
    } catch (error) {
      console.error('Error obteniendo odds:', error);
      setOdds([]);
    } finally {
      setLoading(false);
    }
  };

  const generateMockParlays = async () => {
    setLoading(true);
    try {
      const updatedPreferences = {
        ...preferences,
        preferred_sports: [selectedSport]
      };
      
      const response = await axios.post(`${API}/generar/parlay-mock`, updatedPreferences);
      setParlayRecommendations(response.data);
    } catch (error) {
      console.error('Error generando parlays:', error);
      setParlayRecommendations(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSportChange = (sport) => {
    setSelectedSport(sport);
    setOdds([]);
    setParlayRecommendations(null);
    setSelectedBets([]);
    fetchOdds(sport);
  };

  const handleSelectBet = (bet) => {
    const exists = selectedBets.find(b => 
      b.home_team === bet.home_team && 
      b.away_team === bet.away_team && 
      b.selection === bet.selection
    );
    
    if (!exists) {
      setSelectedBets(prev => [...prev, {...bet, sport: selectedSport}]);
    }
  };

  const removeBet = (index) => {
    setSelectedBets(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveApiKey = (apiKey) => {
    setUserApiKey(apiKey);
    localStorage.setItem('openai_api_key', apiKey);
    setAiMode(!!apiKey);
  };

  useEffect(() => {
    fetchOdds();
    setAiMode(!!userApiKey);
  }, []);

  const sportConfig = SPORTS_CONFIG[selectedSport];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-gradient-to-r from-blue-500 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">🏆</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Asistente de Apuestas IA
                </h1>
                <p className="text-gray-500 text-sm font-medium">
                  Análisis inteligente • Recomendaciones personalizadas
                  {aiMode ? ' • 🤖 Modo IA Activado' : ' • 🆓 Modo Gratuito'}
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowApiModal(true)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                  aiMode 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                    : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
                }`}
              >
                {aiMode ? '🤖 IA Activa' : '🔑 Activar IA'}
              </button>
              <button
                onClick={() => fetchOdds()}
                disabled={loading}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg"
              >
                {loading ? '🔄 Actualizando...' : '🔄 Actualizar Odds'}
              </button>
              <button
                onClick={generateMockParlays}
                disabled={loading || odds.length === 0}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg"
              >
                {loading ? '🤖 Generando...' : (aiMode ? '🤖 Parlays IA' : '📊 Parlays Mock')}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Sport Selector */}
        <SportSelector 
          selectedSport={selectedSport}
          onSportChange={handleSportChange}
          loading={loading}
        />

        {/* User Preferences */}
        <UserPreferencesForm 
          preferences={preferences} 
          onUpdate={setPreferences} 
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Live Odds Section */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
                <span>{sportConfig.emoji}</span>
                <span>Odds en Vivo - {sportConfig.name}</span>
              </h2>
              <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                📊 {odds.length} Juegos Disponibles
              </span>
            </div>
            
            <div className="max-h-96 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-200">
              {loading ? (
                <LoadingSpinner text="Obteniendo odds en vivo..." />
              ) : odds.length > 0 ? (
                odds.slice(0, 15).map((odd, index) => (
                  <OddsCard 
                    key={`${odd.home_team}-${odd.away_team}-${index}`} 
                    odds={odd} 
                    onSelectBet={handleSelectBet}
                    sportConfig={sportConfig}
                  />
                ))
              ) : (
                <EmptyState
                  title="No hay odds disponibles"
                  description={`No se encontraron juegos de ${sportConfig.name} en este momento`}
                  action="Actualizar Odds"
                  onAction={() => fetchOdds()}
                />
              )}
            </div>
          </div>

          {/* AI Parlay Recommendations */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
                <span>{aiMode ? '🤖' : '📊'}</span>
                <span>{aiMode ? 'Recomendaciones IA' : 'Parlays Mock'}</span>
              </h2>
              <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-lg ${
                aiMode 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                  : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
              }`}>
                {aiMode ? '✨ Powered by IA' : '🆓 Modo Demo'}
              </span>
            </div>

            {loading ? (
              <LoadingSpinner text="Generando parlays inteligentes..." />
            ) : parlayRecommendations ? (
              <div className="space-y-6">
                {parlayRecommendations.parlays.map((parlay, index) => (
                  <ParlayCard
                    key={index}
                    parlay={parlay}
                    totalOdds={parlayRecommendations.total_odds[index]}
                    riskLevel={parlayRecommendations.risk_levels[index]}
                    potentialPayout={parlayRecommendations.potential_payouts[index]}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title={aiMode ? "IA Lista para Analizar" : "Generador Mock Listo"}
                description={aiMode 
                  ? "Haz clic para obtener recomendaciones inteligentes basadas en análisis avanzado con IA."
                  : "Genera parlays de ejemplo para probar la funcionalidad mientras configuras tu API key."
                }
                action="Generar Parlays"
                onAction={generateMockParlays}
              />
            )}
          </div>
        </div>

        {/* Manual Parlay Calculator */}
        <ManualParlayCalculator 
          selectedBets={selectedBets}
          onRemoveBet={removeBet}
        />
      </div>

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={showApiModal}
        onClose={() => setShowApiModal(false)}
        onSave={handleSaveApiKey}
        currentKey={userApiKey}
      />
    </div>
  );
}

export default App;
            key={key}
            onClick={() => onSportChange(key)}
            disabled={loading}
            className={`relative p-4 rounded-lg transition-all duration-300 transform hover:scale-105 ${
              selectedSport === key
                ? `bg-gradient-to-r from-${sport.color}-500 to-${sport.color}-600 text-white shadow-lg`
                : "bg-gray-50 hover:bg-gray-100 text-gray-700"
            } disabled:opacity-50`}
          >
            <div className="text-2xl mb-1">{sport.emoji}</div>
            <div className="font-medium text-sm">{sport.name}</div>
            {selectedSport === key && (
              <div className="absolute top-1 right-1 w-3 h-3 bg-white rounded-full"></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

const OddsCard = ({ odds, onSelectBet, sportConfig }) => {
  const formatTime = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleDateString('es-ES', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 mb-4 border-l-4 border-gradient-to-b from-blue-500 to-purple-600">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{sportConfig.emoji}</span>
          <div>
            <h3 className="text-lg font-bold text-gray-800">
              {odds.home_team} vs {odds.away_team}
            </h3>
            <p className="text-sm text-gray-500">{formatTime(odds.commence_time)}</p>
          </div>
        </div>
        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
          {odds.bookmaker}
        </span>
      </div>
      
      <div className={`grid ${odds.draw_odds ? 'grid-cols-3' : 'grid-cols-2'} gap-3`}>
        <button
          onClick={() => onSelectBet({...odds, selection: 'local', selectedOdds: odds.home_odds})}
          className="bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md"
        >
          <div className="text-xs font-medium opacity-90">Local</div>
          <div className="text-lg font-bold">{odds.home_odds}</div>
        </button>
        
        {odds.draw_odds && (
          <button
            onClick={() => onSelectBet({...odds, selection: 'empate', selectedOdds: odds.draw_odds})}
            className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md"
          >
            <div className="text-xs font-medium opacity-90">Empate</div>
            <div className="text-lg font-bold">{odds.draw_odds}</div>
          </button>
        )}
        
        <button
          onClick={() => onSelectBet({...odds, selection: 'visitante', selectedOdds: odds.away_odds})}
          className="bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md"
        >
          <div className="text-xs font-medium opacity-90">Visitante</div>
          <div className="text-lg font-bold">{odds.away_odds}</div>
        </button>
      </div>
    </div>
  );
};

const ParlayCard = ({ parlay, totalOdds, riskLevel, potentialPayout, index }) => {
  const getRiskStyle = (risk) => {
    switch(risk) {
      case 'conservador': 
        return {
          bg: 'bg-gradient-to-r from-green-500 to-emerald-600',
          text: 'text-green-600',
          bgLight: 'bg-green-50',
          icon: '🛡️'
        };
      case 'equilibrado': 
        return {
          bg: 'bg-gradient-to-r from-yellow-500 to-orange-500',
          text: 'text-yellow-600', 
          bgLight: 'bg-yellow-50',
          icon: '⚖️'
        };
      case 'agresivo': 
        return {
          bg: 'bg-gradient-to-r from-red-500 to-pink-600',
          text: 'text-red-600',
          bgLight: 'bg-red-50',
          icon: '🚀'
        };
      default: 
        return {
          bg: 'bg-gradient-to-r from-gray-500 to-gray-600',
          text: 'text-gray-600',
          bgLight: 'bg-gray-50',
          icon: '📊'
        };
    }
  };

  const riskStyle = getRiskStyle(riskLevel);

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 mb-6 border-l-4 border-gradient-to-b from-purple-500 to-pink-500">
      <div className="flex justify-between items-center mb-4">
        <div className={`${riskStyle.bg} text-white px-4 py-2 rounded-full flex items-center space-x-2`}>
          <span>{riskStyle.icon}</span>
          <span className="font-bold text-sm">
            {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)}
          </span>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500 font-medium">Odds Totales</div>
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {totalOdds}
          </div>
        </div>
      </div>
      
      <div className="space-y-3 mb-4">
        {parlay.map((bet, betIndex) => (
          <div key={betIndex} className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-lg">{SPORTS_CONFIG[bet.sport]?.emoji || '⚽'}</span>
                <div className="font-semibold text-gray-800 text-sm">
                  {bet.home_team} vs {bet.away_team}
                </div>
              </div>
              <div className="text-xs text-gray-600 flex items-center space-x-2">
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  {bet.selection}
                </span>
                <span>• {bet.reasoning}</span>
              </div>
            </div>
            <div className="text-right ml-4">
              <div className="font-bold text-green-600 text-lg">{bet.odds}</div>
              <div className="text-xs text-gray-500 flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                {bet.confidence_score}% confianza
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="border-t pt-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-sm text-gray-600 font-medium">Ganancia Potencial (€10)</span>
            <div className="text-xs text-gray-500">{parlay.length} selecciones</div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-green-600">€{potentialPayout}</span>
            <div className="text-xs text-gray-500">+{((potentialPayout - 10) / 10 * 100).toFixed(0)}% ROI</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserPreferencesForm = ({ preferences, onUpdate }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
        ⚙️ Tus Preferencias de Apuesta
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Odds Mínimas
          </label>
          <input
            type="number"
            step="0.1"
            min="1.0"
            max="5.0"
            value={preferences.min_odds}
            onChange={(e) => onUpdate({...preferences, min_odds: parseFloat(e.target.value)})}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          <p className="text-xs text-gray-500 mt-1">Valor mínimo por selección</p>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Máximo de Selecciones
          </label>
          <select
            value={preferences.max_legs}
            onChange={(e) => onUpdate({...preferences, max_legs: parseInt(e.target.value)})}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value={2}>2 selecciones</option>
            <option value={3}>3 selecciones</option>
            <option value={4}>4 selecciones</option>
            <option value={5}>5 selecciones</option>
            <option value={6}>6 selecciones</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">Máximo por parlay</p>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Nivel de Riesgo
          </label>
          <select
            value={preferences.risk_level}
            onChange={(e) => onUpdate({...preferences, risk_level: e.target.value})}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value="bajo">🛡️ Riesgo Bajo</option>
            <option value="medio">⚖️ Riesgo Medio</option>
            <option value="alto">🚀 Riesgo Alto</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">Tu tolerancia al riesgo</p>
        </div>
      </div>
    </div>
  );
};

const LoadingSpinner = ({ text = "Cargando..." }) => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500 mr-4"></div>
    <span className="text-gray-600 font-medium">{text}</span>
  </div>
);

const EmptyState = ({ title, description, action, onAction }) => (
  <div className="bg-white rounded-xl shadow-lg p-8 text-center">
    <div className="text-gray-400 text-6xl mb-4">📊</div>
    <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-600 mb-6">{description}</p>
    {action && (
      <button
        onClick={onAction}
        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
      >
        {action}
      </button>
    )}
  </div>
);

function App() {
  const [selectedSport, setSelectedSport] = useState('soccer');
  const [odds, setOdds] = useState([]);
  const [parlayRecommendations, setParlayRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    min_odds: 1.5,
    max_legs: 4,
    risk_level: 'medio',
    preferred_sports: ['soccer']
  });
  const [selectedBets, setSelectedBets] = useState([]);

  const fetchOdds = async (sport = selectedSport) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/odds/${sport}`);
      setOdds(response.data.odds || []);
    } catch (error) {
      console.error('Error obteniendo odds:', error);
      setOdds([]);
    } finally {
      setLoading(false);
    }
  };

  const generateMockParlays = async () => {
    setLoading(true);
    try {
      const updatedPreferences = {
        ...preferences,
        preferred_sports: [selectedSport]
      };
      
      const response = await axios.post(`${API}/generar/parlay-mock`, updatedPreferences);
      setParlayRecommendations(response.data);
    } catch (error) {
      console.error('Error generando parlays:', error);
      setParlayRecommendations(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSportChange = (sport) => {
    setSelectedSport(sport);
    setOdds([]);
    setParlayRecommendations(null);
    fetchOdds(sport);
  };

  const handleSelectBet = (bet) => {
    const exists = selectedBets.find(b => 
      b.home_team === bet.home_team && 
      b.away_team === bet.away_team && 
      b.selection === bet.selection
    );
    
    if (!exists) {
      setSelectedBets(prev => [...prev, bet]);
    }
  };

  const removeBet = (index) => {
    setSelectedBets(prev => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    fetchOdds();
  }, []);

  const sportConfig = SPORTS_CONFIG[selectedSport];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-gradient-to-r from-blue-500 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">🏆</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Asistente de Apuestas IA
                </h1>
                <p className="text-gray-500 text-sm font-medium">Análisis inteligente • Recomendaciones personalizadas</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => fetchOdds()}
                disabled={loading}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg"
              >
                {loading ? '🔄 Actualizando...' : '🔄 Actualizar Odds'}
              </button>
              <button
                onClick={generateMockParlays}
                disabled={loading || odds.length === 0}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg"
              >
                {loading ? '🤖 Generando...' : '🤖 Generar Parlays IA'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Sport Selector */}
        <SportSelector 
          selectedSport={selectedSport}
          onSportChange={handleSportChange}
          loading={loading}
        />

        {/* User Preferences */}
        <UserPreferencesForm 
          preferences={preferences} 
          onUpdate={setPreferences} 
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Live Odds Section */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
                <span>{sportConfig.emoji}</span>
                <span>Odds en Vivo - {sportConfig.name}</span>
              </h2>
              <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                📊 {odds.length} Juegos Disponibles
              </span>
            </div>
            
            <div className="max-h-96 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-200">
              {loading ? (
                <LoadingSpinner text="Obteniendo odds en vivo..." />
              ) : odds.length > 0 ? (
                odds.slice(0, 15).map((odd, index) => (
                  <OddsCard 
                    key={`${odd.home_team}-${odd.away_team}-${index}`} 
                    odds={odd} 
                    onSelectBet={handleSelectBet}
                    sportConfig={sportConfig}
                  />
                ))
              ) : (
                <EmptyState
                  title="No hay odds disponibles"
                  description={`No se encontraron juegos de ${sportConfig.name} en este momento`}
                  action="Actualizar Odds"
                  onAction={() => fetchOdds()}
                />
              )}
            </div>
          </div>

          {/* AI Parlay Recommendations */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
                <span>🤖</span>
                <span>Recomendaciones IA</span>
              </h2>
              <span className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                ✨ Powered by IA
              </span>
            </div>

            {loading ? (
              <LoadingSpinner text="Generando parlays inteligentes..." />
            ) : parlayRecommendations ? (
              <div className="space-y-6">
                {parlayRecommendations.parlays.map((parlay, index) => (
                  <ParlayCard
                    key={index}
                    parlay={parlay}
                    totalOdds={parlayRecommendations.total_odds[index]}
                    riskLevel={parlayRecommendations.risk_levels[index]}
                    potentialPayout={parlayRecommendations.potential_payouts[index]}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="IA Lista para Analizar"
                description="Haz clic en 'Generar Parlays IA' para obtener recomendaciones inteligentes basadas en análisis avanzado y tus preferencias."
                action="Generar Parlays"
                onAction={generateMockParlays}
              />
            )}
          </div>
        </div>

        {/* Selected Bets Preview */}
        {selectedBets.length > 0 && (
          <div className="mt-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
                <span>🎯</span>
                <span>Tus Selecciones ({selectedBets.length})</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedBets.map((bet, index) => (
                  <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{SPORTS_CONFIG[bet.sport]?.emoji || '⚽'}</span>
                      <div>
                        <div className="font-semibold text-gray-800">
                          {bet.home_team} vs {bet.away_team}
                        </div>
                        <div className="text-sm text-gray-600">
                          Selección: <span className="font-medium">{bet.selection}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-green-600 text-lg">{bet.selectedOdds}</span>
                      <button
                        onClick={() => removeBet(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        ❌
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;