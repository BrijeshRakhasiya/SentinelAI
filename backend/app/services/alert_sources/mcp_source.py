"""Alert source backed by a live MCP connector (AWS GuardDuty by default).

Fails safe: if the MCP connector is offline/degraded, this returns an empty
list instead of raising, so the stream simply shows nothing rather than
inventing or auto-resolving alerts it never actually received.
"""

import logging

from app.schemas.alert import Alert
from app.services.alert_sources.base import AlertSource
from app.services.mcp_client import mcp_client

logger = logging.getLogger(__name__)


class McpAlertSource(AlertSource):
    name = "AWS GuardDuty (MCP)"

    def __init__(self, mcp_source: str = "aws_guardduty", since_minutes: int = 15, limit: int = 25) -> None:
        self.mcp_source = mcp_source
        self.since_minutes = since_minutes
        self.limit = limit

    def get_alerts(self) -> list[Alert]:
        raw_alerts = mcp_client.get_alerts(
            source=self.mcp_source, since_minutes=self.since_minutes, limit=self.limit
        )
        alerts: list[Alert] = []
        for raw in raw_alerts:
            try:
                alerts.append(Alert(**raw))
            except Exception as exc:  # malformed connector payload -- drop, don't crash the feed
                logger.warning("MCP connector returned an invalid alert %s: %s", raw.get("id"), exc)
        return alerts
