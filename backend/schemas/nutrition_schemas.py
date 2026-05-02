# schemas/nutrition_schemas.py


from __future__ import annotations
from pydantic import BaseModel, Field, field_validator
from typing import Optional, Literal
from datetime import date


# ---------
# user profile related schemas
# ---------

MedicalConditionType = Literal[
    "diabetes", "hypertension", "celiac", "lactose_intolerance",
    "kidney_disease", "heart_disease", "ibs", "anemia", "osteoporosis", "none",
]

class MedicalCondition(BaseModel):
    condition: MedicalConditionType = Field(...)
    notes:     Optional[str]        = None



# ----------
# health goal related schemas
# ----------

class MacroSplit(BaseModel):
    protein: int = Field(..., ge=0, le=100)
    carbs:   int = Field(..., ge=0, le=100)
    fat:     int = Field(..., ge=0, le=100)

    @field_validator("fat")
    @classmethod
    def macros_must_sum_to_100(cls, fat: int, info) -> int:
        protein = info.data.get("protein", 0)
        carbs   = info.data.get("carbs", 0)
        total   = protein + carbs + fat
        if total != 100:
            raise ValueError(
                f"Macro percentages must sum to 100. "
                f"Got: protein={protein}, carbs={carbs}, fat={fat} → total={total}"
            )
        return fat
    
class AgeProfile(BaseModel):
    age_group:            str  = Field(...)
    higher_protein_need:  bool = False
    lower_sodium_need:    bool = False
    higher_calcium_need:  bool = False
    higher_iron_need:     bool = False
    lower_calorie_adjust: bool = False
    notes:                str  = ""


class MacroSplit(BaseModel):
    protein: int = Field(..., ge=0, le=100)
    carbs:   int = Field(..., ge=0, le=100)
    fat:     int = Field(..., ge=0, le=100)

    @field_validator("fat")
    @classmethod
    def macros_must_sum_to_100(cls, fat: int, info) -> int:
        protein = info.data.get("protein", 0)
        carbs   = info.data.get("carbs", 0)
        total   = protein + carbs + fat
        if total != 100:
            raise ValueError(
                f"Macro percentages must sum to 100. "
                f"Got: protein={protein}, carbs={carbs}, fat={fat} → total={total}"
            )
        return fat

# ----------
# recipe generation related schemas
# ----------

# --- rag ----

class RecipeContext(BaseModel):
    dish_name:       str       = Field(...)
    cuisine:         str       = Field(...)
    goal_fit:        str       = Field(...)
    key_proteins:    list[str] = Field(...)
    approx_calories: int       = Field(...)
    notes:           str       = ""

# -----

class NutritionFacts(BaseModel):
    calories:   int            = Field(..., ge=0)
    protein_g:  float          = Field(..., ge=0)
    carbs_g:    float          = Field(..., ge=0)
    fat_g:      float          = Field(..., ge=0)
    fiber_g:    Optional[float] = Field(default=None, ge=0)
    sodium_mg:  Optional[float] = Field(default=None, ge=0)
    calcium_mg: Optional[float] = Field(default=None, ge=0)
    iron_mg:    Optional[float] = Field(default=None, ge=0)
    sugar_g:    Optional[float] = Field(default=None, ge=0)

    @field_validator("calories")
    @classmethod
    def calories_must_be_realistic(cls, v: int) -> int:
        if v < 50:
            raise ValueError(f"Calories too low: {v} kcal")
        if v > 5000:
            raise ValueError(f"Calories too high: {v} kcal")
        return v


class Ingredient(BaseModel):
    name:     str = Field(..., description="Ingredient name")
    quantity: str = Field(..., description="Amount with unit e.g. '200g'")

class RecipeOutput(BaseModel):
    dish_name:         str              = Field(...)
    ingredients:       list[Ingredient] = Field(...)
    steps:             list[str]        = Field(...)
    nutrition:         NutritionFacts   = Field(...)
    cuisine:           Optional[str]    = None
    prep_time_minutes: Optional[int]    = Field(default=None, ge=1)
    meal_type:         Optional[str]    = Field(
        default=None,
        description="breakfast / lunch / dinner / snack"
    )

    def ingredients_as_strings(self) -> list[str]:
        return [f"{ing.quantity} {ing.name}" for ing in self.ingredients]


# --------
# validation related schemas
# --------

class ValidationResult(BaseModel):
    passed:           bool  = Field(...)
    calorie_check:    bool  = Field(...)
    protein_check:    bool  = Field(...)
    carbs_check:      bool  = Field(...)
    fat_check:        bool  = Field(...)
    fiber_check:      bool  = Field(default=True)
    allergen_check:   bool  = Field(default=True)
    notes:            str   = Field(...)
    calorie_diff_pct: float = Field(...)


# ---------
# macro adjustment related schemas
# ---------


class MacroAdjustmentOutput(BaseModel):
    adjusted_recipe:  RecipeOutput = Field(...)
    adjustment_notes: str          = Field(...)


# ---------
# substitution related schemas
# ---------

class SubstitutionItem(BaseModel):
    original_ingredient:   str = Field(...)
    substitute_ingredient: str = Field(...)
    reason:                str = Field(...)


class SubstitutionOutput(BaseModel):
    substitutions_made: bool                  = Field(...)
    substitutions:      list[SubstitutionItem] = Field(default_factory=list)
    revised_recipe:     Optional[RecipeOutput] = None



# ------- 
# learning related schemas
# -------

class LearnedPreferences(BaseModel):
    liked_ingredients:    list[str]    = Field(default_factory=list)
    disliked_ingredients: list[str]    = Field(default_factory=list)
    preferred_textures:   list[str]    = Field(default_factory=list)
    preferred_cuisines:   list[str]    = Field(default_factory=list)
    avoided_cuisines:     list[str]    = Field(default_factory=list)
    spice_preference:     Optional[str] = None
    goal_refinement:      Optional[str] = None
    session_insights:     list[str]    = Field(default_factory=list)