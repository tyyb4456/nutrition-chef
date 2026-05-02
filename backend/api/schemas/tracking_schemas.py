from __future__ import annotations

from typing import Optional
from pydantic import BaseModel, Field


# ═══════════════════════════════════════════════════════════════
# FEEDBACK
# ═══════════════════════════════════════════════════════════════

class SubmitFeedbackRequest(BaseModel):
    recipe_id:  str          = Field(..., description="ID of the recipe being rated")
    rating:     int          = Field(..., ge=1, le=5, description="Star rating 1–5")
    comment:    Optional[str] = Field(
        default=None,
        max_length=1000,
        description="Optional free-text comment or suggestion",
        examples=["Loved the spices, but could use more protein!"],
    )
    # ── LangGraph thread to resume ────────────────────────────────────────────
    thread_id:  Optional[str] = Field(
        default=None,
        description=(
            "Graph thread ID returned by POST /recipes/generate. "
            "When provided, the learning loop agent runs automatically after "
            "your feedback is saved — improving future recipe recommendations."
        ),
    )


class FeedbackResponse(BaseModel):
    feedback_id:             str
    recipe_id:               str
    rating:                  int
    comment:                 Optional[str]
    created_at:              str
    learning_loop_triggered: bool = Field(
        default=False,
        description="True when the learning loop agent ran successfully after saving feedback.",
    )


class FeedbackListResponse(BaseModel):
    feedback: list[FeedbackResponse]
    total:    int