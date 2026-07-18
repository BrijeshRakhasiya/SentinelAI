"""Audit trail: one row per triage decision, per compliance requirements."""

from datetime import datetime, timezone

from sqlalchemy import DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.db import Base


class TriageLog(Base):
    __tablename__ = "triage_log"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    alert_id: Mapped[str] = mapped_column(String(32), index=True)
    alert_title: Mapped[str] = mapped_column(String(255))
    severity: Mapped[str] = mapped_column(String(16))
    source: Mapped[str] = mapped_column(String(64))
    decision: Mapped[str] = mapped_column(String(16), index=True)  # auto_resolve | escalate
    confidence: Mapped[int] = mapped_column(Integer)
    reasoning: Mapped[str] = mapped_column(Text)
    suggested_action: Mapped[str] = mapped_column(Text, default="")
    decided_by: Mapped[str] = mapped_column(String(16))  # gemini | cache | fallback
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
