"""Schemas for the chat assistant that answers analyst questions about the
current triage session (dashboard summaries, "why was X escalated", etc.)."""

from typing import Literal

from pydantic import BaseModel, Field

from app.schemas.triage import Decision


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=4000)


class ChatAlertContext(BaseModel):
    """Compact per-alert summary the frontend sends so the assistant can
    reference specific alerts without the backend re-querying the DB."""

    id: str
    title: str
    severity: str
    decision: Decision
    confidence: int
    reasoning: str = ""


class ChatContext(BaseModel):
    total: int = 0
    auto_resolved: int = 0
    escalated: int = 0
    alerts: list[ChatAlertContext] = Field(default_factory=list, max_length=25)


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    history: list[ChatMessage] = Field(default_factory=list, max_length=20)
    context: ChatContext = Field(default_factory=ChatContext)


class ChatResponse(BaseModel):
    reply: str
