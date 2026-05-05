"""
api/services/tracking_service.py

Feedback + learning loop service.

submit_feedback():
  1. Validates recipe exists.
  2. Saves rating + comment to user_feedback table.
  3. If thread_id is provided, resumes the paused nutrition_graph via
     Command(resume={...}) — this triggers feedback_node to complete +
     learning_loop_node to run, updating learned preferences in DB.
"""

from __future__ import annotations

import logging
import uuid
from datetime import date, datetime, timedelta
from typing import Optional

from sqlalchemy.orm import Session

from db.models import User, UserFeedback, MealLog
from db.repositories import UserRepository, ProgressRepository
from schemas.nutrition_schemas import MealLogEntry
from cache.memory_cache import mem_cache, TTL_ADHERENCE
from api.schemas.tracking_schemas import (
    SubmitFeedbackRequest, FeedbackResponse, FeedbackListResponse,
    LogMealRequest, MealLogResponse, MealLogListResponse,
    DailyAdherenceResponse,
)

logger = logging.getLogger(__name__)


# ═══════════════════════════════════════════════════════════════
# FEEDBACK SERVICE
# ═══════════════════════════════════════════════════════════════

def submit_feedback(
    user: User,
    db: Session,
    payload: SubmitFeedbackRequest,
) -> FeedbackResponse:
    """
    Save a recipe rating + comment, then (optionally) resume the LangGraph
    pipeline so the learning loop agent updates learned preferences.
    """
    from db.models import Recipe as RecipeModel

    # Verify recipe exists
    recipe = db.query(RecipeModel).filter_by(id=payload.recipe_id).first()
    if not recipe:
        raise ValueError(f"Recipe '{payload.recipe_id}' not found.")

    # ── Save feedback to DB ───────────────────────────────────────────────────
    repo = UserRepository(db)
    fb   = repo.save_feedback(
        user_id   = user.id,
        recipe_id = payload.recipe_id,
        rating    = payload.rating,
        comment   = payload.comment,
    )
    db.flush()

    logger.info(
        "Feedback saved: user=%s recipe=%s rating=%d",
        user.id, payload.recipe_id, payload.rating,
    )

    # ── Resume graph → learning_loop_node ─────────────────────────────────────
    learning_loop_triggered = False

    # Resolve thread_id: prefer the one sent in the request; fall back to
    # the one stored on the recipe row (persisted at generation time).
    thread_id = payload.thread_id
    if not thread_id and recipe.thread_id:
        thread_id = recipe.thread_id
        logger.info(
            "No thread_id in request — using stored thread_id '%s' from recipe '%s'.",
            thread_id, payload.recipe_id,
        )

    if thread_id:
        learning_loop_triggered = _resume_graph_for_learning(
            thread_id = thread_id,
            rating    = payload.rating,
            comment   = payload.comment,
        )
    else:
        logger.info(
            "No thread_id available for recipe '%s' — skipping learning loop.",
            payload.recipe_id,
        )

    return FeedbackResponse(
        feedback_id              = fb.id,
        recipe_id                = fb.recipe_id,
        rating                   = fb.rating,
        comment                  = fb.comment,
        created_at               = fb.created_at.isoformat(),
        learning_loop_triggered  = learning_loop_triggered,
    )


def _resume_graph_for_learning(
    thread_id: str,
    rating: int,
    comment: Optional[str],
) -> bool:
    """
    Resume the paused nutrition_graph thread so that:
      feedback_node      — receives resume value, marks feedback_collected=True
      learning_loop_node — runs, updates learned preferences in DB + ChromaDB

    Both generate (gen-) and modify (mod-) threads live in nutrition_graph.
    Returns True on success, False on any error.
    """
    try:
        from langgraph.types import Command
        from pipeline.nutrition_graph import nutrition_graph

        config = {"configurable": {"thread_id": thread_id}}

        snapshot = nutrition_graph.get_state(config)
        if snapshot is None:
            logger.warning(
                "Graph thread '%s' not found in checkpointer — learning loop skipped.",
                thread_id,
            )
            return False

        logger.info("Resuming thread '%s' with feedback (rating=%d).", thread_id, rating)

        nutrition_graph.invoke(
            Command(resume={"rating": rating, "comment": comment or ""}),
            config  = config,
            version = "v2",
        )

        logger.info("   ✓  Learning loop completed for thread '%s'.", thread_id)
        return True

    except Exception as exc:
        logger.error("   ✗  Failed to resume thread '%s': %s", thread_id, exc)
        return False


