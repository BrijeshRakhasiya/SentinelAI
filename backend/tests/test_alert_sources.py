"""Tests for the alert source abstraction (demo / real-world JSON / MCP)."""

from app.schemas.alert import Alert, Severity
from app.services.alert_sources.demo_source import DemoAlertSource
from app.services.alert_sources.json_source import JsonAlertSource
from app.services.alert_sources.mcp_source import McpAlertSource
from app.services.mcp_client import McpClient


def test_demo_source_returns_normalized_alerts():
    alerts = DemoAlertSource().get_alerts()
    assert len(alerts) > 0
    assert all(isinstance(a, Alert) for a in alerts)


def test_json_source_loads_real_world_feed():
    alerts = JsonAlertSource().get_alerts()
    assert len(alerts) > 0
    assert all(isinstance(a, Alert) for a in alerts)
    assert all(a.severity in (Severity.LOW, Severity.MEDIUM, Severity.HIGH) for a in alerts)
    # `expected_decision` is test metadata on the raw records, not part of the
    # normalized schema -- make sure it never leaks into the Alert model.
    assert not hasattr(alerts[0], "expected_decision")


def test_mcp_source_normalizes_guardduty_findings():
    source = McpAlertSource()
    alerts = source.get_alerts()
    assert len(alerts) > 0
    assert all(isinstance(a, Alert) for a in alerts)
    assert all(a.source == "AWS GuardDuty" for a in alerts)
    assert all(a.raw_reference for a in alerts)


def test_mcp_source_fails_safe_when_connector_offline(monkeypatch):
    monkeypatch.setenv("MCP_SIMULATE_OFFLINE", "true")
    client = McpClient()
    alerts = client.get_alerts(source="aws_guardduty")
    assert alerts == []
    status = client.get_connector_status("aws_guardduty")
    assert status.status == "offline"
