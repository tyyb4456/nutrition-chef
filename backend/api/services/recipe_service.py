# api/services/recipe_service.py


from __future__ import annotations

import logging
import uuid
from concurrent.futures import ThreadPoolExecutor
from typing import Optional

from sqlalchemy.orm import Session

from state import NutritionState
from schemas.nutrition_schemas import MedicalCondition, MacroSplit
from db.models import User
from db.repositories import UserRepository, RecipeRepository
from nodes.health_goal  import health_goal_node
from nodes.followup     import followup_node
from pipeline.nutrition_graph import nutrition_graph
from api.schemas.recipe_schemas import (
    GenerateRecipeRequest, RecipeResponse, RecipeSummary, RecipeListResponse,
    IngredientOut, NutritionOut, SubstitutionOut, ValidationOut, FollowupResponse,
)

logger = logging.getLogger(__name__)

# Shared thread pool — reused across requests (avoid spawning threads per-call)
_executor = ThreadPoolExecutor(max_workers=4)

MAX_RETRIES = 2


# ═══════════════════════════════════════════════════════════════
# STATE BUILDER
# ═══════════════════════════════════════════════════════════════

def _build_state_from_profile(
    user: User,
    db: Session,
    request: GenerateRecipeRequest,
) -> NutritionState:
    """
    Load the user's saved profile from DB and construct a NutritionState.
    Request fields override profile values when provided.

    Crucially: also loads learned_preferences from DB so that every new
    graph thread starts with the user's full accumulated preference history.
    Preferences are user-scoped in PostgreSQL (written by learning_loop_node),
    NOT thread-scoped — so they persist across all sessions.
    """
    repo    = UserRepository(db)
    profile = db.query(__import__("db.models", fromlist=["UserProfile"]).UserProfile)\
                .filter_by(user_id=user.id).first()
    prefs      = repo.get_preferences(user.id)
    allergies  = repo.get_allergies(user.id)
    conditions = repo.get_medical_conditions(user.id)

    # Merge request allergies with profile allergies (deduplicated)
    all_allergies = list(set(allergies + request.extra_allergies))

    # Request fields override profile preferences
    cuisine      = request.cuisine     or prefs.get("cuisine", "any")
    spice_level  = request.spice_level or prefs.get("spice_level", "medium")
    fitness_goal = request.fitness_goal or prefs.get("fitness_goal", "maintenance")

    # ── Load accumulated learned preferences from DB (user-scoped) ────────────
    # These are written by learning_loop_node after each feedback session.
    # Loading them here ensures every new recipe thread benefits from all past
    # learning — preferences are NOT stored in the graph checkpoint (thread-scoped).
    learned_prefs = None
    try:
        from memory.progress_store import load_learned_preferences
        learned_prefs = load_learned_preferences(user.id)
        if learned_prefs:
            logger.info(
                "     🗸    Loaded learned preferences for user %s "
                "(likes=%d, dislikes=%d, insights=%d)",
                user.id,
                len(learned_prefs.liked_ingredients),
                len(learned_prefs.disliked_ingredients),
                len(learned_prefs.session_insights),
            )
        else:
            logger.info("   ✗  No learned preferences yet for user %s — starting fresh.", user.id)
    except Exception as e:
        logger.warning("   ⚠  Could not load learned preferences for user %s: %s", user.id, e)

    return NutritionState(
        # Identity
        customer_id = user.id,
        name        = user.name,
        session_id  = None,

        # Physical stats from profile
        age            = profile.age            if profile else None,
        gender         = profile.gender         if profile else None,
        weight_kg      = profile.weight_kg      if profile else None,
        height_cm      = profile.height_cm      if profile else None,
        activity_level = profile.activity_level if profile else "moderate",

        # Health & preferences
        fitness_goal       = fitness_goal,
        allergies          = all_allergies,
        medical_conditions = conditions,
        preferences        = {
            "cuisine":     cuisine,
            "spice_level": spice_level,
            **({("meal_type"): request.meal_type} if request.meal_type else {}),
        },

        # ── Inject user's accumulated learning history ─────────────────────
        learned_preferences = learned_prefs,

        profile_collected = True,   
    )



# ═══════════════════════════════════════════════════════════════
# PIPELINE RUNNER  (proper LangGraph graph.invoke)
# ═══════════════════════════════════════════════════════════════

