"""FastAPI application entrypoint."""

from __future__ import annotations

import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import auth, feedback, images, meal_logs, recipes, users


@asynccontextmanager
async def lifespan(app: FastAPI):
    from db.database import create_tables

    create_tables()

    yield
    try:
        from graph.nutrition_graph import close_pool
        close_pool()
    except Exception:
        pass


app = FastAPI(
    title="Nutrition AI API",
    description="Personalized AI-powered nutrition and meal planning.",
    version="1.0.0",
    lifespan=lifespan,
)

_raw_origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:3000,http://localhost:5173,http://localhost:5174",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in _raw_origins.split(",") if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(recipes.router)
app.include_router(feedback.router)
app.include_router(meal_logs.router)
app.include_router(images.router)


@app.get("/", tags=["System"], include_in_schema=False)
def root():
    return {"message": "Nutrition AI API is running.", "docs": "/docs"}


@app.get("/health", tags=["System"], summary="Health check")
def health_check():
    return {"status": "ok", "version": "1.0.0"}
