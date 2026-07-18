"""Triage orchestration: (cache | agent | fallback) -> server rule -> audit log.

Single entry point used by the SSE stream and any future endpoints.
"""

import logging

from sqlalchemy.orm import Session

from app.config import settings
from app.models.audit import TriageLog
from app.schemas.alert import Alert
from app.schemas.triage import AgentDecision, DecidedBy, TriageResult
from app.services import cache, decision
from app.services.agent import AgentError, triage_with_gemini

logger = logging.getLogger(__name__)


def _get_agent_decision(alert: Alert) -> tuple[AgentDecision, DecidedBy]:
    if settings.USE_CACHE:
        cached = cache.get_cached_decision(alert)
        if cached is not None:
            return cached, "cache"
        return cache.fallback_decision(alert), "fallback"

    try:
        return triage_with_gemini(alert), "gemini"
    except AgentError as exc:
        logger.warning("Agent failure for %s, using fallback: %s", alert.id, exc)
        cached = cache.get_cached_decision(alert)
        if cached is not None:
            return cached, "cache"
        return cache.fallback_decision(alert), "fallback"


def triage_alert(alert: Alert, db: Session) -> TriageResult:
    agent_decision, decided_by = _get_agent_decision(alert)

    # The server rule overrides whatever the model claimed.
    final_decision = decision.decide(agent_decision.confidence, alert.severity.value)

    result = TriageResult(
        alert=alert,
        decision=final_decision,
        confidence=agent_decision.confidence,
        reasoning=agent_decision.reasoning,
        suggested_action=agent_decision.suggested_action,
        decided_by=decided_by,
    )

    db.add(
        TriageLog(
            alert_id=alert.id,
            alert_title=alert.title,
            severity=alert.severity.value,
            source=alert.source,
            decision=result.decision,
            confidence=result.confidence,
            reasoning=result.reasoning,
            suggested_action=result.suggested_action,
            decided_by=decided_by,
        )
    )
    db.commit()

    return result
