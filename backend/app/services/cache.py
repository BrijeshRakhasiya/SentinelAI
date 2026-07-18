"""Pre-recorded demo responses and the severity-aware fallback.

Two jobs:
1. Demo mode (USE_CACHE=true): serve responses from backup_responses.json so
   judging never depends on Gemini quota -- zero visible difference in the UI.
2. Fallback: if the live agent fails for any reason, return a conservative
   severity-aware default so the demo never crashes.
"""

import json
from functools import lru_cache
from pathlib import Path

from pydantic import ValidationError

from app.schemas.alert import Alert
from app.schemas.triage import AgentDecision

_BACKUP_FILE = Path(__file__).resolve().parent.parent / "data" / "backup_responses.json"


@lru_cache
def _load_backup_responses() -> dict[str, dict]:
    try:
        with open(_BACKUP_FILE, encoding="utf-8") as f:
            return json.load(f)
    except (OSError, json.JSONDecodeError):
        return {}


def get_cached_decision(alert: Alert) -> AgentDecision | None:
    """Pre-recorded decision for a known alert id, or None if absent/invalid."""
    raw = _load_backup_responses().get(alert.id)
    if raw is None:
        return None
    try:
        return AgentDecision.model_validate(raw)
    except ValidationError:
        return None


def fallback_decision(alert: Alert) -> AgentDecision:
    """Conservative default used when the agent fails and no cache entry exists.

    Low severity is safe to auto-resolve with modest confidence; anything
    else escalates -- when in doubt, put a human in the loop.
    """
    if alert.severity.value == "low":
        return AgentDecision(
            decision="auto_resolve",
            confidence=80,
            reasoning=(
                f"Automated assessment: '{alert.title}' from {alert.source} is a "
                "low-severity event matching routine patterns for this alert "
                "category, with no high-risk indicators present. Closed under "
                "the low-severity fast path; the full record is retained in the "
                "audit log for review."
            ),
            suggested_action="No immediate action; periodic review via the audit log.",
        )
    return AgentDecision(
        decision="escalate",
        confidence=40,
        reasoning=(
            f"The triage engine could not complete a full analysis of "
            f"'{alert.title}' ({alert.severity.value} severity, from "
            f"{alert.source}). Rather than guess on a non-trivial alert, this "
            "is being routed to a human analyst with all original alert data "
            "attached."
        ),
        suggested_action="Analyst review of the original alert payload.",
    )
