"""Alert source registry.

Selects which `AlertSource` implementation feeds the triage stream. Starts
from `settings.ALERT_SOURCE` but can be switched at runtime via
`POST /api/integrations/source` (see app/routes/integrations.py) so the
dashboard can flip between demo / real-world-JSON / MCP without restarting
the backend. See MCP_CREATION_PLAN.md ("Phase 1: Connector Mode").
"""

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

# Built lazily and reused per mode so the MCP source's connector state
# (last sync time, fetch counts) survives across stream/status calls even
# after switching away and back.
_instances: dict[str, AlertSource] = {}
_current_mode = settings.alert_source_normalized


def _build_source(mode: str) -> AlertSource:
    if mode == "real_world_json":
        return JsonAlertSource()
    if mode == "mcp":
        return McpAlertSource()
    return DemoAlertSource()


def _get_or_build(mode: str) -> AlertSource:
    if mode not in _instances:
        _instances[mode] = _build_source(mode)
    return _instances[mode]


def get_current_mode() -> str:
    return _current_mode


def set_current_mode(mode: str) -> str:
    """Switch the active alert source at runtime. Returns the normalized
    mode actually applied (falls back to "demo" for anything unrecognized)."""
    global _current_mode
    _current_mode = mode if mode in _SOURCE_LABELS else "demo"
    return _current_mode


def get_alert_source() -> AlertSource:
    """The currently active alert source instance."""
    return _get_or_build(_current_mode)


def available_sources() -> list[dict]:
    return [{"id": mode, "label": label} for mode, label in _SOURCE_LABELS.items()]


__all__ = [
    "AlertSource",
    "get_alert_source",
    "get_current_mode",
    "set_current_mode",
    "available_sources",
]
