"""Tests for the runtime-switchable alert source registry
(app/services/alert_sources/__init__.py) used by the /api/integrations
endpoints to flip between real_world_json / mcp without a restart."""

from app.services.alert_sources import (
    available_sources,
    get_alert_source,
    get_current_mode,
    set_current_mode,
)
from app.services.alert_sources.json_source import JsonAlertSource
from app.services.alert_sources.mcp_source import McpAlertSource


def teardown_function(_fn):
    # Each test may switch the module-level current mode -- reset so tests
    # don't leak state into each other.
    set_current_mode("real_world_json")


def test_available_sources_lists_both_modes_as_mock_data():
    sources = available_sources()
    ids = {s["id"] for s in sources}
    assert ids == {"real_world_json", "mcp"}
    assert all("Mock" in s["label"] for s in sources)


def test_set_current_mode_switches_active_source():
    set_current_mode("real_world_json")
    assert get_current_mode() == "real_world_json"
    assert isinstance(get_alert_source(), JsonAlertSource)

    set_current_mode("mcp")
    assert get_current_mode() == "mcp"
    assert isinstance(get_alert_source(), McpAlertSource)


def test_set_current_mode_falls_back_to_real_world_json_for_unknown_value():
    result = set_current_mode("not_a_real_source")
    assert result == "real_world_json"
    assert get_current_mode() == "real_world_json"


def test_switching_away_and_back_reuses_same_instance():
    set_current_mode("mcp")
    first = get_alert_source()
    set_current_mode("real_world_json")
    set_current_mode("mcp")
    second = get_alert_source()
    assert first is second
