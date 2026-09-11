# AI Diet Planner (PulseFit) 🥗⚡

An intelligent, AI-powered Diet & Nutrition Planning application built with React, Node.js/Express, PostgreSQL, and Google Gemini.

---

## ✨ Features

- 🤖 **AI-Generated Personalized Diet Plans**: Instant customized multi-day meal plans powered by Google Gemini.
- 🌐 **Multilingual Support**: Supports 7 languages (English, Hindi, Marathi, Gujarati, Bengali, Tamil, Telugu).
- ⚖️ **Precision Macro Calculations**: Custom target metrics for calories, protein, carbohydrates, and fats.
- 🖨️ **Print & PDF Export**: Clean, publication-ready meal plans with print-optimized layouts.
- 🔒 **Role-Based Authentication**: Secure JWT authentication for Admins, Staff, and Trainers with bcrypt hashing.
- 📊 **Staff & Admin Management Dashboard**: Manage client records, diet histories, and real-time generation metrics.
- 🛡️ **Robust Security**: Rate limiting, CORS configuration, input sanitization, and parameterized PostgreSQL queries.

---

## 🏗️ Architecture & Tech Stack

### Frontend
- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS v4
- **State Management & Icons**: Native React Hooks & Lucide Icons
- **Print Engine**: Dedicated CSS Print styling & DOM export

### Backend
- **Runtime**: Node.js & Express
- **AI Engine**: Google Gemini API (`@google/genai`)
- **Database**: PostgreSQL (`pg` pool with parameterized SQL)
- **Security & Auth**: `bcryptjs`, `jsonwebtoken`, `express-rate-limit`

---

## 🚀 Quick Start

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [PostgreSQL](https://www.postgresql.org/) (v14 or higher)
- [Google Gemini API Key](https://aistudio.google.com/)

---

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
```

Edit `backend/.env` with your credentials:
```env
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ai_diet_planner
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=your_jwt_secret_key
ADMIN_EMAIL=admin@pulsefit.com
ADMIN_PASSWORD=your_admin_password
```

Start the backend server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

---

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

The application will be accessible at: `http://localhost:5173`

---

## 📁 Repository Structure

```
AI-diet-planner/
├── backend/
│   ├── auth.js                     # JWT & Role authentication middleware
│   ├── db.js                       # PostgreSQL client & schema migrations
│   ├── gemini.js                   # Gemini AI prompt engine & schema parsing
│   ├── nutrition.js                # Nutrition & macro calculation algorithms
│   ├── rateLimiter.js              # Express rate limiting policies
│   ├── server.js                   # Main Express application & API routes
│   └── .env.example                # Example configuration template
├── frontend/
│   ├── src/
│   │   ├── components/             # Reusable UI & Diet Plan components
│   │   ├── context/                # Auth & Language Contexts
│   │   ├── i18n/                   # Multi-language translations
│   │   └── App.jsx                 # Main application router & state
│   ├── index.html
│   └── package.json
├── .gitignore
└── README.md
```

---

## 🔒 Security Best Practices
- Never commit `.env` or sensitive API keys.
- Environment variables are isolated per layer.
- Database queries use strict parameterization to prevent SQL injection.
- Rate limiting protects AI generation endpoints from abuse.

---

## 📄 License
ISC