def _run_graph_until_interrupt(
    state: NutritionState,
    thread_id: str,
) -> tuple[NutritionState, list]:
    """
    Run nutrition_graph from the beginning until the feedback interrupt fires.

    Returns:
        (final_state_snapshot, interrupts_list)

    The graph pauses at feedback_node's interrupt() call.
    The caller must resume later via Command(resume=...) on the same thread_id.
    """
    config = {"configurable": {"thread_id": thread_id}}

    result = nutrition_graph.invoke(state, config=config, version="v2")

    # result is a GraphOutput (dict-like) in LangGraph v2
    # .interrupts is a list of Interrupt objects with .value containing the payload
    interrupts = getattr(result, "interrupts", None) or []

    # Reconstruct NutritionState from the snapshot stored in the checkpointer
    snapshot = nutrition_graph.get_state(config)
    final_state = NutritionState(**snapshot.values) if snapshot else NutritionState()

    return final_state, interrupts


# ═══════════════════════════════════════════════════════════════
# RESPONSE BUILDER
# ═══════════════════════════════════════════════════════════════

def _build_response(
    state: NutritionState,
    recipe_id: str,
    thread_id: Optional[str] = None,
) -> RecipeResponse:
    """Map NutritionState → RecipeResponse."""
    recipe     = state.final_recipe
    validation = state.validation_result
    sub_output = state.substitution_output

    nutrition = NutritionOut(
        calories   = recipe.nutrition.calories,
        protein_g  = recipe.nutrition.protein_g,
        carbs_g    = recipe.nutrition.carbs_g,
        fat_g      = recipe.nutrition.fat_g,
        fiber_g    = recipe.nutrition.fiber_g,
        sodium_mg  = recipe.nutrition.sodium_mg,
        calcium_mg = recipe.nutrition.calcium_mg,
        iron_mg    = recipe.nutrition.iron_mg,
        sugar_g    = recipe.nutrition.sugar_g,
    )

    substitutions = []
    if sub_output and sub_output.substitutions_made:
        substitutions = [
            SubstitutionOut(
                original   = s.original_ingredient,
                substitute = s.substitute_ingredient,
                reason     = s.reason,
            )
            for s in sub_output.substitutions
        ]

    validation_out = ValidationOut(
        passed           = validation.passed          if validation else True,
        calorie_check    = validation.calorie_check   if validation else True,
        protein_check    = validation.protein_check   if validation else True,
        carbs_check      = validation.carbs_check     if validation else True,
        fat_check        = validation.fat_check       if validation else True,
        fiber_check      = validation.fiber_check     if validation else True,
        allergen_check   = validation.allergen_check  if validation else True,
        calorie_diff_pct = validation.calorie_diff_pct if validation else 0.0,
        notes            = validation.notes           if validation else "",
    )

    macro = state.macro_split
    return RecipeResponse(
        recipe_id         = recipe_id,
        dish_name         = recipe.dish_name,
        cuisine           = recipe.cuisine,
        meal_type         = recipe.meal_type,
        prep_time_minutes = recipe.prep_time_minutes,
        ingredients       = [IngredientOut(name=i.name, quantity=i.quantity) for i in recipe.ingredients],
        steps             = recipe.steps,
        nutrition         = nutrition,
        substitutions     = substitutions,
        explanation       = state.recipe_explanation,
        validation        = validation_out,
        calorie_target    = state.calorie_target or 0,
        macro_split       = {"protein": macro.protein, "carbs": macro.carbs, "fat": macro.fat} if macro else {},
        from_cache        = False,
        thread_id         = thread_id,
    )


# ═══════════════════════════════════════════════════════════════
# PUBLIC SERVICE FUNCTIONS
# ═══════════════════════════════════════════════════════════════

async def generate_recipe(
    user: User,
    db: Session,
    request: GenerateRecipeRequest,
) -> RecipeResponse:
    """
    Main entry point called by POST /recipes/generate.

    Flow:
      1. Build NutritionState from DB profile.
      2. Run nutrition_graph until feedback interrupt fires (thread pauses).
      3. Save recipe to DB.
      4. Return RecipeResponse with thread_id so client can resume via POST /feedback/.
    """
    import asyncio

    # ── Build initial state ───────────────────────────────────────────────────
    state     = _build_state_from_profile(user, db, request)
    thread_id = f"gen-{uuid.uuid4()}"   # prefix so tracking_service routes to nutrition_graph

    # ── Run compiled graph in thread pool (LLM calls are blocking) ────────────
    loop = asyncio.get_event_loop()
    final_state, interrupts = await loop.run_in_executor(
        _executor,
        _run_graph_until_interrupt,
        state,
        thread_id,
    )

    if not final_state.final_recipe:
        raise ValueError("   ✗   Pipeline completed but no final recipe in state.")

    if not interrupts:
        logger.warning(
            "   ⚠   Graph finished without an interrupt — feedback_node may have been skipped. "
            "thread_id=%s", thread_id,
        )

    # ── Persist recipe to DB ──────────────────────────────────────────────────
    recipe_repo = RecipeRepository(db)
    recipe_id   = recipe_repo.save(
        final_state.final_recipe,
        source      = "generated",
        explanation = final_state.recipe_explanation,
    )
    db.flush()

    # ── Store recipe_id back into the graph's checkpointed state ─────────────
    # So that when the graph resumes at feedback_node, state.current_recipe_id
    # is set and the feedback can be linked to the correct DB row.
    config = {"configurable": {"thread_id": thread_id}}
    nutrition_graph.update_state(
        config,
        {"current_recipe_id": recipe_id},
    )

    logger.info(
        "   🗸   Recipe '%s' saved (id=%s, thread=%s) for user %s",
        final_state.final_recipe.dish_name, recipe_id, thread_id, user.id,
    )

    return _build_response(final_state, recipe_id, thread_id=thread_id)


