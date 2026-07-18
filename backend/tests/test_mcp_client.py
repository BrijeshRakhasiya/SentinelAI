"""Tests for the simulated MCP connector client (get_alerts, get_alert_by_id,
acknowledge_alert, create_escalation) -- see MCP_CREATION_PLAN.md."""

import pytest

from app.services.mcp_client import McpClient, McpConnectorError


@pytest.fixture
def client() -> McpClient:
    return McpClient()


def test_get_alerts_returns_normalized_shape(client: McpClient):
    alerts = client.get_alerts(source="aws_guardduty", since_minutes=15, limit=5)
    assert 0 < len(alerts) <= 5
    for alert in alerts:
        assert {"id", "source", "severity", "category", "title", "description", "raw_reference"}.issubset(alert.keys())
        assert alert["severity"] in ("low", "medium", "high")


def test_get_alerts_rejects_unknown_source(client: McpClient):
    with pytest.raises(McpConnectorError):
        client.get_alerts(source="not_a_real_connector")


def test_get_alert_by_id_finds_a_fetched_alert(client: McpClient):
    alerts = client.get_alerts(source="aws_guardduty", limit=8)
    target = alerts[0]
    found = client.get_alert_by_id("aws_guardduty", target["id"])
    assert found is not None
    assert found["id"] == target["id"]


def test_acknowledge_alert_records_decision(client: McpClient):
    record = client.acknowledge_alert("aws_guardduty", "MCP-gd-8a2f1c", "escalate")
    assert record["alert_id"] == "MCP-gd-8a2f1c"
    assert record["decision"] == "escalate"


def test_create_escalation_returns_ticket(client: McpClient):
    ticket = client.create_escalation(
        target="jira",
        alert_id="MCP-gd-8a2f1c",
        summary="Possible EC2 compromise",
        reasoning="Outbound traffic to malicious IP",
        severity="high",
    )
    assert ticket["ticket_id"].startswith("JIRA-")
    assert ticket["target"] == "jira"


def test_connector_status_updates_after_successful_fetch(client: McpClient):
    assert client.get_connector_status("aws_guardduty").status == "offline"
    client.get_alerts(source="aws_guardduty")
    status = client.get_connector_status("aws_guardduty")
    assert status.status == "connected"
    assert status.last_sync is not None
    assert status.alerts_fetched > 0
