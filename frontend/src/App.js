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

const TipStarsLogo = () => (
  <div className="flex items-center space-x-3">
    <div className="relative">
      <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-xl transform rotate-12 animate-pulse">
        <span className="text-white font-bold text-2xl transform -rotate-12">⭐</span>
      </div>
      <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
        <span className="text-white text-xs font-bold">🏆</span>
      </div>
    </div>
    <div>
      <h1 className="text-4xl font-black bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
        TipStars
      </h1>
      <div className="flex items-center space-x-2">
        <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          App
        </span>
        <div className="flex space-x-1">
          <span className="w-2 h-2 bg-yellow-400 rounded-full animate-ping"></span>
          <span className="w-2 h-2 bg-orange-400 rounded-full animate-ping" style={{animationDelay: '0.2s'}}></span>
          <span className="w-2 h-2 bg-red-400 rounded-full animate-ping" style={{animationDelay: '0.4s'}}></span>
        </div>
      </div>
    </div>
  </div>
);

const ApiKeyModal = ({ isOpen, onClose, onSave, currentKey }) => {
  const [apiKey, setApiKey] = useState(currentKey || '');
  
  if (!isOpen) return null;

  const handleSave = () => {
    onSave(apiKey);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border-4 border-gradient-to-r from-yellow-400 to-orange-500">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
            <span className="text-white text-2xl">🔑</span>
          </div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
            Configurar API Key
          </h3>
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
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
          />
          <p className="text-xs text-gray-500 mt-2">
            💡 Con tu API key personal podrás usar todas las funciones de IA
          </p>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-6 border border-blue-200">
          <h4 className="font-bold text-blue-800 mb-2 flex items-center">
            <span className="mr-2">🆓</span>Sin API Key:
          </h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>✅ Ver odds de todos los deportes</li>
            <li>✅ Calculadora manual de parlays</li>
            <li>✅ Sistema de favoritos</li>
          </ul>
          
          <h4 className="font-bold text-green-800 mb-2 mt-3 flex items-center">
            <span className="mr-2">🤖</span>Con API Key:
          </h4>
          <ul className="text-sm text-green-700 space-y-1">
            <li>✅ Análisis IA de apuestas</li>
            <li>✅ Generación automática de parlays</li>
            <li>✅ Recomendaciones personalizadas</li>
          </ul>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all transform hover:scale-105"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-3 rounded-xl font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all transform hover:scale-105 shadow-lg"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

const SportSelector = ({ selectedSport, onSportChange, loading, sportsCount }) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <span className="mr-3 text-3xl">🏆</span>
        <span className="bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
          Selecciona tu Deporte
        </span>
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(SPORTS_CONFIG).map(([key, sport]) => {
          const gameCount = sportsCount[key]?.total_games || 0;
          return (
            <button
              key={key}
              onClick={() => onSportChange(key)}
              disabled={loading}
              className={`relative p-6 rounded-xl transition-all duration-300 transform hover:scale-110 hover:rotate-2 ${
                selectedSport === key
                  ? `bg-gradient-to-br from-${sport.color}-400 to-${sport.color}-600 shadow-2xl scale-105`
                  : "bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 text-gray-700 shadow-lg"
              } disabled:opacity-50 border-2 border-white`}
            >
              <div className="text-3xl mb-2 transform transition-transform hover:scale-125">{sport.emoji}</div>
              <div className={`font-bold text-sm ${
                selectedSport === key ? 'text-black' : 'text-gray-700'
              }`}>
                {sport.name}
              </div>
              <div className={`text-xs mt-1 font-semibold ${
                selectedSport === key 
                  ? gameCount > 0 ? 'text-black' : 'text-gray-800'
                  : gameCount > 0 ? 'text-green-600' : 'text-gray-400'
              }`}>
                {gameCount} juegos {gameCount > 0 ? '🟢' : '🔴'}
              </div>
              {selectedSport === key && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-black text-xs font-bold">✓</span>
                </div>
              )}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
          );
        })}
      </div>
      <div className="mt-4 text-center text-sm text-gray-500">
        🟢 = Juegos disponibles ahora • 🔴 = Sin juegos en este momento
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
    <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 mb-4 border-l-4 border-gradient-to-b from-yellow-400 to-orange-500 transform hover:scale-105">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
            <span className="text-2xl">{sportConfig.emoji}</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">
              {odds.home_team} vs {odds.away_team}
            </h3>
            <p className="text-sm text-gray-500 flex items-center">
              <span className="mr-1">📅</span>
              {formatTime(odds.commence_time)}
            </p>
          </div>
        </div>
        <span className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 px-3 py-2 rounded-full text-xs font-bold shadow-md">
          {odds.bookmaker}
        </span>
      </div>
      
      <div className={`grid ${odds.draw_odds ? 'grid-cols-3' : 'grid-cols-2'} gap-3`}>
        <button
          onClick={() => onSelectBet({...odds, selection: 'local', selectedOdds: odds.home_odds})}
          className="bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white py-4 px-4 rounded-xl transition-all duration-200 transform hover:scale-110 shadow-lg hover:shadow-xl"
        >
          <div className="text-xs font-bold opacity-90">LOCAL</div>
          <div className="text-xl font-black">{odds.home_odds}</div>
        </button>
        
        {odds.draw_odds && (
          <button
            onClick={() => onSelectBet({...odds, selection: 'empate', selectedOdds: odds.draw_odds})}
            className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white py-4 px-4 rounded-xl transition-all duration-200 transform hover:scale-110 shadow-lg hover:shadow-xl"
          >
            <div className="text-xs font-bold opacity-90">EMPATE</div>
            <div className="text-xl font-black">{odds.draw_odds}</div>
          </button>
        )}
        
        <button
          onClick={() => onSelectBet({...odds, selection: 'visitante', selectedOdds: odds.away_odds})}
          className="bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 text-white py-4 px-4 rounded-xl transition-all duration-200 transform hover:scale-110 shadow-lg hover:shadow-xl"
        >
          <div className="text-xs font-bold opacity-90">VISITANTE</div>
          <div className="text-xl font-black">{odds.away_odds}</div>
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
    <div className="bg-white rounded-2xl shadow-xl p-8 mt-8 border border-gray-100">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-3">
        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
          <span className="text-white text-2xl">🧮</span>
        </div>
        <span>Calculadora de Parlay ({selectedBets.length} selecciones)</span>
      </h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h4 className="font-bold text-gray-700 mb-4 text-lg flex items-center">
            <span className="mr-2">📋</span>Tus Selecciones:
          </h4>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {selectedBets.map((bet, index) => (
              <div key={index} className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-lg transition-all">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-lg">{SPORTS_CONFIG[bet.sport]?.emoji || '⚽'}</span>
                  </div>
                  <div>
                    <div className="font-bold text-sm text-gray-800">
                      {bet.home_team} vs {bet.away_team}
                    </div>
                    <div className="text-xs text-gray-600 flex items-center space-x-2">
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">
                        {bet.selection}
                      </span>
                      <span className="font-bold text-green-600">{bet.selectedOdds}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onRemoveBet(index)}
                  className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center justify-center"
                >
                  ❌
                </button>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="font-bold text-gray-700 mb-4 text-lg flex items-center">
            <span className="mr-2">💰</span>Ganancias Potenciales:
          </h4>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-6 border-2 border-green-200 shadow-lg">
            <div className="text-center">
              <div className="text-sm text-gray-600 font-medium">Odds Totales</div>
              <div className="text-4xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {totalOdds.toFixed(2)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Probabilidad: {(100 / totalOdds).toFixed(1)}%
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {stakes.map(stake => (
              <div key={stake} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 text-center border border-blue-200 hover:shadow-lg transition-all">
                <div className="text-sm text-gray-600 font-semibold">Apuesta €{stake}</div>
                <div className="text-xl font-black text-green-600">
                  €{(totalOdds * stake).toFixed(2)}
                </div>
                <div className="text-xs text-gray-500">
                  +€{((totalOdds - 1) * stake).toFixed(2)} ganancia
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const LoadingSpinner = ({ text = "Cargando..." }) => (
  <div className="flex items-center justify-center p-12">
    <div className="relative">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-yellow-500 mr-4"></div>
      <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-r-orange-500 animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
    </div>
    <span className="text-gray-700 font-bold text-lg ml-4">{text}</span>
  </div>
);

const EmptyState = ({ title, description, action, onAction }) => (
  <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
    <div className="w-20 h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
      <div className="text-gray-400 text-4xl">📊</div>
    </div>
    <h3 className="text-2xl font-bold text-gray-800 mb-3">{title}</h3>
    <p className="text-gray-600 mb-8 text-lg">{description}</p>
    {action && (
      <button
        onClick={onAction}
        className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
      >
        {action}
      </button>
    )}
  </div>
);

const Footer = () => {
  const openWhatsApp = () => {
    window.open('https://wa.me/18134558994', '_blank');
  };

  return (
    <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo y descripción */}
          <div className="col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">⭐</span>
              </div>
              <div>
                <h3 className="text-2xl font-black bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  TipStars App
                </h3>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Análisis inteligente de apuestas deportivas con IA. 
              Obtén las mejores recomendaciones de parlays basadas en datos en tiempo real.
            </p>
          </div>

          {/* Características */}
          <div className="col-span-1">
            <h4 className="text-lg font-bold text-white mb-4 flex items-center">
              <span className="mr-2">🚀</span>Características
            </h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center">
                <span className="mr-2">⚽</span>5 deportes soportados
              </li>
              <li className="flex items-center">
                <span className="mr-2">🎯</span>Detección juegos en vivo
              </li>
              <li className="flex items-center">
                <span className="mr-2">🤖</span>Análisis IA opcional
              </li>
              <li className="flex items-center">
                <span className="mr-2">🧮</span>Calculadora de parlays
              </li>
              <li className="flex items-center">
                <span className="mr-2">📊</span>Odds en tiempo real
              </li>
              <li className="flex items-center">
                <span className="mr-2">🇪🇸</span>100% en español
              </li>
            </ul>
          </div>

          {/* Desarrollador */}
          <div className="col-span-1">
            <h4 className="text-lg font-bold text-white mb-4 flex items-center">
              <span className="mr-2">👨‍💻</span>Desarrollador
            </h4>
            <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-xl p-4 border border-blue-500/20">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-gradient-to-r from-yellow-400 to-orange-500">
                  <img 
                    src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAD6APoDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD3+iiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD/2Q==" 
                    alt="Deus - Desarrollador" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h5 className="font-bold text-white">Deus</h5>
                  <p className="text-xs text-gray-400">Full-Stack Developer</p>
                </div>
              </div>
              <p className="text-sm text-gray-300 mb-3">
                Especialista en aplicaciones de análisis deportivo y sistemas de IA.
              </p>
              <div className="flex space-x-2 mb-3">
                <span className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded text-xs font-semibold">
                  React
                </span>
                <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs font-semibold">
                  FastAPI
                </span>
                <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs font-semibold">
                  AI/ML
                </span>
              </div>
              <button
                onClick={openWhatsApp}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg flex items-center justify-center"
              >
                <span className="mr-2">📱</span>
                Contactar por WhatsApp
              </button>
            </div>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="border-t border-gray-700 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-400 mb-4 md:mb-0">
              © 2025 TipStars App. Todos los derechos reservados.
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span className="flex items-center">
                <span className="mr-1">⚡</span>
                Powered by Emergent AI
              </span>
              <span className="flex items-center">
                <span className="mr-1">🔒</span>
                Uso responsable de apuestas
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

function App() {
  const [selectedSport, setSelectedSport] = useState('soccer');
  const [odds, setOdds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBets, setSelectedBets] = useState([]);
  const [showApiModal, setShowApiModal] = useState(false);
  const [userApiKey, setUserApiKey] = useState(localStorage.getItem('openai_api_key') || '');
  const [aiMode, setAiMode] = useState(false);
  const [sportsCount, setSportsCount] = useState({});
  const [loadingCounts, setLoadingCounts] = useState(false);

  const fetchSportsCount = async () => {
    setLoadingCounts(true);
    try {
      const response = await axios.get(`${API}/deportes/conteo`, { timeout: 15000 });
      setSportsCount(response.data.sports_count || {});
    } catch (error) {
      console.error('Error obteniendo conteo de deportes:', error);
      // Mock data for demo when backend is not available
      setSportsCount({
        soccer: { name: "Fútbol", emoji: "⚽", total_games: 8 },
        basketball: { name: "NBA", emoji: "🏀", total_games: 3 },
        americanfootball: { name: "NFL", emoji: "🏈", total_games: 0 },
        tennis: { name: "Tenis", emoji: "🎾", total_games: 5 },
        esports: { name: "Esports", emoji: "🎮", total_games: 12 }
      });
    } finally {
      setLoadingCounts(false);
    }
  };

  const fetchOdds = async (sport = selectedSport) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/odds/${sport}`, { timeout: 15000 });
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
    fetchSportsCount();
    // Don't auto-fetch odds on load to avoid errors in production without backend
    setAiMode(!!userApiKey);
  }, []);

  const sportConfig = SPORTS_CONFIG[selectedSport];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 via-purple-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-2xl border-b-4 border-gradient-to-r from-yellow-400 via-orange-500 to-red-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <TipStarsLogo />
            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-right">
                <div className="text-sm font-bold text-gray-600">
                  {aiMode ? '🤖 Modo IA Activado' : '🆓 Modo Gratuito'}
                </div>
                <div className="text-xs text-gray-500">
                  Análisis inteligente • Recomendaciones personalizadas
                </div>
              </div>
              <button
                onClick={() => setShowApiModal(true)}
                className={`px-6 py-3 rounded-xl font-bold transition-all duration-200 transform hover:scale-105 shadow-lg ${
                  aiMode 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
                    : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700'
                }`}
              >
                {aiMode ? '🤖 IA Activa' : '🔑 Activar IA'}
              </button>
              <button
                onClick={() => {
                  fetchOdds();
                  fetchSportsCount();
                }}
                disabled={loading}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg"
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
          loading={loading || loadingCounts}
          sportsCount={sportsCount}
        />

        {/* Live Odds Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">{sportConfig.emoji}</span>
              </div>
              <span>Odds en Vivo - {sportConfig.name}</span>
            </h2>
            <div className="flex items-center space-x-3">
              <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-full text-sm font-bold shadow-lg flex items-center">
                <span className="mr-2">📊</span>
                {odds.length} Juegos Disponibles
              </span>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-yellow-500 scrollbar-track-gray-200">
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
        <div className="bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 rounded-2xl p-8 mt-8 border-2 border-gradient-to-r from-yellow-200 to-orange-200 shadow-xl">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl">💡</span>
            </div>
            <span>¿Cómo funciona TipStars App?</span>
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-200">
              <h4 className="font-bold text-blue-800 mb-4 text-xl flex items-center">
                <span className="mr-3">🆓</span>Funciones Gratuitas:
              </h4>
              <ul className="text-sm text-blue-700 space-y-2">
                <li className="flex items-center">
                  <span className="mr-2">✅</span>Ver odds de {Object.keys(SPORTS_CONFIG).length} deportes diferentes
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✅</span>Detección automática de juegos en vivo
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✅</span>Seleccionar apuestas manualmente
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✅</span>Calculadora automática de parlays
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✅</span>Cálculo de probabilidades y ganancias
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✅</span>Interfaz completamente en español
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg border border-green-200">
              <h4 className="font-bold text-green-800 mb-4 text-xl flex items-center">
                <span className="mr-3">🤖</span>Con tu API Key OpenAI:
              </h4>
              <ul className="text-sm text-green-700 space-y-2">
                <li className="flex items-center">
                  <span className="mr-2">✅</span>Análisis inteligente de cada apuesta
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✅</span>Scores de confianza basados en IA
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✅</span>Generación automática de parlays óptimos
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✅</span>Recomendaciones personalizadas por riesgo
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✅</span>Análisis de tendencias y estadísticas
                </li>
              </ul>
              <button
                onClick={() => setShowApiModal(true)}
                className="mt-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-lg"
              >
                Configurar API Key
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />

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