# ═══════════════════════════════════════════════════════════════
# LIST & DELETE
# ═══════════════════════════════════════════════════════════════

def list_feedback(
    user_id: str,
    db: Session,
    page: int = 1,
    limit: int = 20,
    recipe_id: Optional[str] = None,
) -> FeedbackListResponse:
    """Return paginated feedback submitted by the user."""
    offset = (page - 1) * limit

    query = db.query(UserFeedback).filter(UserFeedback.user_id == user_id)
    if recipe_id:
        query = query.filter(UserFeedback.recipe_id == recipe_id)

    rows = (
        query
          .order_by(UserFeedback.created_at.desc())
          .offset(offset)
          .limit(limit)
          .all()
    )
    total = query.count()

    return FeedbackListResponse(
        feedback=[
            FeedbackResponse(
                feedback_id             = r.id,
                recipe_id               = r.recipe_id,
                rating                  = r.rating,
                comment                 = r.comment,
                created_at              = r.created_at.isoformat(),
                learning_loop_triggered = False,   # historical rows — unknown
            )
            for r in rows
        ],
        total=total,
    )


def delete_feedback(
    feedback_id: str,
    user_id: str,
    db: Session,
) -> bool:
    """Delete a feedback entry. Returns True if deleted, False if not found."""
    fb = db.query(UserFeedback).filter_by(id=feedback_id, user_id=user_id).first()
    if not fb:
        return False
    db.delete(fb)
    db.flush()
    logger.info("Feedback %s deleted by user %s", feedback_id, user_id)
    return True




# ═══════════════════════════════════════════════════════════════
# MEAL LOG SERVICE
# ═══════════════════════════════════════════════════════════════

def _validate_meal_slot(slot: str) -> None:
    valid = {"breakfast", "lunch", "dinner", "snack"}
    if slot not in valid:
        raise ValueError(f"Invalid meal_slot '{slot}'. Must be one of: {sorted(valid)}")


def _validate_iso_date(raw: str) -> date:
    try:
        return date.fromisoformat(raw)
    except ValueError:
        raise ValueError(f"Invalid date '{raw}'. Use ISO format e.g. '2026-03-01'")


def log_meal(
    user: User,
    db: Session,
    payload: LogMealRequest,
) -> MealLogResponse:
    """
    Log a consumed meal to the DB.
    Validates slot + date then calls ProgressRepository.log_meal().
    """
    _validate_meal_slot(payload.meal_slot)
    _validate_iso_date(payload.log_date)

    entry = MealLogEntry(
        log_date  = payload.log_date,
        meal_slot = payload.meal_slot,
        dish_name = payload.dish_name,
        planned   = payload.planned,
        calories  = payload.calories,
        protein_g = payload.protein_g,
        carbs_g   = payload.carbs_g,
        fat_g     = payload.fat_g,
        source    = payload.source,
    )

    repo   = ProgressRepository(db)
    log_id = repo.log_meal(user.id, entry, recipe_id=payload.recipe_id)
    db.flush()

    logger.info(
        "Meal logged: user=%s date=%s slot=%s dish=%s (%d kcal)",
        user.id, payload.log_date, payload.meal_slot, payload.dish_name, payload.calories,
    )

    # Bust cached adherence for this user — data has changed
    mem_cache.delete_prefix(f"adherence:{user.id}:")

    # Fetch the saved row to get logged_at timestamp
    row = db.query(MealLog).filter_by(id=log_id).first()
    return MealLogResponse(
        log_id    = log_id,
        log_date  = payload.log_date,
        meal_slot = payload.meal_slot,
        dish_name = payload.dish_name,
        planned   = payload.planned,
        calories  = payload.calories,
        protein_g = payload.protein_g,
        carbs_g   = payload.carbs_g,
        fat_g     = payload.fat_g,
        source    = payload.source,
        logged_at = row.logged_at.isoformat() if row else datetime.utcnow().isoformat(),
    )


