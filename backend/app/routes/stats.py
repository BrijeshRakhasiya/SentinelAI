"""Aggregate counts for the dashboard chart."""

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.audit import TriageLog
from app.models.db import get_db
from app.routes.auth import get_current_user
from app.schemas.triage import StatsResponse

router = APIRouter(prefix="/api", tags=["stats"])


@router.get("/stats")
def stats(
    db: Session = Depends(get_db),
    _user: str = Depends(get_current_user),
) -> StatsResponse:
    rows = db.execute(
        select(TriageLog.decision, func.count()).group_by(TriageLog.decision)
    ).all()
    counts = {decision: count for decision, count in rows}
    auto_resolved = counts.get("auto_resolve", 0)
    escalated = counts.get("escalate", 0)
    return StatsResponse(
        total=auto_resolved + escalated,
        auto_resolved=auto_resolved,
        escalated=escalated,
    )
