"""Alert source registry.

Selects which `AlertSource` implementation feeds the triage stream. Starts
from `settings.ALERT_SOURCE` but can be switched at runtime via
`POST /api/integrations/source` (see app/routes/integrations.py) so the
dashboard can flip between the real-world JSON feed and the MCP connector
without restarting the backend. See MCP_CREATION_PLAN.md ("Phase 1:
Connector Mode").

Both available sources are mock data for this build -- there is no live
external account wired up. `real_world_json` is a static, hand-curated feed
shaped like real SOC output across many industries; `mcp` is a simulated
AWS GuardDuty connector that exercises the actual MCP tool pattern
(get_alerts/acknowledge_alert/connector status) against a generated finding
pool instead of a live AWS account. The label on each explicitly says
"(Mock Data)" so this is never mistaken for a live feed.
"""

from app.config import settings
from app.services.alert_sources.base import AlertSource
from app.services.alert_sources.json_source import JsonAlertSource
from app.services.alert_sources.mcp_source import McpAlertSource

_SOURCE_LABELS = {
    "real_world_json": "Real-World Feed (Mock)",
    "mcp": "AWS GuardDuty MCP (Mock)",
}

# Built lazily and reused per mode so the MCP source's connector state
# (last sync time, fetch counts) survives across stream/status calls even
# after switching away and back.
_instances: dict[str, AlertSource] = {}
_current_mode = settings.alert_source_normalized


def _build_source(mode: str) -> AlertSource:
    if mode == "mcp":
        return McpAlertSource()
    return JsonAlertSource()


def _get_or_build(mode: str) -> AlertSource:
    if mode not in _instances:
        _instances[mode] = _build_source(mode)
    return _instances[mode]


def get_current_mode() -> str:
    return _current_mode


def set_current_mode(mode: str) -> str:
    """Switch the active alert source at runtime. Returns the normalized
    mode actually applied (falls back to "real_world_json" for anything
    unrecognized)."""
    global _current_mode
    _current_mode = mode if mode in _SOURCE_LABELS else "real_world_json"
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
