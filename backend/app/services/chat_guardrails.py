"""Input/output guardrails for the dashboard chat assistant.

Blocks obvious prompt-injection and out-of-scope requests before they reach
the model, and strips sensitive markers from replies if the model leaks them.
"""

import re

# Shown when input is blocked or the model tries to go off-scope.
REFUSAL_REPLY = (
    "I can only help with **this triage session** — the alerts and decisions "
    "visible on your dashboard right now.\n\n"
    "Try asking things like:\n"
    "- What stands out in this session?\n"
    "- Why was a specific alert escalated?\n"
    "- How much analyst time did we save so far?"
)

_INJECTION_PATTERNS: list[re.Pattern[str]] = [
    re.compile(p, re.IGNORECASE)
    for p in [
        r"ignore\s+(all\s+)?(previous|prior|above)\s+(instructions?|rules?|prompts?)",
        r"disregard\s+(your\s+)?(instructions?|rules?|system\s+prompt)",
        r"forget\s+(everything|all)\s+(you\s+)?(were\s+)?(told|trained)",
        r"you\s+are\s+now\s+(a|an|in)\s",
        r"act\s+as\s+(if\s+you\s+are\s+)?(a|an|not)\s",
        r"pretend\s+(you\s+are|to\s+be)\s",
        r"(reveal|show|print|repeat|output)\s+(your\s+)?(system\s+)?(prompt|instructions?|rules?)",
        r"what\s+(is|are)\s+your\s+(system\s+)?(prompt|instructions?|rules?)",
        r"jailbreak",
        r"\bDAN\b",
        r"developer\s+mode",
        r"=====+\s*SESSION_DATA",
        r"SESSION_DATA\s+(START|END)",
        r"ALERT_DATA\s+(START|END)",
        r"(api[_\s-]?key|gemini[_\s-]?key|secret[_\s-]?key|\.env\b|supabase.*secret|service[_\s-]?role)",
        r"(password|credential)s?\s*(for|of|in)\s",
    ]
]

# If the model echoes fenced session data, cut from this marker onward.
_LEAK_MARKERS = (
    "===== SESSION_DATA START =====",
    "===== SESSION_DATA END =====",
    "Conversation so far:",
)


def check_user_message(message: str) -> tuple[bool, str | None]:
    """Return (allowed, refusal_reply). Refusal is set when blocked."""
    text = message.strip()
    if not text:
        return False, REFUSAL_REPLY

    for pattern in _INJECTION_PATTERNS:
        if pattern.search(text):
            return False, REFUSAL_REPLY

    return True, None


def _looks_like_session_dump(text: str) -> bool:
    """Heuristic: model echoed structured session JSON instead of summarizing."""
    lowered = text.lower()
    session_keys = ('"total"', '"auto_resolved"', '"escalated"', '"alerts"')
    if sum(1 for key in session_keys if key in lowered) >= 3:
        return True
    if '"reasoning"' in lowered and '"confidence"' in lowered and '"severity"' in lowered:
        return True
    return False


def sanitize_reply(reply: str) -> str:
    """Remove leaked context markers and trim unsafe trailing content."""
    cleaned = reply.strip()
    if not cleaned:
        return REFUSAL_REPLY

    if _looks_like_session_dump(cleaned):
        return REFUSAL_REPLY

    upper = cleaned.upper()
    for marker in _LEAK_MARKERS:
        idx = upper.find(marker.upper())
        if idx != -1:
            cleaned = cleaned[:idx].rstrip()
            break

    # Drop accidental markdown code fences wrapping the whole answer.
    if cleaned.startswith("```") and cleaned.endswith("```"):
        inner = cleaned.strip("`").strip()
        if inner and not inner.startswith("{"):
            cleaned = inner
        elif inner.startswith("{"):
            return REFUSAL_REPLY

    return cleaned or REFUSAL_REPLY