async def followup_recipe(
    user: User,
    db: Session,
    recipe_id: str,
    prompt: str,
) -> "FollowupResponse":
    """
    Entry point for POST /recipes/{recipe_id}/followup.

    intent == question / done:
        Runs followup_node only (cheap classify call, no graph).

    intent == modify:
        pass
    """
    import asyncio
    from schemas.nutrition_schemas import RecipeOutput, Ingredient, NutritionFacts

    loop = asyncio.get_event_loop()

    # ── Load saved Recipe row from DB ─────────────────────────────────────────
    recipe_repo = RecipeRepository(db)
    saved       = recipe_repo.get_by_id(recipe_id)
    if not saved:
        raise ValueError(f"   ✗   Recipe '{recipe_id}' not found.")

    n = saved.nutrition
    prior_recipe = RecipeOutput(
        dish_name         = saved.name,
        cuisine           = saved.cuisine,
        meal_type         = saved.meal_type,
        prep_time_minutes = saved.prep_time_minutes,
        ingredients       = [Ingredient(name=i.name, quantity=i.quantity) for i in (saved.ingredients or [])],
        steps             = [],
        nutrition         = NutritionFacts(
            calories=n.calories if n else 0,   protein_g=n.protein_g if n else 0.0,
            carbs_g=n.carbs_g if n else 0.0,   fat_g=n.fat_g if n else 0.0,
            fiber_g=n.fiber_g if n else None,   sodium_mg=n.sodium_mg if n else None,
            calcium_mg=n.calcium_mg if n else None, iron_mg=n.iron_mg if n else None,
            sugar_g=n.sugar_g if n else None,
        ),
    )

    # ── Build state for intent classification ─────────────────────────────────
    classify_state = _build_state_from_profile(user, db, GenerateRecipeRequest())
    updates        = health_goal_node(classify_state)   # calorie context for Q&A
    classify_state = classify_state.model_copy(update={
        **updates,
        "final_recipe":      prior_recipe,
        "recipe_explanation": None,
        "current_recipe_id": recipe_id,
        "followup_prompt":   prompt,
    })

    # ── Step 1: Classify intent (lightweight followup_node call) ──────────────
    def _classify(s: NutritionState) -> NutritionState:
        return s.model_copy(update=followup_node(s))

    classified = await loop.run_in_executor(_executor, _classify, classify_state)
    intent      = classified.followup_intent

    # ── Step 2: Route by intent ───────────────────────────────────────────────
    if intent == "question":
        logger.info("Follow-up intent: question.")
        return FollowupResponse(
            intent=intent, answer=classified.followup_answer,
            recipe=None, followup_history=classified.followup_history,
        )

    if intent == "done":
        logger.info("Follow-up intent: done.")
        return FollowupResponse(
            intent=intent, answer="You're all set! Enjoy your meal.",
            recipe=None, followup_history=classified.followup_history,
        )

    # intent == "modify" — reuse nutrition_graph end-to-end (same as generate)
    logger.info(
        "   🗸   Follow-up intent: modify ('%s') — invoking nutrition_graph.",
        classified.followup_modification,
    )

    # Fresh state so the graph runs all nodes without stale flags.
    # Inject modification into preferences so recipe_generator_node picks it up.
    mod_state = _build_state_from_profile(user, db, GenerateRecipeRequest())
    mod_state = mod_state.model_copy(update={
        "preferences": {
            **mod_state.preferences,
            "followup_modification": classified.followup_modification,
        },
        "followup_modification": classified.followup_modification,
        "followup_history":      classified.followup_history,
    })

    mod_thread_id = f"mod-{uuid.uuid4()}"
    final_state, _ = await loop.run_in_executor(
        _executor, _run_graph_until_interrupt, mod_state, mod_thread_id,
    )

    if not final_state.final_recipe:
        raise ValueError("   ✗   Recipe modification failed — no final recipe in state.")

    # Save modified recipe to DB + patch recipe_id into paused graph checkpoint
    new_recipe_id = recipe_repo.save(
        final_state.final_recipe, source="regenerated",
        explanation=final_state.recipe_explanation,
    )
    db.flush()
    nutrition_graph.update_state(
        {"configurable": {"thread_id": mod_thread_id}},
        {"current_recipe_id": new_recipe_id},
    )

    logger.info("   🗸   Modified recipe saved (id=%s, thread=%s) for user %s",
                new_recipe_id, mod_thread_id, user.id)

    return FollowupResponse(
        intent           = "modify",
        answer           = None,
        recipe           = _build_response(final_state, new_recipe_id, thread_id=mod_thread_id),
        followup_history = classified.followup_history,
        thread_id        = mod_thread_id,
    )



