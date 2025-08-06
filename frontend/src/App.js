import React, { useState, useEffect } from "react";
import axios from "axios";
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Sports configuration
const SPORTS_CONFIG = {
  soccer: { name: "Fútbol", emoji: "⚽", color: "#10b981" },
  basketball: { name: "NBA", emoji: "🏀", color: "#f97316" },
  americanfootball: { name: "NFL", emoji: "🏈", color: "#8b5cf6" },
  tennis: { name: "Tenis", emoji: "🎾", color: "#22c55e" },
  esports: { name: "Esports", emoji: "🎮", color: "#3b82f6" }
};

const TipStarsLogo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
    <div style={{ position: 'relative' }}>
      <div style={{
        width: '56px',
        height: '56px',
        background: 'linear-gradient(135deg, #facc15 0%, #f97316 50%, #ef4444 100%)',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        transform: 'rotate(12deg)',
        animation: 'pulse 2s infinite'
      }}>
        <span style={{
          color: 'white',
          fontWeight: 'bold',
          fontSize: '24px',
          transform: 'rotate(-12deg)'
        }}>⭐</span>
      </div>
      <div style={{
        position: 'absolute',
        top: '-4px',
        right: '-4px',
        width: '24px',
        height: '24px',
        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <span style={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}>🏆</span>
      </div>
    </div>
    <div>
      <h1 style={{
        fontSize: '36px',
        fontWeight: '900',
        background: 'linear-gradient(135deg, #facc15 0%, #f97316 50%, #ef4444 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        margin: 0
      }}>
        TipStars
      </h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{
          fontSize: '18px',
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          App
        </span>
        <div style={{ display: 'flex', gap: '4px' }}>
          <span style={{
            width: '8px',
            height: '8px',
            backgroundColor: '#facc15',
            borderRadius: '50%',
            animation: 'ping 1s infinite'
          }}></span>
          <span style={{
            width: '8px',
            height: '8px',
            backgroundColor: '#f97316',
            borderRadius: '50%',
            animation: 'ping 1s infinite 0.2s'
          }}></span>
          <span style={{
            width: '8px',
            height: '8px',
            backgroundColor: '#ef4444',
            borderRadius: '50%',
            animation: 'ping 1s infinite 0.4s'
          }}></span>
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
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        padding: '32px',
        maxWidth: '400px',
        width: '100%',
        margin: '16px',
        border: '4px solid transparent',
        backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #facc15, #f97316)',
        backgroundOrigin: 'border-box',
        backgroundClip: 'content-box, border-box'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'linear-gradient(135deg, #facc15, #f97316)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ color: 'white', fontSize: '24px' }}>🔑</span>
          </div>
          <h3 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #f59e0b, #f97316)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: 0
          }}>
            Configurar API Key
          </h3>
        </div>
        
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#374151',
            marginBottom: '8px'
          }}>
            OpenAI API Key (Opcional)
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-proj-..."
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              outline: 'none',
              transition: 'all 0.2s',
              fontSize: '16px'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#facc15';
              e.target.style.boxShadow = '0 0 0 3px rgba(250, 204, 21, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e5e7eb';
              e.target.style.boxShadow = 'none';
            }}
          />
          <p style={{
            fontSize: '12px',
            color: '#6b7280',
            marginTop: '8px'
          }}>
            💡 Con tu API key personal podrás usar todas las funciones de IA
          </p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #dbeafe, #f3e8ff)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
          border: '1px solid #bfdbfe'
        }}>
          <h4 style={{
            fontWeight: 'bold',
            color: '#1e40af',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>🆓</span>Sin API Key:
          </h4>
          <ul style={{
            fontSize: '14px',
            color: '#1e40af',
            listStyle: 'none',
            padding: 0,
            margin: 0,
            lineHeight: '1.5'
          }}>
            <li>✅ Ver odds de todos los deportes</li>
            <li>✅ Calculadora manual de parlays</li>
            <li>✅ Sistema de favoritos</li>
          </ul>
          
          <h4 style={{
            fontWeight: 'bold',
            color: '#059669',
            marginBottom: '8px',
            marginTop: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>🤖</span>Con API Key:
          </h4>
          <ul style={{
            fontSize: '14px',
            color: '#059669',
            listStyle: 'none',
            padding: 0,
            margin: 0,
            lineHeight: '1.5'
          }}>
            <li>✅ Análisis IA de apuestas</li>
            <li>✅ Generación automática de parlays</li>
            <li>✅ Recomendaciones personalizadas</li>
          </ul>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px 16px',
              border: '2px solid #e5e7eb',
              color: '#374151',
              borderRadius: '12px',
              backgroundColor: 'white',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f9fafb';
              e.target.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'white';
              e.target.style.transform = 'scale(1)';
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            style={{
              flex: 1,
              background: 'linear-gradient(135deg, #facc15, #f97316)',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '12px',
              fontWeight: 'bold',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #f59e0b, #ea580c)';
              e.target.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #facc15, #f97316)';
              e.target.style.transform = 'scale(1)';
            }}
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
    <div style={{
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      padding: '32px',
      marginBottom: '32px',
      border: '1px solid #f3f4f6'
    }}>
      <h3 style={{
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <span style={{ fontSize: '28px' }}>🏆</span>
        <span style={{
          background: 'linear-gradient(135deg, #374151, #111827)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Selecciona tu Deporte
        </span>
      </h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px'
      }}>
        {Object.entries(SPORTS_CONFIG).map(([key, sport]) => {
          const gameCount = sportsCount[key]?.total_games || 0;
          const isSelected = selectedSport === key;
          return (
            <button
              key={key}
              onClick={() => onSportChange(key)}
              disabled={loading}
              style={{
                position: 'relative',
                padding: '24px',
                borderRadius: '12px',
                transition: 'all 0.3s ease',
                background: isSelected 
                  ? `linear-gradient(135deg, ${sport.color}, ${sport.color}dd)`
                  : 'linear-gradient(135deg, #f9fafb, #f3f4f6)',
                color: isSelected ? 'white' : '#374151',
                border: '2px solid white',
                boxShadow: isSelected 
                  ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                  : '0 4px 6px rgba(0, 0, 0, 0.05)',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
                transform: isSelected ? 'scale(1.05)' : 'scale(1)'
              }}
              onMouseEnter={(e) => {
                if (!loading && !isSelected) {
                  e.target.style.transform = 'scale(1.05) rotate(2deg)';
                  e.target.style.boxShadow = '0 10px 15px rgba(0, 0, 0, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading && !isSelected) {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05)';
                }
              }}
            >
              <div style={{
                fontSize: '32px',
                marginBottom: '8px',
                transition: 'transform 0.2s'
              }}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              >
                {sport.emoji}
              </div>
              <div style={{
                fontWeight: 'bold',
                fontSize: '14px',
                color: isSelected ? 'black' : '#374151'
              }}>
                {sport.name}
              </div>
              <div style={{
                fontSize: '12px',
                marginTop: '4px',
                fontWeight: 'bold',
                color: isSelected 
                  ? (gameCount > 0 ? 'black' : '#374151aa')
                  : (gameCount > 0 ? '#059669' : '#9ca3af')
              }}>
                {gameCount} juegos {gameCount > 0 ? '🟢' : '🔴'}
              </div>
              {isSelected && (
                <div style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  width: '24px',
                  height: '24px',
                  backgroundColor: '#facc15',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}>
                  <span style={{ color: 'black', fontSize: '12px', fontWeight: 'bold' }}>✓</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
      <div style={{
        marginTop: '16px',
        textAlign: 'center',
        fontSize: '14px',
        color: '#6b7280'
      }}>
        🟢 = Juegos disponibles ahora • 🔴 = Sin juegos en este momento
      </div>
    </div>
  );
};

const Footer = () => {
  const openWhatsApp = () => {
    window.open('https://wa.me/+528134558994', '_blank');
  };

  return (
    <footer style={{
      background: 'linear-gradient(135deg, #111827, #1f2937, #111827)',
      color: 'white',
      padding: '48px 0',
      marginTop: '64px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 16px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '32px'
        }}>
          {/* Logo y descripción */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #facc15, #f97316, #ef4444)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}>
                <span style={{ color: 'white', fontWeight: 'bold', fontSize: '20px' }}>⭐</span>
              </div>
              <div>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: '900',
                  background: 'linear-gradient(135deg, #facc15, #f97316)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  margin: 0
                }}>
                  TipStars App
                </h3>
              </div>
            </div>
            <p style={{
              color: '#d1d5db',
              fontSize: '14px',
              lineHeight: '1.6',
              margin: 0
            }}>
              Análisis inteligente de apuestas deportivas con IA. 
              Obtén las mejores recomendaciones de parlays basadas en datos en tiempo real.
            </p>
          </div>

          {/* Características */}
          <div>
            <h4 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>🚀</span>Características
            </h4>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              fontSize: '14px',
              color: '#d1d5db',
              lineHeight: '1.8'
            }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>⚽</span>5 deportes soportados
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🎯</span>Detección juegos en vivo
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🤖</span>Análisis IA opcional
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🧮</span>Calculadora de parlays
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📊</span>Odds en tiempo real
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🇪🇸</span>100% en español
              </li>
            </ul>
          </div>

          {/* Desarrollador */}
          <div>
            <h4 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>👨‍💻</span>Desarrollador
            </h4>
            <div style={{
              background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.5), rgba(91, 33, 182, 0.5))',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid rgba(59, 130, 246, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '2px solid transparent',
                  background: 'linear-gradient(135deg, #facc15, #f97316)'
                }}>
                  <img 
                    src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAD6APoDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD3+iiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD/2Q==" 
                    alt="Deus - Desarrollador" 
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </div>
                <div>
                  <h5 style={{ fontWeight: 'bold', color: 'white', margin: 0 }}>Deus</h5>
                  <p style={{ fontSize: '12px', color: '#d1d5db', margin: 0 }}>Full-Stack Developer</p>
                </div>
              </div>
              <p style={{
                fontSize: '14px',
                color: '#d1d5db',
                marginBottom: '12px',
                margin: 0,
                lineHeight: '1.5'
              }}>
                Especialista en aplicaciones de análisis deportivo y sistemas de IA.
              </p>
              <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '12px',
                flexWrap: 'wrap'
              }}>
                <span style={{
                  backgroundColor: 'rgba(250, 204, 21, 0.2)',
                  color: '#fcd34d',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  React
                </span>
                <span style={{
                  backgroundColor: 'rgba(34, 197, 94, 0.2)',
                  color: '#4ade80',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  FastAPI
                </span>
                <span style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.2)',
                  color: '#60a5fa',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  AI/ML
                </span>
              </div>
              <button
                onClick={openWhatsApp}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  color: 'white',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #16a34a, #15803d)';
                  e.target.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
                  e.target.style.transform = 'scale(1)';
                }}
              >
                <span>📱</span>
                Contactar por WhatsApp
              </button>
            </div>
          </div>
        </div>

        {/* Línea divisoria */}
        <div style={{
          borderTop: '1px solid #374151',
          marginTop: '32px',
          paddingTop: '24px'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              fontSize: '14px',
              color: '#9ca3af'
            }}>
              © 2025 TipStars App. Todos los derechos reservados.
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              fontSize: '14px',
              color: '#9ca3af',
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>🔒</span>
                Uso responsable de apuestas
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

const EmptyState = ({ title, description, action, onAction }) => (
  <div style={{
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    padding: '48px',
    textAlign: 'center',
    border: '1px solid #f3f4f6'
  }}>
    <div style={{
      width: '80px',
      height: '80px',
      background: 'linear-gradient(135deg, #e5e7eb, #d1d5db)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 24px'
    }}>
      <div style={{ color: '#9ca3af', fontSize: '32px' }}>📊</div>
    </div>
    <h3 style={{
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: '12px'
    }}>{title}</h3>
    <p style={{
      color: '#6b7280',
      marginBottom: '32px',
      fontSize: '18px',
      lineHeight: '1.6'
    }}>{description}</p>
    {action && (
      <button
        onClick={onAction}
        style={{
          background: 'linear-gradient(135deg, #facc15, #f97316)',
          color: 'white',
          padding: '16px 32px',
          borderRadius: '12px',
          fontWeight: 'bold',
          fontSize: '18px',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.target.style.background = 'linear-gradient(135deg, #f59e0b, #ea580c)';
          e.target.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'linear-gradient(135deg, #facc15, #f97316)';
          e.target.style.transform = 'scale(1)';
        }}
      >
        {action}
      </button>
    )}
  </div>
);

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

  const handleSaveApiKey = (apiKey) => {
    setUserApiKey(apiKey);
    localStorage.setItem('openai_api_key', apiKey);
    setAiMode(!!apiKey);
  };

  useEffect(() => {
    fetchSportsCount();
    setAiMode(!!userApiKey);
  }, []);

  const sportConfig = SPORTS_CONFIG[selectedSport];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 50%, #f3e8ff 100%)'
    }}>
      {/* CSS Keyframes */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
      
      {/* Header */}
      <header style={{
        backgroundColor: 'white',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        borderBottom: '4px solid transparent',
        backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #facc15, #f97316, #ef4444)',
        backgroundOrigin: 'border-box',
        backgroundClip: 'content-box, border-box'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 16px',
          paddingTop: '32px',
          paddingBottom: '32px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <TipStarsLogo />
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              flexWrap: 'wrap'
            }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#4b5563'
                }}>
                  {aiMode ? '🤖 Modo IA Activado' : '🆓 Modo Gratuito'}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#6b7280'
                }}>
                  Análisis inteligente • Recomendaciones personalizadas
                </div>
              </div>
              <button
                onClick={() => setShowApiModal(true)}
                style={{
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.2s',
                  background: aiMode 
                    ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                    : 'linear-gradient(135deg, #6b7280, #4b5563)',
                  color: 'white'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                }}
              >
                {aiMode ? '🤖 IA Activa' : '🔑 Activar IA'}
              </button>
              <button
                onClick={() => {
                  fetchOdds();
                  fetchSportsCount();
                }}
                disabled={loading}
                style={{
                  background: 'linear-gradient(135deg, #3b82f6, #4f46e5)',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.2s',
                  opacity: loading ? 0.5 : 1
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.background = 'linear-gradient(135deg, #2563eb, #4338ca)';
                    e.target.style.transform = 'scale(1.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.target.style.background = 'linear-gradient(135deg, #3b82f6, #4f46e5)';
                    e.target.style.transform = 'scale(1)';
                  }
                }}
              >
                {loading ? '🔄 Actualizando...' : '🔄 Actualizar Odds'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '32px 16px'
      }}>
        {/* Sport Selector */}
        <SportSelector 
          selectedSport={selectedSport}
          onSportChange={handleSportChange}
          loading={loading || loadingCounts}
          sportsCount={sportsCount}
        />

        {/* Live Odds Section */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          padding: '32px',
          marginBottom: '32px',
          border: '1px solid #f3f4f6'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#1f2937',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              margin: 0
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}>
                <span style={{ fontSize: '24px' }}>{sportConfig.emoji}</span>
              </div>
              <span>Odds en Vivo - {sportConfig.name}</span>
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '50px',
                fontSize: '14px',
                fontWeight: 'bold',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>📊</span>
                {odds.length} Juegos Disponibles
              </span>
            </div>
          </div>
          
          <div style={{
            maxHeight: '400px',
            overflowY: 'auto',
            gap: '16px'
          }}>
         {loading ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '48px'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  border: '4px solid #e5e7eb',
                  borderTop: '4px solid #facc15',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                <span style={{
                  color: '#374151',
                  fontWeight: 'bold',
                  fontSize: '18px',
                  marginLeft: '16px'
                }}>Obteniendo odds en vivo...</span>
                <style>{`
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}</style>
              </div>
            ) : odds.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            {odds.map((odd, index) => (
              <div key={index} style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px', backgroundColor: 'white', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)' }}>
                <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '8px' }}>
                  {odd.home_team} vs {odd.away_team}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                  Inicio: {new Date(odd.commence_time).toLocaleString()}
                </div>
                <div style={{ display: 'flex', gap: '8px', fontSize: '14px', color: '#374151' }}>
                  <span>Local: {odd.home_odds}</span>
                  <span>Visitante: {odd.away_odds}</span>
                  {odd.draw_odds ? <span>Empate: {odd.draw_odds}</span> : null}
                </div>
              </div>
            ))}
          </div>
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

        {/* Footer */}
        <Footer />
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
