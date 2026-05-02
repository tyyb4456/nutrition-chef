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
from typing import Optional

from sqlalchemy.orm import Session

from db.models import User, UserFeedback
from db.repositories import UserRepository
from api.schemas.tracking_schemas import (
    SubmitFeedbackRequest, FeedbackResponse, FeedbackListResponse,
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

    if payload.thread_id:
        learning_loop_triggered = _resume_graph_for_learning(
            thread_id = payload.thread_id,
            rating    = payload.rating,
            comment   = payload.comment,
        )
    else:
        logger.info(
            "No thread_id provided — skipping learning loop. "
            "Pass thread_id from POST /recipes/generate to enable it."
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
      feedback_node  — receives resume value, marks feedback_collected=True
      learning_loop_node — runs, updates learned preferences in DB

    Returns True on success, False on any error.
    """
    try:
        from langgraph.types import Command
        from pipeline.nutrition_graph import nutrition_graph

        config = {"configurable": {"thread_id": thread_id}}

        # Verify the thread is actually paused (not expired / unknown)
        snapshot = nutrition_graph.get_state(config)
        if snapshot is None:
            logger.warning(
                "Graph thread '%s' not found in checkpointer — "
                "learning loop skipped.", thread_id,
            )
            return False

        logger.info(
            "Resuming graph thread '%s' with feedback (rating=%d).", thread_id, rating,
        )

        nutrition_graph.invoke(
            Command(resume={"rating": rating, "comment": comment or ""}),
            config  = config,
            version = "v2",
        )

        logger.info("   ✓  Learning loop completed for thread '%s'.", thread_id)
        return True

    except Exception as exc:
        logger.error(
            "   ✗  Failed to resume graph thread '%s': %s", thread_id, exc,
        )
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
