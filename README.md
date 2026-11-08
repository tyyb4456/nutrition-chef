<div align="center">

# 🥗 Nutrition AI

**Personalized AI-powered nutrition, meal planning & food analysis — powered by Google Gemini 2.5 Flash + LangGraph**

[![FastAPI](https://img.shields.io/badge/FastAPI-1.0.0-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![LangGraph](https://img.shields.io/badge/LangGraph-Agentic_Pipeline-FF6B35?style=for-the-badge)](https://langchain-ai.github.io/langgraph/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-Caching-DC382D?style=for-the-badge&logo=redis)](https://redis.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

</div>

---

## 📖 Overview

**Nutrition AI** is a full-stack intelligent nutrition assistant that combines a **React + Tailwind CSS** frontend with a **FastAPI** backend orchestrated by a multi-node **LangGraph** agentic pipeline. It generates personalized recipes, creates 7-day meal plans, tracks nutrition progress, and learns from your feedback — all powered by **Google Gemini 2.5 Flash**.

> The system continuously improves. Every rating and comment you leave trains a **learning loop** that refines future recommendations to match your taste and health goals.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🤖 **AI Recipe Generation** | Personalized recipes via Gemini 2.5 Flash + a multi-node LangGraph pipeline |
| 📅 **7-Day Meal Plans** | Complete weekly plans with grocery lists and meal-prep schedules |
| 🖼️ **Food Image Analysis** | Upload a photo of any meal — AI identifies it and estimates macros |
| 📊 **Progress & Analytics** | Calorie adherence charts, macro breakdowns, weekly progress reports |
| 🔁 **Learning Loop** | Preferences evolve automatically based on ratings and comments |
| 🥦 **Nutrition Validation** | Every generated recipe is validated and macro-adjusted before delivery |
| 📝 **Meal Logging** | Log meals manually, from recipes, or from image analysis |
| 🔐 **JWT Authentication** | Secure per-user data isolation |
| ⚡ **Rate Limiting** | LLM endpoints rate-limited to 20 calls/hour per user (Redis-backed) |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────┐
│              React Frontend              │
│  (Vite · React 19 · Tailwind CSS v4)     │
│                                          │
│  Landing · Auth · Dashboard (7 pages)   │
└─────────────────┬────────────────────────┘
                  │ REST (JWT)
┌─────────────────▼────────────────────────┐
│           FastAPI Backend  v1.0.0        │
│                                          │
│  /auth  /users  /recipes  /meal-plans   │
│  /meal-logs  /analytics  /images        │
│  /feedback                              │
└──────────┬────────────────┬─────────────┘
           │                │
  ┌────────▼───────┐  ┌─────▼──────┐
  │  PostgreSQL    │  │   Redis    │
  │  (ORM models   │  │ (caching + │
  │  + LangGraph   │  │  rate-     │
  │  checkpoints)  │  │  limiting) │
  └────────────────┘  └────────────┘
           │
┌──────────▼─────────────────────────────────────────────────────┐
│                  LangGraph Agentic Pipeline                     │
│                                                                │
│  START → health_goal → recipe_generator → nutrition_validation  │
│                              ↑                    │            │
│                              │         ┌──────────▼──────────┐ │
│                              └─────────┤  macro_adjustment   │ │
│                                        └─────────────────────┘ │
│                        substitution → explainability → feedback │
│                                            → learning_loop → END│
└────────────────────────────────────────────────────────────────┘
           │
  ┌────────▼────────┐    ┌────────────────┐
  │  Gemini 2.5     │    │  ChromaDB /    │
  │  Flash (LLM)    │    │  FAISS (RAG    │
  │                 │    │  Vector Store) │
  └─────────────────┘    └────────────────┘
```

---

## 🧠 LangGraph Pipeline (Backend Core)

The backend uses **LangGraph** to orchestrate an 8-node stateful agentic pipeline:

| Node | Role |
|---|---|
| `health_goal` | Interprets your fitness goal → computes calorie target & macro split (protein/carbs/fat %) |
| `recipe_generator` | Calls Gemini 2.5 Flash with RAG context to generate a personalized recipe |
| `nutrition_validation` | Validates the recipe against your calorie/macro targets |
| `macro_adjustment` | Adjusts portion sizes if validation fails (up to 2 retries) |
| `substitution` | Swaps out allergens or disliked ingredients while maintaining macros |
| `explainability` | Generates a human-readable explanation of why this recipe was chosen for you |
| `feedback` | Collects your rating (1–5) and free-text comment |
| `learning_loop` | Updates your `learned_preferences` in the DB so future recipes improve |

**Checkpointing:** Pipeline state is persisted to PostgreSQL via `PostgresSaver`, enabling true resume-on-restart and multi-turn conversational follow-ups.

---

## 🗂️ Project Structure

```
nutrition_app/
├── backend/
│   ├── main.py                  # FastAPI app factory + middleware + health checks
│   ├── state.py                 # NutritionState & WeeklyPlanState (Pydantic)
│   ├── requirements.txt
│   ├── .env                     # Environment variables (see setup below)
│   │
│   ├── api/
│   │   ├── routers/             # Route handlers
│   │   │   ├── auth.py          # Register / Login (JWT)
│   │   │   ├── users.py         # Profile management
│   │   │   ├── recipes.py       # AI recipe generation & retrieval
│   │   │   ├── meal_plans.py    # 7-day meal plan generation
│   │   │   ├── meal_logs.py     # Meal consumption logging
│   │   │   ├── analytics.py     # Progress reports & learning data
│   │   │   ├── images.py        # Food image analysis
│   │   │   └── feedback.py      # Recipe ratings & comments
│   │   ├── services/            # Business logic layer
│   │   ├── schemas/             # Pydantic request/response models
│   │   └── dependencies.py      # JWT auth, DB session, rate-limit deps
│   │
│   ├── pipeline/
│   │   └── nutrition_graph.py   # LangGraph StateGraph definition & compilation
│   │
│   ├── nodes/                   # Individual LangGraph nodes
│   │   ├── health_goal.py
│   │   ├── generate_recipe.py
│   │   ├── validate_nutrition.py
│   │   ├── macro_adjustment.py
│   │   ├── substitution.py
│   │   ├── explainability.py
│   │   ├── feedback.py
│   │   ├── learning_loop.py
│   │   ├── weekly_plan.py
│   │   ├── grocery.py
│   │   ├── meal_prep.py
│   │   ├── progress.py
│   │   └── followup.py
│   │
│   ├── db/
│   │   ├── models.py            # SQLAlchemy ORM models (14 tables)
│   │   ├── database.py          # Engine + session factory
│   │   └── repositories.py      # Data access layer
│   │
│   ├── schemas/
│   │   └── nutrition_schemas.py # Shared Pydantic schemas
│   │
│   ├── memory/                  # Conversation memory helpers
│   ├── cache/                   # Redis client + rate limiter
│   ├── vector_store/            # ChromaDB / FAISS RAG setup
│   └── data/                    # Seed data / knowledge base
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx              # Router (React Router v7)
        ├── main.jsx
        ├── index.css            # Global styles + Tailwind v4
        ├── context/
        │   ├── AuthContext.jsx  # JWT auth state
        │   └── ThemeContext.jsx # Dark/light mode
        ├── pages/
        │   ├── LandingPage.jsx
        │   ├── AuthPage.jsx     # Login + Register
        │   └── dashboard/
        │       ├── DashboardLayout.jsx
        │       ├── OverviewPage.jsx      # Summary cards + quick stats
        │       ├── RecipesPage.jsx       # AI recipe generation UI
        │       ├── MealPlanPage.jsx      # 7-day plan viewer
        │       ├── MealLogsPage.jsx      # Log & history
        │       ├── ImageAnalysisPage.jsx # Food photo upload
        │       ├── AnalyticsPage.jsx     # Charts & reports
        │       └── ProfilePage.jsx       # User settings
        ├── components/
        │   ├── layout/          # Navbar, Footer, Sidebar
        │   ├── dashboard/       # Dashboard-specific components
        │   ├── landing/         # Landing page sections
        │   └── ui/              # Reusable UI components
        └── services/            # Axios API client layer
```

---

## 🗄️ Database Schema

The PostgreSQL database has **14 tables** organized across 4 domains:

**User Domain** — `users`, `user_profiles`, `user_goals`, `medical_conditions`, `user_allergies`, `user_preferences`

**Recipe Domain** — `recipes`, `recipe_ingredients`, `recipe_steps`, `recipe_nutrition`

**Meal Planning** — `meal_plans`, `meal_plan_items`

**Feedback & Logging** — `user_feedback`, `meal_logs`, `learned_preferences`

---

## 🚀 Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 15+ (local or hosted e.g. [Railway](https://railway.app))
- Redis (optional — disables rate limiting if absent)
- A [Google AI Studio](https://aistudio.google.com/) API key (Gemini)

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/nutrition-ai.git
cd nutrition-ai
```

---

### 2. Backend Setup

```bash
cd backend
```

**Create & activate a virtual environment:**

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS / Linux
python -m venv venv
source venv/bin/activate
```

**Install dependencies:**

```bash
pip install -r requirements.txt
```

**Configure environment variables:**

Create a `.env` file in the `backend/` directory:

```env
# Database (PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/nutrition_ai

# Google Gemini
GOOGLE_API_KEY=your_google_api_key_here

# Hugging Face (for embeddings / RAG)
HUGGINGFACEHUB_API_TOKEN=your_hf_token_here

# App settings
ENV=development                        # development | production
SECRET_KEY=your_jwt_secret_key_here    # used for JWT signing
CORS_ORIGINS=http://localhost:5173

# Redis (optional — rate limiting & caching)
REDIS_URL=redis://localhost:6379
```

**Run database migrations (auto-create tables):**

```bash
# Tables are created automatically on first startup via SQLAlchemy
# Optionally use Alembic for migrations:
alembic upgrade head
```

**Start the backend server:**

```bash
uvicorn main:app --reload --port 8000
```

The API will be live at:
- **Swagger Docs:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`
- **Health Check:** `http://localhost:8000/health`
- **Readiness Probe:** `http://localhost:8000/health/ready`

---

### 3. Frontend Setup

```bash
cd frontend
```

**Install dependencies:**

```bash
npm install
```

**Start the dev server:**

```bash
npm run dev
```

The app will be live at **`http://localhost:5173`**.

---

## 🔌 API Reference

All endpoints (except Auth) require a `Bearer <JWT>` token in the `Authorization` header.

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Create a new account |
| `POST` | `/auth/login` | Obtain a JWT token |

### Recipes
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/recipes/generate` | Generate a personalized AI recipe |
| `GET` | `/recipes/` | List all recipes for the current user |
| `GET` | `/recipes/{id}` | Get a specific recipe with nutrition info |

### Meal Plans
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/meal-plans/generate` | Generate a full 7-day meal plan |
| `GET` | `/meal-plans/` | List all meal plans |
| `GET` | `/meal-plans/{id}` | Get a specific plan with grocery list |

### Meal Logs
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/meal-logs/` | Log a consumed meal |
| `GET` | `/meal-logs/` | Get meal log history |
| `DELETE` | `/meal-logs/{id}` | Remove a log entry |

### Analytics
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/analytics/progress` | Weekly calorie & macro adherence report |
| `GET` | `/analytics/learned-preferences` | View what the AI has learned about you |

### Food Image Analysis
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/images/analyze` | Upload a food photo → AI returns macros |

### Feedback
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/feedback/` | Submit a rating (1–5) and comment for a recipe |

### Users
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/users/me` | Get current user profile |
| `PUT` | `/users/me` | Update profile (weight, height, goals, allergies, etc.) |

---

## 🖥️ Frontend Pages

| Route | Page | Description |
|---|---|---|
| `/` | Landing Page | Hero section, features, CTA |
| `/auth` | Auth Page | Login & Register with tabs |
| `/dashboard` | Overview | Quick stats, calorie ring, recent meals |
| `/dashboard/recipes` | Recipes | Generate & browse AI recipes |
| `/dashboard/meal-plan` | Meal Plan | View 7-day plan, grocery list, prep schedule |
| `/dashboard/logs` | Meal Logs | Log meals, view history |
| `/dashboard/scan` | Image Analysis | Upload food photo for macro estimation |
| `/dashboard/analytics` | Analytics | Progress charts & reports |
| `/dashboard/profile` | Profile | Edit physical stats, goals, allergies |

---

## ⚙️ Environment Variables Reference

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | ✅ | — | PostgreSQL connection string |
| `GOOGLE_API_KEY` | ✅ | — | Google Gemini API key |
| `HUGGINGFACEHUB_API_TOKEN` | ✅ | — | HuggingFace token for embeddings |
| `SECRET_KEY` | ✅ | — | JWT signing secret |
| `ENV` | ❌ | `development` | `development` or `production` |
| `CORS_ORIGINS` | ❌ | `http://localhost:5173` | Comma-separated allowed origins |
| `REDIS_URL` | ❌ | — | Redis URL (rate limiting disabled if absent) |
| `ALLOWED_HOSTS` | ❌ | `*` | Trusted hosts (production only) |

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **FastAPI** | REST API framework |
| **LangGraph** | Stateful agentic pipeline orchestration |
| **LangChain + Gemini 2.5 Flash** | LLM inference |
| **SQLAlchemy 2.0** | ORM for PostgreSQL |
| **Alembic** | Database migrations |
| **psycopg v3** | PostgreSQL driver (for LangGraph checkpointer) |
| **Redis** | Rate limiting & response caching |
| **ChromaDB / FAISS** | Vector store for RAG (recipe context) |
| **Passlib + python-jose** | Password hashing & JWT |
| **Pydantic v2** | Data validation & settings |
| **Uvicorn** | ASGI server |

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI framework |
| **Vite 8** | Build tool & dev server |
| **Tailwind CSS v4** | Utility-first styling |
| **React Router v7** | Client-side routing |
| **Lucide React** | Icon library |
| **React Context API** | Auth & theme state |

---

## 🔒 Security Notes

- All passwords are hashed with **bcrypt** via Passlib
- JWTs are signed with `HS256` and validated on every protected request
- LLM endpoints are rate-limited to **20 calls/hour** per user (configurable)
- CORS origins are restricted to explicitly configured domains
- In production, `TrustedHostMiddleware` is applied
- **Never commit your `.env` file** — it is listed in `.gitignore`

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
Made with ❤️ using Google Gemini · LangGraph · FastAPI · React
</div>