def get_recipe_by_id(recipe_id: str, db: Session) -> Optional[RecipeResponse]:
    """Fetch a single recipe by its DB id — full detail including ingredients and steps."""
    from db.models import Recipe as RecipeModel, RecipeNutrition, RecipeIngredient, RecipeStep

    row = db.query(RecipeModel).filter_by(id=recipe_id).first()
    if not row:
        return None

    nutrition   = db.query(RecipeNutrition).filter_by(recipe_id=recipe_id).first()
    ingredients = db.query(RecipeIngredient).filter_by(recipe_id=recipe_id).all()
    steps       = (
        db.query(RecipeStep)
        .filter_by(recipe_id=recipe_id)
        .order_by(RecipeStep.step_number)
        .all()
    )

    nutrition_out = NutritionOut(
        calories   = nutrition.calories   if nutrition else 0,
        protein_g  = nutrition.protein_g  if nutrition else 0.0,
        carbs_g    = nutrition.carbs_g    if nutrition else 0.0,
        fat_g      = nutrition.fat_g      if nutrition else 0.0,
        fiber_g    = nutrition.fiber_g    if nutrition else None,
        sodium_mg  = nutrition.sodium_mg  if nutrition else None,
        calcium_mg = nutrition.calcium_mg if nutrition else None,
        iron_mg    = nutrition.iron_mg    if nutrition else None,
        sugar_g    = nutrition.sugar_g    if nutrition else None,
    ) if nutrition else NutritionOut(calories=0, protein_g=0, carbs_g=0, fat_g=0)

    return RecipeResponse(
        recipe_id         = row.id,
        dish_name         = row.name,
        cuisine           = row.cuisine,
        meal_type         = row.meal_type,
        prep_time_minutes = row.prep_time_minutes,
        ingredients       = [IngredientOut(name=i.name, quantity=i.quantity) for i in ingredients],
        steps             = [s.instruction for s in steps],
        nutrition         = nutrition_out,
        substitutions     = [],
        explanation       = row.explanation,
        validation        = ValidationOut(
            passed=True, calorie_check=True, protein_check=True,
            carbs_check=True, fat_check=True, fiber_check=True,
            allergen_check=True, calorie_diff_pct=0.0, notes="",
        ),
        calorie_target    = 0,
        macro_split       = {},
        from_cache        = False,
        thread_id         = None,   # historical recipe — no active graph thread
    )


def list_user_recipes(
    user_id: str,
    db: Session,
    page: int = 1,
    limit: int = 10,
) -> RecipeListResponse:
    """
    List all recipes ever generated for a user via their meal logs / feedback.
    Falls back to listing all recipes saved in the recipe table ordered by date.
    """
    from db.models import Recipe as RecipeModel, RecipeNutrition, UserFeedback

    offset = (page - 1) * limit

    # Get recipes linked to this user via feedback (most recent first)
    subq = (
        db.query(UserFeedback.recipe_id)
          .filter_by(user_id=user_id)
          .subquery()
    )

    rows = (
        db.query(RecipeModel)
          .filter(RecipeModel.id.in_(subq))
          .order_by(RecipeModel.generated_at.desc())
          .offset(offset)
          .limit(limit)
          .all()
    )

    total = db.query(RecipeModel).filter(RecipeModel.id.in_(subq)).count()

    summaries = []
    for row in rows:
        nutrition = db.query(RecipeNutrition).filter_by(recipe_id=row.id).first()
        summaries.append(RecipeSummary(
            recipe_id = row.id,
            dish_name = row.name,
            cuisine   = row.cuisine,
            meal_type = row.meal_type,
            calories  = nutrition.calories  if nutrition else 0,
            protein_g = nutrition.protein_g if nutrition else 0.0,
            carbs_g   = nutrition.carbs_g   if nutrition else 0.0,
            fat_g     = nutrition.fat_g     if nutrition else 0.0,
        ))

    return RecipeListResponse(
        recipes = summaries,
        total   = total,
        page    = page,
        limit   = limit,
    )