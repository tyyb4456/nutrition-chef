"""
agents/feedback_agent.py — Phase 4 (interrupt fix)
"""

from __future__ import annotations

import logging

from langgraph.types import interrupt
from state import NutritionState

logger = logging.getLogger(__name__)


def feedback_node(state: NutritionState) -> dict:
    # Already collected in a previous pass — skip re-collection
    if state.feedback_collected:
        return {}

    logger.info("\n Collecting feedback on the meal...")

    # ── Pass 1 / 2: collect rating via interrupt ──────────────────────────────
    while True:
        raw_rating = interrupt(" Rate the recipe (1–5):")
        try:
            rating = int(str(raw_rating).strip())
            if 1 <= rating <= 5:
                break
            logger.warning("  ⚠  Please enter a number between 1 and 5.")
        except (ValueError, TypeError):
            logger.warning("  ⚠  Invalid input. Enter a number between 1 and 5.")

    # ── Pass 2 / 3: collect comment via interrupt ─────────────────────────────
    raw_comment = interrupt(" Any comments or suggestions? (press Enter to skip):")
    comment = str(raw_comment).strip() or None

    # ── Persist to DB ─────────────────────────────────────────────────────────
    user_id   = state.customer_id or state.name or "anonymous"
    recipe_id = state.current_recipe_id

    if recipe_id:
        try:
            from db.database import get_db
            from db.repositories import UserRepository
            with get_db() as db:
                UserRepository(db).save_feedback(
                    user_id=user_id,
                    recipe_id=recipe_id,
                    rating=rating,
                    comment=comment,
                )
    # 🗸   ✗
            logger.info("   🗸   Feedback saved to DB.")
        except Exception as e:
            logger.error("  ✗   Could not save feedback to DB (%s).", e)
    else:
        logger.info("No recipe_id in state — feedback not linked to a recipe row.")

    return {
        "feedback_rating":    rating,
        "feedback_comment":   comment,
        "feedback_collected": True,
    }