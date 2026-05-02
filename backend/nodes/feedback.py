"""
nodes/feedback.py

Feedback collection node using LangGraph's interrupt() primitive.

How it works (REST API flow):
  1. POST /recipes/generate  → graph runs until this node → interrupt fires
     → FastAPI returns { recipe, thread_id } to client
  2. POST /feedback/         → client sends { rating, comment, thread_id }
     → recipe_service resumes the graph with Command(resume={...})
     → this node picks up the resumed value, saves to DB, returns state
     → graph continues to learning_loop_node → END

A single interrupt() call collects both rating and comment in one payload,
keeping the REST API to a clean two-endpoint flow.

Rule: Never wrap interrupt() in try/except (per LangGraph docs).
"""

from __future__ import annotations

import logging

from langgraph.types import interrupt
from state import NutritionState

logger = logging.getLogger(__name__)

MAX_VALIDATION_RETRIES = 2


def feedback_node(state: NutritionState) -> dict:
    """
    Pause the graph and wait for human feedback via interrupt().

    The interrupt payload is surfaced in the GraphOutput.interrupts list
    returned by graph.invoke().  The caller resumes with:

        graph.invoke(
            Command(resume={"rating": 4, "comment": "Loved it!"}),
            config=config,
            version="v2",
        )
    """
    # Already collected in a previous pass — skip re-collection
    if state.feedback_collected:
        logger.info("   ↩  Feedback already collected — skipping.")
        return {}

    logger.info("\n ⏸  Pausing for user feedback (interrupt)…")

    # ── Single interrupt — collect rating + comment together ──────────────────
    # The resume value is whatever the caller passes to Command(resume=...).
    response: dict = interrupt({
        "action":    "collect_feedback",
        "recipe_id": state.current_recipe_id,
        "message":   "Please rate this recipe (1–5) and leave an optional comment.",
    })

    rating  = int(response.get("rating",  0))
    comment = str(response.get("comment", "")).strip() or None

    # ── Persist to DB ─────────────────────────────────────────────────────────
    user_id   = state.customer_id or state.name or "anonymous"
    recipe_id = state.current_recipe_id

    if recipe_id:
        try:
            from db.database import get_db
            from db.repositories import UserRepository
            with get_db() as db:
                UserRepository(db).save_feedback(
                    user_id   = user_id,
                    recipe_id = recipe_id,
                    rating    = rating,
                    comment   = comment,
                )
            logger.info("   ✓  Feedback saved to DB (recipe=%s, rating=%d).", recipe_id, rating)
        except Exception as e:
            logger.error("   ✗  Could not save feedback to DB: %s", e)
    else:
        logger.warning("   ⚠  No recipe_id in state — feedback not linked to a recipe row.")

    return {
        "feedback_rating":    rating,
        "feedback_comment":   comment,
        "feedback_collected": True,
    }