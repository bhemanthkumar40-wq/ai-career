"""
Assistant Router: Career guidance, resume review, and interview prep chat endpoint.
"""

from fastapi import APIRouter, Depends
from backend.app import schemas
from backend.app.auth import get_current_user
from backend.app import models
from backend.app.gemini_service import generate_career_chat

router = APIRouter(prefix="/api/assistant", tags=["Career Assistant"])


@router.post("/chat", response_model=schemas.ChatResponse)
def chat_with_assistant(
    req: schemas.ChatRequest,
    current_user: models.User = Depends(get_current_user)
):
    """
    Chat endpoint for career coaching, resume critique, and mock interview practice.
    Uses Google Gemini API when GEMINI_API_KEY is configured in the environment;
    otherwise serves structured, explainable responses from the local coach.
    """
    msg_dicts = [{"role": m.role, "content": m.content} for m in req.messages]
    result = generate_career_chat(messages=msg_dicts, mode=req.mode)
    return schemas.ChatResponse(
        response=result["response"],
        model_used=result["model_used"],
        is_gemini_active=result["is_gemini_active"],
        suggestions=result.get("suggestions", [])
    )
