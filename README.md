# 🌟 TipStars App - Asistente de Apuestas Deportivas con IA

> **Análisis inteligente de apuestas deportivas con recomendaciones personalizadas**

![TipStars App](https://img.shields.io/badge/TipStars-App-orange?style=for-the-badge&logo=star)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=for-the-badge&logo=fastapi)
![MongoDB](https://img.shields.io/badge/MongoDB-4.5-47A248?style=for-the-badge&logo=mongodb)

## 🚀 Características Principales

### 🆓 **Funciones Gratuitas**
- ⚽ **5 Deportes Soportados**: Fútbol, NBA, NFL, Tenis, Esports
- 📊 **Odds en Tiempo Real**: Datos actualizados desde TheOddsAPI
- 🧮 **Calculadora de Parlays**: Cálculo automático de ganancias potenciales
- 🎯 **Selección Manual**: Arma tus propias combinaciones
- 🇪🇸 **100% en Español**: Interfaz completamente localizada

### 🤖 **Con API Key Personal (OpenAI)**
- 🧠 **Análisis IA**: Evaluación inteligente de cada apuesta
- 📈 **Scores de Confianza**: Probabilidades basadas en análisis avanzado
- 🎲 **Generación Automática**: Parlays optimizados por IA
- ⚖️ **Tres Niveles de Riesgo**: Conservador, Equilibrado, Agresivo
- 📋 **Recomendaciones Personalizadas**: Basadas en tus preferencias

## 🛠️ Stack Tecnológico

### Frontend
- **React 18** - Framework de interfaz de usuario
- **Tailwind CSS** - Framework de estilos con gradientes modernos
- **Axios** - Cliente HTTP para API calls
- **Responsive Design** - Optimizado para desktop y móvil

### Backend
- **FastAPI** - Framework web moderno y rápido
- **MongoDB** - Base de datos NoSQL para almacenamiento
- **TheOddsAPI** - Fuente de datos de odds deportivas
- **OpenAI Integration** - Análisis inteligente opcional

## 📦 Instalación y Configuración

### Prerrequisitos
- Node.js 16+
- Python 3.11+
- MongoDB (local o Atlas)
- Cuentas en servicios externos (opcional)

### 🔧 Configuración del Backend

1. **Clona el repositorio**
```bash
git clone https://github.com/tuusuario/tipstars-app.git
cd tipstars-app
```

2. **Instala dependencias de Python**
```bash
cd backend
pip install -r requirements.txt
```

3. **Configura variables de entorno**
```bash
# Crea archivo .env en /backend/
MONGO_URL="mongodb://localhost:27017"
DB_NAME="tipstars_database"
ODDS_API_KEY="tu-clave-de-theoddsapi"
OPENAI_API_KEY="tu-clave-opcional-de-openai"
```

4. **Inicia el servidor**
```bash
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### 🎨 Configuración del Frontend

1. **Instala dependencias de Node**
```bash
cd frontend
npm install
# o usando yarn (recomendado)
yarn install
```

2. **Configura variables de entorno**
```bash
# Crea archivo .env en /frontend/
REACT_APP_BACKEND_URL=http://localhost:8001
```

3. **Inicia la aplicación**
```bash
npm start
# o usando yarn
yarn start
```

## 🌐 Deploy en Producción

### Vercel (Recomendado para Frontend)

1. **Conecta tu repositorio a Vercel**
   - Ve a [vercel.com](https://vercel.com)
   - Conecta tu cuenta de GitHub
   - Selecciona el repositorio TipStars

2. **Configuración de Framework**
   - Selecciona: **"Create React App"**
   - Root Directory: `frontend`

3. **Variables de entorno en Vercel**
```bash
REACT_APP_BACKEND_URL=https://tu-backend-url.com
```

### Railway/Render (Para Backend)

1. **Backend Deploy**
   - Conecta tu repositorio
   - Root Directory: `backend`
   - Start Command: `uvicorn server:app --host 0.0.0.0 --port $PORT`

2. **Variables de entorno**
```bash
MONGO_URL=tu-mongodb-atlas-url
DB_NAME=tipstars_production
ODDS_API_KEY=tu-clave-theoddsapi
OPENAI_API_KEY=opcional
```

### MongoDB Atlas

1. **Crear cluster gratuito**
   - Ve a [mongodb.com/atlas](https://mongodb.com/atlas)
   - Crea una cuenta y un cluster gratuito
   - Obtén tu connection string

2. **Configuración de IP**
   - Permitir acceso desde cualquier IP: `0.0.0.0/0`

## 🔑 APIs Externas Requeridas

### TheOddsAPI (Obligatorio)
- **Registro**: [the-odds-api.com](https://the-odds-api.com)
- **Plan gratuito**: 500 requests/mes
- **Función**: Obtención de odds en tiempo real

### OpenAI (Opcional)
- **Registro**: [platform.openai.com](https://platform.openai.com)
- **Función**: Análisis IA y generación de parlays
- **Nota**: Los usuarios pueden usar su propia API key

## 📱 Uso de la Aplicación

### 1. **Selección de Deporte**
- Elige entre 5 deportes disponibles
- Visualiza cantidad de juegos en tiempo real
- Indicadores visuales de disponibilidad

### 2. **Configuración de Preferencias**
- **Odds Mínimas**: Filtro de valor mínimo por selección
- **Máximo de Selecciones**: Límite de legs por parlay
- **Nivel de Riesgo**: Tolerancia al riesgo personalizada

### 3. **Análisis de Odds**
- Visualización clara de odds por evento
- Selección manual de apuestas
- Información de bookmakers y horarios

### 4. **Calculadora de Parlays**
- Cálculo automático de odds totales
- Múltiples escenarios de apuesta (€10, €25, €50, €100)
- Probabilidades implícitas

### 5. **Funciones IA (Con API Key)**
- Análisis automático de confiabilidad
- Generación de parlays optimizados
- Recomendaciones por nivel de riesgo

## 🎨 Capturas de Pantalla

### Dashboard Principal
- Logo TipStars con animaciones CSS
- Selector de deportes con contadores en tiempo real
- Panel de odds con diseño moderno

### Calculadora de Parlays
- Interface intuitiva para gestión de selecciones
- Cálculos automáticos de ganancias
- Visualización clara de probabilidades

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Para cambios importantes:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📋 Roadmap

### Versión 1.1
- [ ] Más deportes (Hockey, Baseball, MMA)
- [ ] Modo oscuro
- [ ] Notificaciones push de cambios en odds
- [ ] Historial de parlays guardados

### Versión 1.2
- [ ] Sistema de usuarios con autenticación
- [ ] Análisis estadístico avanzado
- [ ] Integración con más proveedores de odds
- [ ] App móvil nativa

### Versión 2.0
- [ ] Trading de apuestas en tiempo real
- [ ] Algoritmos de machine learning propios
- [ ] Sistema de afiliados
- [ ] API pública para desarrolladores

## ⚠️ Descargo de Responsabilidad

Esta aplicación es solo para fines informativos y educativos. El análisis de apuestas deportivas conlleva riesgos financieros. Los usuarios son responsables de sus propias decisiones de apuesta.

**Uso Responsable:**
- Nunca apuestes más de lo que puedes permitirte perder
- Las apuestas deportivas pueden ser adictivas
- Consulta las leyes locales sobre apuestas en tu jurisdicción

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Desarrollador

**Deus** - Full-Stack Developer  
Especialista en aplicaciones de análisis deportivo y sistemas de IA.

- **Tecnologías**: React, FastAPI, MongoDB, AI/ML
- **Enfoque**: Experiencia de usuario intuitiva y análisis de datos avanzado

---

## 🌟 ¿Te gusta TipStars App?

Si este proyecto te ha sido útil, considera:
- ⭐ Darle una estrella en GitHub
- 🐛 Reportar bugs o solicitar features
- 🤝 Contribuir al desarrollo
- 📢 Compartir con otros entusiastas de apuestas deportivas

---

**Hecho con ❤️ y mucho ☕ por el equipo de TipStars**

*Análisis inteligente • Recomendaciones personalizadas • Resultados excepcionales*