"""
pipeline/nutrition_graph.py

Compiled LangGraph StateGraph with a PostgreSQL checkpointer.

Checkpointer:
  Uses PostgresSaver (langgraph-checkpoint-postgres) backed by a
  psycopg v3 ConnectionPool.  Thread states survive server restarts,
  so a POST /feedback/ can resume a graph thread from the previous
  POST /recipes/generate even after a process restart.

  Connection pool reads DATABASE_URL from the environment (same DB
  as the rest of the app — LangGraph creates its own checkpoint
  tables via checkpointer.setup()).

Graph topology:
  START → health_goal → recipe_generator → nutrition_validation
            ├─(pass / max-retries)──────────────────────▶ substitution
            └─(fail + retries < 2)──▶ macro_adjustment
                         └─▶ bump_retries ──▶ nutrition_validation (loop)

  substitution → explainability → feedback_node  ← interrupt() fires here
                                        └─▶ learning_loop → END

Usage — Phase 1 (generate):
    from pipeline.nutrition_graph import nutrition_graph
    import uuid

    config = {"configurable": {"thread_id": str(uuid.uuid4())}}
    result = nutrition_graph.invoke(state, config=config, version="v2")
    # result.interrupts → interrupt payload from feedback_node

Usage — Phase 2 (resume after feedback):
    from langgraph.types import Command
    nutrition_graph.invoke(
        Command(resume={"rating": 4, "comment": "Loved it!"}),
        config=config,
        version="v2",
    )
"""

from __future__ import annotations

import logging
import os

from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.postgres import PostgresSaver
from psycopg_pool import ConnectionPool

from state import NutritionState
from nodes.health_goal        import health_goal_node
from nodes.generate_recipe    import recipe_generator_node
from nodes.validate_nutrition import nutrition_validation_node
from nodes.macro_adjustment   import macro_adjustment_node
from nodes.substitution       import substitution_node
from nodes.explainability     import explainability_node
from nodes.feedback           import feedback_node
from nodes.learning_loop      import learning_loop_node

logger = logging.getLogger(__name__)

MAX_VALIDATION_RETRIES = 2

# ─────────────────────────────────────────────────────────────────────────────
# PostgreSQL connection pool  (module-level singleton)
# ─────────────────────────────────────────────────────────────────────────────

_DATABASE_URL: str = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/nutrition",
)

# psycopg v3 requires autocommit=True for the LangGraph checkpointer.
# prepare_threshold=0 disables server-side prepared statements — safe for
# PgBouncer / Railway proxy environments where sessions aren't guaranteed.
_pool = ConnectionPool(
    conninfo = _DATABASE_URL,
    max_size = 10,
    kwargs   = {
        "autocommit":        True,
        "prepare_threshold": 0,
    },
    open = False,   # opened explicitly below so errors surface at startup
)

try:
    _pool.open(wait=True, timeout=10)
    logger.info("psycopg_pool opened — %d connection(s) ready.", _pool.get_stats().get("pool_min", 0))
except Exception as _pool_err:
    logger.error(
        "Could not open PostgreSQL connection pool for checkpointer: %s. "
        "Falling back to MemorySaver.", _pool_err,
    )
    _pool = None  # type: ignore[assignment]


# ─────────────────────────────────────────────────────────────────────────────
# Router functions (conditional edges)
# ─────────────────────────────────────────────────────────────────────────────

def route_after_validation(state: NutritionState) -> str:
    """
    After nutrition_validation_node:
      passed               → substitution
      failed + retries left → macro_adjustment (loops back)
      failed + max retries  → substitution (best-effort)
    """
    if state.validation_passed:
        logger.info("   ✓  Validation passed — proceeding to substitution.")
        return "substitution"

    if state.validation_retries < MAX_VALIDATION_RETRIES:
        logger.info(
            "   ⚠  Validation failed (retry %d/%d) — running macro adjustment.",
            state.validation_retries + 1, MAX_VALIDATION_RETRIES,
        )
        return "macro_adjustment"

    logger.warning("   ✗  Max retries reached — accepting best-effort recipe.")
    return "substitution"


def increment_retries(state: NutritionState) -> dict:
    """
    Thin node inserted between macro_adjustment and nutrition_validation
    to advance the retry counter in state on each loop iteration.
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
    g.add_node("bump_retries",         increment_retries)
    g.add_node("substitution",         substitution_node)
    g.add_node("explainability",       explainability_node)
    g.add_node("feedback",             feedback_node)   # ← interrupt() here
    g.add_node("learning_loop",        learning_loop_node)

    # ── Linear edges ──────────────────────────────────────────────────────────
    g.add_edge(START,              "health_goal")
    g.add_edge("health_goal",      "recipe_generator")
    g.add_edge("recipe_generator", "nutrition_validation")

    # ── Conditional retry loop ─────────────────────────────────────────────────
    g.add_conditional_edges(
        "nutrition_validation",
        route_after_validation,
        {
            "substitution":     "substitution",
            "macro_adjustment": "macro_adjustment",
        },
    )
    g.add_edge("macro_adjustment", "bump_retries")
    g.add_edge("bump_retries",     "nutrition_validation")

    # ── Post-validation chain ──────────────────────────────────────────────────
    g.add_edge("substitution",   "explainability")
    g.add_edge("explainability", "feedback")
    g.add_edge("feedback",       "learning_loop")
    g.add_edge("learning_loop",  END)

    return g


# ─────────────────────────────────────────────────────────────────────────────
# Checkpointer setup + graph compilation
# ─────────────────────────────────────────────────────────────────────────────

def _make_checkpointer():
    """
    Returns a PostgresSaver if the pool is healthy, otherwise MemorySaver.
    PostgresSaver.setup() creates the LangGraph checkpoint tables
    (checkpoints, checkpoint_blobs, checkpoint_writes) if they don't exist.
    """
    if _pool is not None:
        try:
            cp = PostgresSaver(_pool)
            cp.setup()   # idempotent — safe to call on every startup
            logger.info("LangGraph checkpointer: PostgresSaver (Railway PostgreSQL)")
            return cp
        except Exception as e:
            logger.error(
                "PostgresSaver.setup() failed: %s — falling back to MemorySaver.", e,
            )

    from langgraph.checkpoint.memory import MemorySaver
    logger.warning("LangGraph checkpointer: MemorySaver (in-process, non-persistent)")
    return MemorySaver()


_checkpointer = _make_checkpointer()

# Compiled singleton — import this everywhere
nutrition_graph = _build_graph().compile(checkpointer=_checkpointer)

logger.info("nutrition_graph compiled successfully.")


# ─────────────────────────────────────────────────────────────────────────────
# Pool lifecycle helper — call from FastAPI lifespan if desired
# ─────────────────────────────────────────────────────────────────────────────

def close_pool() -> None:
    """
    Gracefully close the psycopg connection pool.
    Call this from FastAPI's shutdown lifespan event:

        @asynccontextmanager
        async def lifespan(app: FastAPI):
            yield
            from pipeline.nutrition_graph import close_pool
            close_pool()
    """
    if _pool is not None and not _pool.closed:
        _pool.close()
        logger.info("psycopg_pool closed.")
