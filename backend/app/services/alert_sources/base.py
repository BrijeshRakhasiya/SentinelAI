"""Alert source interface.

Every ingestion path (demo data, a static real-world JSON feed, or a live
MCP connector) implements this interface. The rest of the backend
(streaming, triage, audit log) never knows which one is active -- it only
calls ``get_alerts()`` and receives normalized ``Alert`` objects.

See MCP_CREATION_PLAN.md for the full architecture this supports.
"""

from abc import ABC, abstractmethod

from app.schemas.alert import Alert


class AlertSource(ABC):
    """Base class for anything that can produce a batch of normalized alerts."""

    #: Human-readable label surfaced on the dashboard (e.g. "Demo dataset",
    #: "AWS GuardDuty (MCP)").
    name: str = "Unknown source"

    @abstractmethod
    def get_alerts(self) -> list[Alert]:
        """Return the current batch of normalized alerts."""
        raise NotImplementedError

    def get_alert_by_id(self, alert_id: str) -> Alert | None:
        """Default implementation: linear scan over get_alerts(). Sources with
        a cheaper direct lookup (e.g. an MCP `get_alert_by_id` tool) should
        override this."""
        return next((a for a in self.get_alerts() if a.id == alert_id), None)
