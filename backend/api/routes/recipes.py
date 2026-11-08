"""
api/routers/recipes.py

Recipe endpoints:
  POST /recipes/generate          — generate a personalized recipe (LLM pipeline)
  GET  /recipes/{recipe_id}       — fetch a single saved recipe
  GET  /recipes/                  — list the authenticated user's past recipes
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from api.dependencies import get_db, get_current_user
from api.schemas.recipe_schemas import (
    GenerateRecipeRequest, RecipeResponse, RecipeSummary, RecipeListResponse,
)
from api.services.recipe_service import (
    generate_recipe_stream, get_recipe_by_id, list_user_recipes,
)
from db.models import User

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/recipes", tags=["Recipes"])


# ── POST /recipes/generate/stream (SSE) ──────────────────────────────────────

@router.post(
    "/generate/stream",
    summary="Generate a recipe with real-time SSE progress",
    description="""
Same as `POST /recipes/generate` but streams progress events via Server-Sent Events.

Each event is a JSON object on a `data:` line:

| `type`      | Fields                        | Meaning                          |
|-------------|-------------------------------|----------------------------------|
| `progress`  | `step`, `message`             | A pipeline node just completed   |
| `result`    | `data` (full RecipeResponse)  | Final recipe — generation done   |
| `error`     | `message`                     | Something went wrong             |
| `done`      | —                             | Stream closed                    |

⏱️ Events arrive every 2–8 seconds as each AI node completes.
""",
)
async def generate_recipe_stream_endpoint(
    payload:      GenerateRecipeRequest = GenerateRecipeRequest(),
    current_user: User = Depends(get_current_user),
    db:           Session = Depends(get_db),
):
    async def event_gen():
        try:
            async for chunk in generate_recipe_stream(
                user=current_user, db=db, request=payload
            ):
                yield chunk
        except Exception as exc:
            import json
            yield f"data: {json.dumps({'type': 'error', 'message': str(exc)})}\n\n"

    return StreamingResponse(
        event_gen(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


# ── GET /recipes/ ─────────────────────────────────────────────────────────────

@router.get(
    "/",
    response_model=RecipeListResponse,
    summary="List past recipes",
    description="Returns recipes previously generated for the authenticated user, newest first.",
)
def list_recipes(
    page:  int = Query(default=1,  ge=1,  description="Page number"),
    limit: int = Query(default=10, ge=1, le=50, description="Results per page"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return list_user_recipes(user_id=current_user.id, db=db, page=page, limit=limit)


# ── GET /recipes/{recipe_id} ──────────────────────────────────────────────────

@router.get(
    "/{recipe_id}",
    response_model=RecipeResponse,   # ← was RecipeSummary
    summary="Get a recipe by ID",
)
def get_recipe(
    recipe_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Fetch a saved recipe by its ID.

    Returns a compact summary. For the full recipe with steps and explanation,
    use the generate endpoint and store the response client-side.
    """
    recipe = get_recipe_by_id(recipe_id=recipe_id, db=db)
    if not recipe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recipe '{recipe_id}' not found.",
        )
    return recipe

