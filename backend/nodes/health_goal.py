# agents/health_agent.py

from state import NutritionState
from schemas.nutrition_schemas import MacroSplit, AgeProfile, MedicalCondition

import logging
logger = logging.getLogger(__name__)


# ── Activity level multipliers (Mifflin-St Jeor) ─────────────────────────────
ACTIVITY_FACTORS = {
    "sedentary":   1.2,
    "light":       1.375,
    "moderate":    1.55,
    "active":      1.725,
    "very_active": 1.9,
}

# ── Safe calorie floors by goal (never go below these) ───────────────────────
CALORIE_FLOOR = {
    "muscle_gain": 1800,
    "fat_loss":    1200,
    "maintenance": 1500,
}

# ── Default fallback calories (when profile is incomplete) ───────────────────
DEFAULT_CALORIES = {
    "muscle_gain": 2800,
    "fat_loss":    1800,
    "maintenance": 2200,
}


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def _classify_goal(goal: str) -> str:
    goal = goal.lower()
    if any(k in goal for k in ["muscle", "gain", "bulk", "mass", "weight gain"]):
        return "muscle_gain"
    elif any(k in goal for k in ["loss", "cut", "fat", "slim", "lean", "weight loss"]):
        return "fat_loss"
    return "maintenance"


def _calculate_bmr(age: int, gender: str, weight_kg: float, height_cm: float) -> float:
    """Mifflin-St Jeor equation."""
    if gender.lower() in ("male", "m"):
        return 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
    return 10 * weight_kg + 6.25 * height_cm - 5 * age - 161


def _build_age_profile(age: int) -> AgeProfile:
    """
    Derive dietary flags from age alone.
    These flags influence macro targets AND recipe generation prompts.
    """
    if age < 18:
        return AgeProfile(
            age_group="teen",
            higher_calcium_need=True,
            higher_iron_need=True,
            notes="Teens need extra calcium (bone growth) and iron (blood production). "
                  "Avoid aggressive calorie restriction.",
        )
    elif age < 35:
        return AgeProfile(
            age_group="young_adult",
            notes="Young adults have high metabolic capacity. "
                  "Standard macro targets apply.",
        )
    elif age < 60:
        return AgeProfile(
            age_group="adult",
            notes="Adults should prioritise protein for muscle retention "
                  "and manage sodium for cardiovascular health.",
        )
    else:
        return AgeProfile(
            age_group="senior",
            higher_protein_need=True,
            lower_sodium_need=True,
            higher_calcium_need=True,
            lower_calorie_adjust=True,
            notes="Seniors need more protein (sarcopenia prevention), less sodium "
                  "(blood pressure), and more calcium (bone density). "
                  "TDEE is reduced by ~10–15% vs younger adults.",
        )


def _macro_split_for_goal_and_age(
    goal_type: str,
    age_profile: AgeProfile,
    conditions: list[MedicalCondition],
) -> MacroSplit:
    """
    Returns a MacroSplit tuned for:
    - Fitness goal
    - Age group
    - Medical conditions

    All splits must sum to 100.
    """

    # ── Base splits per goal ──────────────────────────────────────────────────
    base = {
        "muscle_gain": {"protein": 35, "carbs": 40, "fat": 25},
        "fat_loss":    {"protein": 35, "carbs": 30, "fat": 35},
        "maintenance": {"protein": 30, "carbs": 40, "fat": 30},
    }[goal_type]

    protein = base["protein"]
    carbs   = base["carbs"]
    fat     = base["fat"]

    # ── Age adjustments ───────────────────────────────────────────────────────
    if age_profile.higher_protein_need:
        # Seniors: boost protein by 5%, pull from carbs
        protein = min(protein + 5, 45)
        carbs   = max(carbs - 5, 20)

    # ── Medical condition adjustments ─────────────────────────────────────────
    condition_names = [c.condition for c in conditions]

    if "diabetes" in condition_names:
        # Lower carbs, shift to fat and protein
        carbs   = max(carbs - 10, 20)
        fat     = min(fat + 5, 40)
        protein = min(protein + 5, 45)

    if "hypertension" in condition_names or "heart_disease" in condition_names:
        # Lower fat slightly, favour complex carbs
        fat   = max(fat - 5, 20)
        carbs = min(carbs + 5, 50)

    if "kidney_disease" in condition_names:
        # Lower protein — kidneys struggle with high protein load
        protein = max(protein - 10, 15)
        carbs   = min(carbs + 5, 55)
        fat     = min(fat + 5, 40)

    # ── Ensure sum = 100 ──────────────────────────────────────────────────────
    total = protein + carbs + fat
    if total != 100:
        # Absorb rounding error into carbs (most flexible macro)
        carbs += (100 - total)

    return MacroSplit(protein=protein, carbs=carbs, fat=fat)


