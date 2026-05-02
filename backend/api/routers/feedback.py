"""
api/routers/feedback.py

Feedback endpoints:
  POST   /feedback/              — submit a recipe rating + comment
  GET    /feedback/              — list all feedback by the current user
  DELETE /feedback/{feedback_id} — delete a specific feedback entry
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from dependencies import get_db, get_current_user
from schemas.tracking_schemas import (
    SubmitFeedbackRequest, FeedbackResponse, FeedbackListResponse,
)
from services.tracking_service import (
    submit_feedback, list_feedback, delete_feedback,
)
from db.models import User

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/feedback", tags=["Feedback"])

from typing import Optional


# ── POST /feedback/ ───────────────────────────────────────────────────────────

@router.post(
    "/",
    response_model=FeedbackResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit feedback for a recipe",
    description="""
Rate a recipe and optionally leave a comment.

**Two-phase LangGraph flow:**

1. `POST /recipes/generate` runs the AI pipeline and pauses at the feedback step,
   returning your recipe along with a `thread_id`.
2. Calling this endpoint with that `thread_id` **resumes the paused graph** via
   `Command(resume={rating, comment})`, which triggers the
   **learning loop agent** — analysing your feedback and updating your
   learned preferences in the database for better future recommendations.

> Pass `thread_id` (from the generate response) to enable the learning loop.  
> Omitting it saves feedback to the DB but skips preference learning.

The `learning_loop_triggered` field in the response confirms whether
the agent ran successfully.
""",
)
def submit_feedback_endpoint(
    payload: SubmitFeedbackRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Submit a rating (1–5) and optional comment for a recipe.

    - `recipe_id` must match a recipe from `POST /recipes/generate`.
    - `thread_id` (optional) — resume the paused LangGraph thread to trigger
      the learning loop agent. Get it from the generate response.
    """
    try:
        return submit_feedback(user=current_user, db=db, payload=payload)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


# ── GET /feedback/ ────────────────────────────────────────────────────────────

@router.get("/", response_model=FeedbackListResponse)
def list_my_feedback(
    page:      int          = Query(default=1, ge=1),
    limit:     int          = Query(default=20, ge=1, le=100),
    recipe_id: Optional[str] = Query(default=None),   # ← add this
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return list_feedback(user_id=current_user.id, db=db, page=page, limit=limit, recipe_id=recipe_id)


# ── DELETE /feedback/{feedback_id} ────────────────────────────────────────────

@router.delete(
    "/{feedback_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a feedback entry",
)
def delete_feedback_endpoint(
    feedback_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Delete feedback by ID. Users can only delete their own feedback.
    Returns 204 No Content on success, 404 if not found.
    """
    deleted = delete_feedback(feedback_id=feedback_id, user_id=current_user.id, db=db)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Feedback '{feedback_id}' not found.",
        )