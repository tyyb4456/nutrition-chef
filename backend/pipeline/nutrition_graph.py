"""
pipeline/nutrition_graph.py

The canonical compiled LangGraph StateGraph for the nutrition pipeline.

Graph topology:
  START
    └─▶ health_goal
          └─▶ recipe_generator
                └─▶ nutrition_validation ──(pass / max-retries)──▶ substitution
                          │                                              └─▶ explainability
                          └──(fail + retries < 2)──▶ macro_adjustment          └─▶ feedback   ← interrupt() lives here
                                    └─▶ nutrition_validation (loop)                  └─▶ learning_loop
                                                                                           └─▶ END

Checkpointer:
  MemorySaver — in-process, no external dependency.
  Swap to AsyncPostgresSaver for production persistence across restarts.

Usage (recipe generation):
    from pipeline.nutrition_graph import nutrition_graph
    import uuid

    config  = {"configurable": {"thread_id": str(uuid.uuid4())}}
    initial = NutritionState(...)

    result = nutrition_graph.invoke(initial, config=config, version="v2")
    # result.interrupts → list with the interrupt payload from feedback_node
    # Graph is now paused waiting for feedback.

Usage (feedback / resume):
    from langgraph.types import Command

    nutrition_graph.invoke(
        Command(resume={"rating": 4, "comment": "Loved it!"}),
        config=config,   # same thread_id as above
        version="v2",
    )
    # Graph resumes → feedback_node continues → learning_loop_node → END
"""

from __future__ import annotations

import logging

from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver

from state import NutritionState
from nodes.health_goal       import health_goal_node
from nodes.generate_recipe   import recipe_generator_node
from nodes.validate_nutrition import nutrition_validation_node
from nodes.macro_adjustment  import macro_adjustment_node
from nodes.substitution      import substitution_node
from nodes.explainability    import explainability_node
from nodes.feedback          import feedback_node
from nodes.learning_loop     import learning_loop_node

logger = logging.getLogger(__name__)

MAX_VALIDATION_RETRIES = 2

# ─────────────────────────────────────────────────────────────────────────────
# Router functions (conditional edges)
# ─────────────────────────────────────────────────────────────────────────────

def route_after_validation(state: NutritionState) -> str:
    """
    After nutrition_validation_node runs, decide next node:
      - passed              → substitution
      - failed but retries left → macro_adjustment (will loop back)
      - failed, max retries → substitution (best-effort)
    """
    if state.validation_passed:
        logger.info("   ✓  Validation passed — proceeding to substitution.")
        return "substitution"

    if state.validation_retries < MAX_VALIDATION_RETRIES:
        logger.info(
            "   ⚠  Validation failed (retry %d/%d) — running macro adjustment.",
            state.validation_retries + 1,
            MAX_VALIDATION_RETRIES,
        )
        return "macro_adjustment"

    logger.warning("   ✗  Max retries reached — accepting best-effort recipe.")
    return "substitution"


def increment_retries(state: NutritionState) -> dict:
    """
    Thin 'bump-retries' node inserted between macro_adjustment and
    nutrition_validation so the retry counter advances each loop iteration.
    """
    return {"validation_retries": state.validation_retries + 1}


# ─────────────────────────────────────────────────────────────────────────────
# Graph definition
# ─────────────────────────────────────────────────────────────────────────────

def _build_graph() -> StateGraph:
    g = StateGraph(NutritionState)

    # ── Nodes ─────────────────────────────────────────────────────────────────
    g.add_node("health_goal",          health_goal_node)
    g.add_node("recipe_generator",     recipe_generator_node)
    g.add_node("nutrition_validation", nutrition_validation_node)
    g.add_node("macro_adjustment",     macro_adjustment_node)
    g.add_node("bump_retries",         increment_retries)   # thin counter node
    g.add_node("substitution",         substitution_node)
    g.add_node("explainability",       explainability_node)
    g.add_node("feedback",             feedback_node)        # ← interrupt() here
    g.add_node("learning_loop",        learning_loop_node)

    # ── Linear edges ──────────────────────────────────────────────────────────
    g.add_edge(START,               "health_goal")
    g.add_edge("health_goal",       "recipe_generator")
    g.add_edge("recipe_generator",  "nutrition_validation")

    # ── Conditional retry loop ─────────────────────────────────────────────────
    g.add_conditional_edges(
        "nutrition_validation",
        route_after_validation,
        {
            "substitution":    "substitution",
            "macro_adjustment": "macro_adjustment",
        },
    )
    # macro_adjustment → bump_retries → nutrition_validation  (retry loop)
    g.add_edge("macro_adjustment", "bump_retries")
    g.add_edge("bump_retries",     "nutrition_validation")

    # ── Post-validation linear chain ──────────────────────────────────────────
    g.add_edge("substitution",   "explainability")
    g.add_edge("explainability", "feedback")        # ← graph pauses here
    g.add_edge("feedback",       "learning_loop")
    g.add_edge("learning_loop",  END)

    return g


# ─────────────────────────────────────────────────────────────────────────────
# Compiled singleton  (import this everywhere)
# ─────────────────────────────────────────────────────────────────────────────

_checkpointer = MemorySaver()

nutrition_graph = _build_graph().compile(checkpointer=_checkpointer)

logger.info("nutrition_graph compiled — checkpointer: MemorySaver")