def _apply_medical_calorie_adjustments(
    calorie_target: int,
    conditions: list[MedicalCondition],
    goal_type: str,
) -> int:
    """
    Modify calorie target based on medical conditions.
    """
    condition_names = [c.condition for c in conditions]

    if "diabetes" in condition_names and goal_type == "muscle_gain":
        # Cap muscle gain surplus for diabetics — aggressive surplus spikes blood sugar
        calorie_target = min(calorie_target, 2800)

    if "heart_disease" in condition_names or "hypertension" in condition_names:
        # Heart patients: conservative surplus / deficit
        if goal_type == "fat_loss":
            calorie_target = max(calorie_target, 1600)  # don't go too low

    if "kidney_disease" in condition_names:
        # Kidney patients need moderate, not aggressive, deficits
        if goal_type == "fat_loss":
            calorie_target = max(calorie_target, 1500)

    return calorie_target


# ─────────────────────────────────────────────────────────────────────────────
# Agent Node
# ─────────────────────────────────────────────────────────────────────────────

def health_goal_node(state: NutritionState) -> dict:
    logger.info("\n Calculating science-based dietary requirements...")

    goal_type  = _classify_goal(state.fitness_goal or "")
    age        = state.age or 25
    conditions = state.medical_conditions or []

    # ── 1. Build age profile ──────────────────────────────────────────────────
    age_profile = _build_age_profile(age)
    logger.info(f"   Age group: {age_profile.age_group}")
    if age_profile.notes:
        logger.info(f"   Age notes: {age_profile.notes}")

    # ── 2. Calculate TDEE ─────────────────────────────────────────────────────
    calorie_target = None

    if all([state.age, state.gender, state.weight_kg, state.height_cm]):
        try:
            bmr = _calculate_bmr(
                age=state.age,
                gender=state.gender,
                weight_kg=state.weight_kg,
                height_cm=state.height_cm,
            )

            activity = (state.activity_level or "moderate").lower().replace(" ", "_")
            factor   = ACTIVITY_FACTORS.get(activity, 1.55)
            tdee     = bmr * factor

            # Senior TDEE reduction
            if age_profile.lower_calorie_adjust:
                tdee *= 0.90
                logger.info("   Senior TDEE adjustment applied (−10%)")

            if goal_type == "muscle_gain":
                calorie_target = int(tdee + 300)
            elif goal_type == "fat_loss":
                calorie_target = int(tdee - 500)
            else:
                calorie_target = int(tdee)

            logger.info(f"   BMR: {bmr:.0f} kcal | TDEE: {tdee:.0f} kcal | Raw target: {calorie_target} kcal")

        except Exception as e:
            logger.warning(f"   ⚠ BMR calculation failed ({e}), using defaults.")

    if calorie_target is None:
        calorie_target = DEFAULT_CALORIES[goal_type]
        logger.info(f"   Using default calorie target ({calorie_target} kcal)")

    # ── 3. Apply calorie floor + medical adjustments ──────────────────────────
    floor          = CALORIE_FLOOR[goal_type]
    calorie_target = max(calorie_target, floor)
    calorie_target = _apply_medical_calorie_adjustments(calorie_target, conditions, goal_type)

    # ── 4. Build macro split ──────────────────────────────────────────────────
    macro_split = _macro_split_for_goal_and_age(goal_type, age_profile, conditions)

    # ── 5. Log condition flags ────────────────────────────────────────────────
    if conditions:
        names = [c.condition for c in conditions]
        logger.info(f"  Medical conditions factored in: {', '.join(names)}")

    logger.info(f"Goal: {goal_type} | Calories: {calorie_target} | Macros: P{macro_split.protein}/C{macro_split.carbs}/F{macro_split.fat}")

    return {
        "calorie_target":   calorie_target,
        "macro_split":      macro_split,
        "goal_type":        goal_type,
        "age_profile":      age_profile,
        "goal_interpreted": True,
    }