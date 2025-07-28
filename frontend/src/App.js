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
  const [selectedSport, setSelectedSport] = useState('esports'); // Start with esports to test
  const [odds, setOdds] = useState([]);
  const [loading, setLoading] = useState(false);
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

  const handleSportChange = (sport) => {
    setSelectedSport(sport);
    setOdds([]);
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

        {/* Live Odds Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
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
                description={`No se encontraron juegos de ${sportConfig.name} en este momento. Esto es normal - los datos dependen de si hay eventos en vivo.`}
                action="Actualizar Odds"
                onAction={() => fetchOdds()}
              />
            )}
          </div>
        </div>

        {/* Manual Parlay Calculator */}
        <ManualParlayCalculator 
          selectedBets={selectedBets}
          onRemoveBet={removeBet}
        />

        {/* Info Panel */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mt-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
            <span>💡</span>
            <span>¿Cómo funciona?</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold text-blue-800 mb-2">🆓 Funciones Gratuitas:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>✅ Ver odds de {Object.keys(SPORTS_CONFIG).length} deportes diferentes</li>
                <li>✅ Seleccionar apuestas manualmente</li>
                <li>✅ Calculadora automática de parlays</li>
                <li>✅ Cálculo de probabilidades y ganancias</li>
                <li>✅ Interfaz completamente en español</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-green-800 mb-2">🤖 Con tu API Key OpenAI:</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>✅ Análisis inteligente de cada apuesta</li>
                <li>✅ Scores de confianza basados en IA</li>
                <li>✅ Generación automática de parlays óptimos</li>
                <li>✅ Recomendaciones personalizadas por riesgo</li>
                <li>✅ Análisis de tendencias y estadísticas</li>
              </ul>
              <button
                onClick={() => setShowApiModal(true)}
                className="mt-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all"
              >
                Configurar API Key
              </button>
            </div>
          </div>
        </div>
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