def list_meal_logs(
    user_id: str,
    db: Session,
    days: int = 7,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    meal_slot: Optional[str] = None,
) -> MealLogListResponse:
    """
    Return meal logs filtered by date range and/or meal slot.
    Defaults to last 7 days if no date range is given.
    """
    from sqlalchemy import and_

    # Build date range
    if date_from:
        d_from = date.fromisoformat(date_from)
    else:
        d_from = date.today() - timedelta(days=days)

    if date_to:
        d_to = date.fromisoformat(date_to)
    else:
        d_to = date.today()

    query = (
        db.query(MealLog)
          .filter(
              MealLog.user_id  == user_id,
              MealLog.log_date >= d_from,
              MealLog.log_date <= d_to,
          )
    )

    if meal_slot:
        query = query.filter(MealLog.meal_slot == meal_slot)

    rows  = query.order_by(MealLog.log_date.asc(), MealLog.logged_at.asc()).all()
    total = query.count()

    return MealLogListResponse(
        logs=[
            MealLogResponse(
                log_id    = r.id,
                log_date  = r.log_date.isoformat(),
                meal_slot = r.meal_slot,
                dish_name = r.dish_name,
                planned   = r.planned,
                calories  = r.calories,
                protein_g = r.protein_g,
                carbs_g   = r.carbs_g,
                fat_g     = r.fat_g,
                source    = r.source,
                logged_at = r.logged_at.isoformat(),
            )
            for r in rows
        ],
        total     = total,
        date_from = d_from.isoformat(),
        date_to   = d_to.isoformat(),
    )


def delete_meal_log(
    log_id: str,
    user_id: str,
    db: Session,
) -> bool:
    """Delete a meal log entry. Returns True if deleted, False if not found/not owned."""
    row = db.query(MealLog).filter_by(id=log_id, user_id=user_id).first()
    if not row:
        return False
    db.delete(row)
    db.flush()
    logger.info("Meal log %s deleted by user %s", log_id, user_id)
    # Bust cached adherence — data has changed
    mem_cache.delete_prefix(f"adherence:{user_id}:")
    return True


def get_adherence(
    user_id: str,
    db: Session,
    days: int = 7,
    calorie_target: Optional[int] = None,
) -> list[DailyAdherenceResponse]:
    """
    Return daily calorie adherence for the last N days.
    Calorie target is loaded from the user's current goal if not provided.
    Results are cached for TTL_ADHERENCE seconds and busted on any meal write.
    """
    from db.models import UserGoal
    from db.repositories import UserRepository

    # Load calorie target from DB goal if not passed in
    if calorie_target is None:
        repo = UserRepository(db)
        goal = repo.get_current_goal(user_id)
        calorie_target = goal.calorie_target if goal else 2000

    cache_key = f"adherence:{user_id}:{days}:{calorie_target}"
    cached = mem_cache.get(cache_key)
    if cached is not None:
        logger.debug("Adherence cache HIT for user %s (days=%d)", user_id, days)
        return cached

    prog_repo = ProgressRepository(db)
    adherence = prog_repo.get_daily_adherence(user_id, calorie_target, days=days)

    result = [
        DailyAdherenceResponse(
            log_date         = a.log_date,
            planned_calories = a.planned_calories,
            actual_calories  = a.actual_calories,
            adherence_pct    = a.adherence_pct,
            meals_logged     = a.meals_logged,
            meals_skipped    = a.meals_skipped,
        )
        for a in adherence
    ]

    mem_cache.set(cache_key, result, ttl=TTL_ADHERENCE)
    return result