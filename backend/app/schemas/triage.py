from typing import Literal

from pydantic import BaseModel, Field

from app.schemas.alert import Alert

Decision = Literal["auto_resolve", "escalate"]
DecidedBy = Literal["gemini", "cache", "fallback"]


class AgentDecision(BaseModel):
    """Schema-validated LLM output. The model's own `decision` field is
    advisory only -- the server-side rule in services/decision.py wins."""

    decision: Decision
    confidence: int = Field(ge=0, le=100)
    reasoning: str
    suggested_action: str = ""


class TriageResult(BaseModel):
    """Final, server-enforced result sent to clients and audit-logged."""

    alert: Alert
    decision: Decision
    confidence: int
    reasoning: str
    suggested_action: str = ""
    decided_by: DecidedBy


class StatsResponse(BaseModel):
    total: int
    auto_resolved: int
    escalated: int
