"""
agents/learning_loop_agent.py — Phase 4

Phase 4 upgrade:
- Persists updated LearnedPreferences to PostgreSQL + ChromaDB
  via memory/progress_store.save_learned_preferences()
- Also saves goal updates back to user_goals table if goal changed
- All Phase 3 structured output + merge logic preserved
"""

from __future__ import annotations

import logging

from state import NutritionState
from schemas.nutrition_schemas import LearnedPreferences
from langchain.chat_models import init_chat_model
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

model = init_chat_model("google_genai:gemini-2.5-flash")
llm   = model.with_structured_output(LearnedPreferences)

LEARNING_PROMPT = ChatPromptTemplate.from_template("""
You are a behavioral nutritionist and learning agent.

Analyze this user's feedback. Extract structured preference updates.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 FEEDBACK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Rating:  {rating} / 5
Comment: {comment}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 CURRENT PROFILE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Fitness goal: {goal}
Cuisine preference: {cuisine}
Spice preference: {spice}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 EXISTING PREFERENCES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Previously liked: {prev_liked}
Previously disliked: {prev_disliked}
Previous insights: {prev_insights}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 TASK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Extract:
1. liked_ingredients — ingredients user enjoyed
2. disliked_ingredients — ingredients to avoid
3. preferred_textures — e.g. crispy, soft
4. preferred_cuisines / avoided_cuisines
5. spice_preference — if mentioned
6. goal_refinement — if feedback suggests goal has evolved
7. session_insights — 1-2 short bullet insights

Merge with existing preferences. Return empty lists (not null) if no data.
""")


def learning_loop_agent_node(state: NutritionState) -> dict:
    logger.info("\n Learning from feedback...")

    existing = state.learned_preferences

    messages = LEARNING_PROMPT.format_messages(
        rating=state.feedback_rating or "N/A",
        comment=state.feedback_comment or "No comment.",
        goal=state.fitness_goal or "not specified",
        cuisine=state.preferences.get("cuisine", "any"),
        spice=state.preferences.get("spice_level", "medium"),
        prev_liked=", ".join(existing.liked_ingredients)   if existing else "none",
        prev_disliked=", ".join(existing.disliked_ingredients) if existing else "none",
        prev_insights="; ".join(existing.session_insights) if existing else "none",
    )

    new_prefs: LearnedPreferences = llm.invoke(messages)

    # ── Merge with existing ───────────────────────────────────────────────────
    if existing:
        merged = LearnedPreferences(
            liked_ingredients    = list(set(existing.liked_ingredients    + new_prefs.liked_ingredients)),
            disliked_ingredients = list(set(existing.disliked_ingredients + new_prefs.disliked_ingredients)),
            preferred_textures   = list(set(existing.preferred_textures   + new_prefs.preferred_textures)),
            preferred_cuisines   = list(set(existing.preferred_cuisines   + new_prefs.preferred_cuisines)),
            avoided_cuisines     = list(set(existing.avoided_cuisines     + new_prefs.avoided_cuisines)),
            spice_preference     = new_prefs.spice_preference or existing.spice_preference,
            goal_refinement      = new_prefs.goal_refinement  or existing.goal_refinement,
            session_insights     = (existing.session_insights + new_prefs.session_insights)[-5:],
        )
    else:
        merged = new_prefs

    # ── Persist to DB + ChromaDB ──────────────────────────────────────────────
    user_id = state.customer_id or state.name or "anonymous"
    try:
        from memory.progress_store import save_learned_preferences
        save_learned_preferences(user_id, merged)
        logger.info("   🗸  Learned preferences saved to DB.")
    except Exception as e:
        logger.error("  ✗  Could not persist learned preferences (%s).", e)

    # ── If goal changed, record a new user_goal row ───────────────────────────
    if merged.goal_refinement and state.customer_id and state.macro_split:
        try:
            from db.database import get_db
            from db.repositories import UserRepository
            with get_db() as db:
                UserRepository(db).save_goal(
                    user_id=state.customer_id,
                    macro=state.macro_split,
                    calorie_target=state.calorie_target,
                    goal_type=state.goal_type or "maintenance",
                )
            logger.info("  🗸  Updated goal saved to DB.")
        except Exception as e:
            logger.error("  ✗  Could not save updated goal to DB (%s).", e)

    logger.info(f"   🗸  Preferences updated.")
    if merged.liked_ingredients:    logger.info (f"      Likes: {', '.join(merged.liked_ingredients)}")
    if merged.disliked_ingredients: logger.info(f"      Dislikes: {', '.join(merged.disliked_ingredients)}")
    if merged.goal_refinement:      logger.info(f"      Goal: {merged.goal_refinement}")

    return {
        "learned_preferences": merged,
        "updated_goals":       merged.goal_refinement or state.fitness_goal,
    }