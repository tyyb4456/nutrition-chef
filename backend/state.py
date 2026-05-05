# state.py

from typing import Dict, Any, Optional
from pydantic import BaseModel, Field

from schemas.nutrition_schemas import (
    MedicalCondition,
    MacroSplit,
    AgeProfile,
    RecipeContext,
    RecipeOutput,
    ValidationResult,
    MacroAdjustmentOutput,
    SubstitutionOutput,
    LearnedPreferences,
    WeeklyProgressReport,
    MealPlan, GroceryList, MealPrepSchedule,
)

class NutritionState(BaseModel):

    # ── Session ────────────────────────────────────────────────
    session_id:  Optional[str] = None
    customer_id: Optional[str] = None   # DB primary key, set by profile_agent

    # ── User Profile ──────────────────────────────────────────
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    weight_kg: Optional[float] = None
    height_cm: Optional[float] = None
    activity_level: Optional[str] = None
    allergies: list[str] = Field(default_factory=list)
    preferences: Dict[str, Any] = Field(default_factory=dict)
    fitness_goal: Optional[str] = None
    medical_conditions: list[MedicalCondition] = Field(default_factory=list)
    profile_collected: bool = False

    # ── Health Goal Agent ─────────────────────────────────────
    calorie_target:   Optional[int]        = None
    macro_split:      Optional[MacroSplit] = None
    goal_type:        Optional[str]        = None
    goal_interpreted: bool                 = False
    age_profile:      Optional[AgeProfile] = None

    # ── RAG Context ───────────────────────────────────────────
    recipe_context: list[RecipeContext] = Field(default_factory=list)

    # ── Recipe Agent ──────────────────────────────────────────
    generated_recipe:  Optional[RecipeOutput] = None
    recipe_generated:  bool                   = False
    current_recipe_id: Optional[str]          = None   # DB id of generated recipe

    # ── Validation ────────────────────────────────────────────
    validation_result: Optional[ValidationResult] = None
    validation_passed: Optional[bool]             = None
    validation_notes:  Optional[str]              = None
    validation_retries: int                       = 0   # incremented inside graph retry loop

    # ── Macro Adjustment ──────────────────────────────────────
    macro_adjustment_output: Optional[MacroAdjustmentOutput] = None
    adjusted_by_macro_agent: bool                            = False

    # ── Substitution ──────────────────────────────────────────
    substitution_output: Optional[SubstitutionOutput] = None
    substitutions_made:  bool                         = False

    # ── Final Recipe ──────────────────────────────────────────
    final_recipe: Optional[RecipeOutput] = None

    # ── Explainability ────────────────────────────────────────
    recipe_explanation: Optional[str] = None

    # ── Feedback ──────────────────────────────────────────────
    feedback_rating:    Optional[int] = None
    feedback_comment:   Optional[str] = None
    feedback_collected: bool          = False

    # ── Follow-up (conversational Q&A / modify after generation) ──────────────
    followup_prompt:       Optional[str] = None
    followup_intent:       Optional[str] = None   # "question" | "modify" | "done"
    followup_answer:       Optional[str] = None
    followup_modification: Optional[str] = None
    followup_history:      list[str]     = Field(default_factory=list)

    # ── Learning ──────────────────────────────────────────────
    learned_preferences: Optional[LearnedPreferences] = None
    updated_goals:       Optional[str]                = None

    progress_report: Optional[WeeklyProgressReport] = None
    progress_days:   int                             = 7   # days window for progress report

    # ── Pipeline error propagation ────────────────────────────────────────────
    pipeline_error: Optional[str] = None
    retry_count : Optional[int] = None

# ═══════════════════════════════════════════════════════════════
# WEEKLY PLAN STATE (unchanged)
# ═══════════════════════════════════════════════════════════════

class WeeklyPlanState(BaseModel):
    """Separate state for the weekly meal plan pipeline."""
    customer_id:    Optional[str]          = None
    name:           Optional[str]          = None
    age:            Optional[int]          = None
    gender:         Optional[str]          = None
    weight_kg:      Optional[float]        = None
    height_cm:      Optional[float]        = None
    activity_level: Optional[str]          = None
    allergies:      list[str]              = Field(default_factory=list)
    preferences:    Dict[str, Any]         = Field(default_factory=dict)
    fitness_goal:   Optional[str]          = None
    medical_conditions: list[MedicalCondition] = Field(default_factory=list)
    profile_collected:  bool               = False

    calorie_target: Optional[int]          = None
    macro_split:    Optional[MacroSplit]   = None
    goal_type:      Optional[str]          = None
    age_profile:    Optional[AgeProfile]   = None

    meal_plan:           Optional[MealPlan]          = None
    grocery_list:        Optional[GroceryList]       = None
    meal_prep_schedule:  Optional[MealPrepSchedule]  = None

    error: Optional[str] = None