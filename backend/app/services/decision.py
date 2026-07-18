"""Server-enforced triage rule. Non-negotiable per plan.md section 7.

The LLM's own decision field is advisory; this rule always wins so a
hallucinated 'auto_resolve' on a high-severity alert can never slip through.
"""

from app.schemas.triage import Decision


def decide(confidence: int, severity: str) -> Decision:
    if confidence >= 75 and severity != "high":
        return "auto_resolve"
    return "escalate"
