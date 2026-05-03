# nodes/learning_loop.py


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

Analyze this user's feedback and any explicit modification they requested.
Extract structured preference updates.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FEEDBACK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Rating:  {rating} / 5
Comment: {comment}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EXPLICIT MODIFICATION REQUEST (strongest signal)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{modification_request}

If a modification was requested (e.g. "make it vegan", "reduce calories",
"use Indian spices"), treat it as a DIRECT, high-confidence preference
statement — more reliable than a comment alone.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 
RECIPE DETAILS (for high-rating inference)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Dish: {dish_name}
Cuisine: {cuisine}
Key Ingredients: {key_ingredients}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 CURRENT PROFILE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Fitness goal: {goal}
Cuisine preference: {cuisine_pref}
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
1. **liked_ingredients** — ingredients user enjoyed
   - If rating ≥ 4 stars AND comment is positive/generic (e.g. "loved it", "great", "delicious"),
     extract 2-3 KEY ingredients from the recipe above (main proteins, distinctive spices)
   - If comment mentions specific ingredients, prioritize those
   - If rating < 3 stars, leave empty

2. **disliked_ingredients** — ingredients to avoid
   - Extract from negative comments or low ratings (< 3 stars)
   - If modification requested "remove X", add X here

3. **preferred_textures** — e.g. crispy, soft, creamy

4. **preferred_cuisines** / **avoided_cuisines**
   - If rating ≥ 4 for a cuisine, add to preferred_cuisines
   - If rating ≤ 2, add to avoided_cuisines

5. **spice_preference** — if mentioned (mild / medium / hot)

6. **goal_refinement** — if feedback suggests goal has evolved

7. **session_insights** — 1-2 short bullet insights about this session

**CRITICAL**: For ratings ≥ 4 with positive/generic comments like "loved it", "great meal", 
"enjoyed this", extract liked ingredients FROM THE RECIPE — don't leave liked_ingredients empty!

Merge with existing preferences. Return empty lists (not null) if no data.
""")


def learning_loop_node(state: NutritionState) -> dict:
    logger.info("\n 🗸  Learning from feedback...")

    existing = state.learned_preferences

    # If a followup modification was made (e.g. "make it vegan"), include it as
    # a high-confidence explicit signal alongside the rating/comment.
    modification = state.followup_modification
    modification_text = (
        f"User explicitly requested: \"{modification}\""
        if modification
        else "No explicit modification requested this session."
    )

    # Extract recipe details for high-rating inference
    recipe = state.final_recipe
    dish_name = recipe.dish_name if recipe else "Unknown dish"
    cuisine = recipe.cuisine if recipe else "unspecified"
    
    # Get key ingredients (first 5 for context)
    key_ingredients = "not available"
    if recipe and recipe.ingredients:
        key_ingredients = ", ".join([
            ing.name for ing in recipe.ingredients[:5]
        ])

    messages = LEARNING_PROMPT.format_messages(
        rating=state.feedback_rating or "N/A",
        comment=state.feedback_comment or "No comment.",
        modification_request=modification_text,
        dish_name=dish_name,
        cuisine=cuisine,
        key_ingredients=key_ingredients,
        goal=state.fitness_goal or "not specified",
        cuisine_pref=state.preferences.get("cuisine", "any"),
        spice=state.preferences.get("spice_level", "medium"),
        prev_liked=", ".join(existing.liked_ingredients)    if existing else "none",
        prev_disliked=", ".join(existing.disliked_ingredients) if existing else "none",
        prev_insights="; ".join(existing.session_insights)  if existing else "none",
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
        logger.error("   ✗ Could not persist learned preferences (%s).", e)

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
            logger.info("   ✓ Updated goal saved to DB.")
        except Exception as e:
            logger.error("   ✗ Could not save updated goal to DB (%s).", e)

    logger.info(f"   ✓ Preferences updated.")
    if merged.liked_ingredients:    logger.info(f"      ✓ Likes: {', '.join(merged.liked_ingredients)}")
    if merged.disliked_ingredients: logger.info(f"      ✗ Dislikes: {', '.join(merged.disliked_ingredients)}")
    if merged.preferred_cuisines:   logger.info(f"      🌍 Preferred cuisines: {', '.join(merged.preferred_cuisines)}")
    if merged.goal_refinement:      logger.info(f"      🎯 Goal: {merged.goal_refinement}")

    return {
        "learned_preferences": merged,
        "updated_goals":       merged.goal_refinement or state.fitness_goal,
    }