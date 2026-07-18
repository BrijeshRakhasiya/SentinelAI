"""Alert source registry.

Selects which `AlertSource` implementation feeds the triage stream based on
`settings.ALERT_SOURCE`. See MCP_CREATION_PLAN.md ("Phase 1: Connector Mode").
"""

from functools import lru_cache

from app.config import settings
from app.services.alert_sources.base import AlertSource
from app.services.alert_sources.demo_source import DemoAlertSource
from app.services.alert_sources.json_source import JsonAlertSource
from app.services.alert_sources.mcp_source import McpAlertSource

_SOURCE_LABELS = {
    "demo": "Demo dataset",
    "real_world_json": "Real-world SOC alert feed",
    "mcp": "AWS GuardDuty (MCP)",
}


def _build_source(mode: str) -> AlertSource:
    if mode == "real_world_json":
        return JsonAlertSource()
    if mode == "mcp":
        return McpAlertSource()
    return DemoAlertSource()


@lru_cache
def get_alert_source() -> AlertSource:
    """Cached singleton for the currently configured alert source.

    Cached (rather than one-shot per import) because the MCP source holds
    connector state (last sync time, fetch counts) that the integrations
    status endpoint needs to read back.
    """
    return _build_source(settings.alert_source_normalized)


def available_sources() -> list[dict]:
    return [{"id": mode, "label": label} for mode, label in _SOURCE_LABELS.items()]


__all__ = ["AlertSource", "get_alert_source", "available_sources"]
