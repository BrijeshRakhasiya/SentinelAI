"""Chat assistant endpoint: answers analyst questions about the current
triage session using the same Gemini credentials as the triage agent."""

from fastapi import APIRouter, Depends, Request

from app.dependencies import get_current_user
from app.schemas.chat import ChatRequest, ChatResponse
from app.security import limiter
from app.services.chat_guardrails import check_user_message, sanitize_reply
from app.services.chatbot import ChatError, fallback_reply, generate_reply

router = APIRouter(prefix="/api", tags=["chat"])


def _validate_conversation(body: ChatRequest) -> str | None:
    """Return a refusal reply if any user turn looks like injection."""
    allowed, refusal = check_user_message(body.message)
    if not allowed:
        return refusal
    for turn in body.history:
        if turn.role == "user":
            allowed, refusal = check_user_message(turn.content)
            if not allowed:
                return refusal
    return None


@router.post("/chat")
@limiter.limit("20/minute")
def chat(
    request: Request,
    body: ChatRequest,
    _user: str = Depends(get_current_user),
) -> ChatResponse:
    refusal = _validate_conversation(body)
    if refusal:
        return ChatResponse(reply=refusal)

    try:
        reply = generate_reply(body.message, body.history, body.context)
    except ChatError:
        reply = fallback_reply(body.context)
    return ChatResponse(reply=sanitize_reply(reply))
