"""MCP connector client.

This module plays the role of the "MCP client" described in
MCP_CREATION_PLAN.md: it is the only place in the backend that knows how to
talk to an external MCP server and its tools (`get_alerts`,
`get_alert_by_id`, `acknowledge_alert`, `create_escalation`).

For this build there is no live AWS account wired up, so the AWS GuardDuty
connector below is a self-contained MCP-shaped implementation: it exposes
the exact tool signatures/outputs a real GuardDuty MCP server would, backed
by a realistic finding pool instead of a live `boto3` call. Swapping this
for a real MCP server later only means changing `_fetch_guardduty_findings`
to issue an actual MCP `tools/call` -- every caller (alert_sources, routes,
dashboard) is unaffected because they only see the normalized `Alert`
schema and the connector status contract.

Fail-safe behavior per the plan: if the connector is unavailable, we surface
`status="offline"` and return an empty list rather than raising -- callers
must not silently auto-resolve alerts they can't actually see.
"""

import logging
import os
import random
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from typing import Literal

logger = logging.getLogger(__name__)

ConnectorStatusValue = Literal["connected", "degraded", "offline"]

# --- Simulated AWS GuardDuty finding pool -----------------------------------
# Shaped like real GuardDuty findings (type, numeric severity 0.1-8.9,
# resource, region) so the normalization step below is representative of a
# real integration.
_GUARDDUTY_FINDINGS = [
    {
        "id": "gd-8a2f1c",
        "type": "UnauthorizedAccess:EC2/MaliciousIPCaller.Custom",
        "severity": 8.0,
        "title": "EC2 instance communicating with a known malicious IP",
        "description": "Instance i-0a3f92e1c4b7d2f88 sent outbound traffic to 45.147.230.88, an IP on AWS threat intel lists for C2 infrastructure.",
        "resource": "i-0a3f92e1c4b7d2f88",
        "region": "ap-south-1",
    },
    {
        "id": "gd-4b91de",
        "type": "Recon:EC2/PortProbeUnprotectedPort",
        "severity": 2.0,
        "title": "Unprotected port on EC2 instance probed by known scanner",
        "description": "Instance i-0c81a3f0be2fd1911 had port 23 probed from 185.220.101.34, a known vulnerability-scanning range.",
        "resource": "i-0c81a3f0be2fd1911",
        "region": "ap-south-1",
    },
    {
        "id": "gd-1f77aa",
        "type": "CryptoCurrency:EC2/BitcoinTool.B!DNS",
        "severity": 7.5,
        "title": "EC2 instance querying a domain associated with cryptocurrency mining",
        "description": "Instance i-0912ffab3d7c6e402 queried a domain name associated with Bitcoin-related activity, consistent with mining malware.",
        "resource": "i-0912ffab3d7c6e402",
        "region": "us-east-1",
    },
    {
        "id": "gd-e02c9b",
        "type": "UnauthorizedAccess:IAMUser/TorIPCaller",
        "severity": 5.0,
        "title": "IAM API call made from a Tor exit node",
        "description": "IAM user svc-deploy-bot made ListBuckets and GetObject API calls from a known Tor exit node IP.",
        "resource": "svc-deploy-bot",
        "region": "ap-south-1",
    },
    {
        "id": "gd-cc31a7",
        "type": "Exfiltration:S3/ObjectRead.Unusual",
        "severity": 7.0,
        "title": "Unusual volume of S3 object reads from an external principal",
        "description": "Role data-export-role read 1,840 objects from bucket prod-customer-exports within 10 minutes, well above its historical baseline.",
        "resource": "prod-customer-exports",
        "region": "ap-south-1",
    },
    {
        "id": "gd-5d0f13",
        "type": "Backdoor:EC2/C&CActivity.B!DNS",
        "severity": 8.5,
        "title": "EC2 instance querying a domain associated with a known C2 server",
        "description": "Instance i-0f4a2c9e88d13aab1 attempted a DNS lookup for a domain on active command-and-control block lists.",
        "resource": "i-0f4a2c9e88d13aab1",
        "region": "us-east-1",
    },
    {
        "id": "gd-902be4",
        "type": "PenTest:IAMUser/KaliLinux",
        "severity": 2.0,
        "title": "IAM API calls from a Kali Linux host",
        "description": "IAM user contractor-sec-audit made API calls from a host fingerprinted as Kali Linux; a scoped pentest engagement is scheduled this week.",
        "resource": "contractor-sec-audit",
        "region": "ap-south-1",
    },
    {
        "id": "gd-77b1e0",
        "type": "Persistence:IAMUser/NetworkPermissions",
        "severity": 5.5,
        "title": "IAM user granted unusual network permission changes",
        "description": "IAM user da-priyanka modified a security group to open port 3389 to 0.0.0.0/0, outside her normal change pattern.",
        "resource": "da-priyanka",
        "region": "ap-south-1",
    },
]

_STATUS_TICKET_SEQ = 1000


def _map_guardduty_severity(score: float) -> str:
    """GuardDuty severity is numeric 0.1-8.9; map to SentinelAI's low/medium/high."""
    if score >= 7.0:
        return "high"
    if score >= 4.0:
        return "medium"
    return "low"


@dataclass
class ConnectorStatus:
    source: str
    name: str
    status: ConnectorStatusValue = "offline"
    last_sync: datetime | None = None
    alerts_fetched: int = 0
    error: str | None = None


class McpConnectorError(Exception):
    """Raised when an MCP tool call fails. Callers must fail closed."""


class McpClient:
    """Simulated MCP client for security alert connectors.

    Real deployments would replace the body of `_fetch_guardduty_findings`
    with an MCP `tools/call` over stdio/SSE to an external MCP server; the
    public method signatures here already match the tool contracts in
    MCP_CREATION_PLAN.md so that swap does not ripple through the codebase.
    """

    def __init__(self) -> None:
        self._status: dict[str, ConnectorStatus] = {
            "aws_guardduty": ConnectorStatus(source="aws_guardduty", name="AWS GuardDuty"),
        }
        self._acknowledged: dict[str, dict] = {}
        self._escalation_seq = _STATUS_TICKET_SEQ

    def _simulate_offline(self) -> bool:
        return os.getenv("MCP_SIMULATE_OFFLINE", "").lower() in ("1", "true", "yes")

    def get_alerts(self, source: str = "aws_guardduty", since_minutes: int = 15, limit: int = 25) -> list[dict]:
        """MCP tool: `get_alerts`. Returns normalized alert dicts (see
        MCP_CREATION_PLAN.md `get_alerts` output schema)."""
        if source != "aws_guardduty":
            raise McpConnectorError(f"Unknown MCP connector source: {source}")

        status = self._status[source]
        if self._simulate_offline():
            status.status = "offline"
            status.error = "Connector unreachable (MCP_SIMULATE_OFFLINE=true)"
            logger.warning("MCP connector %s marked offline (simulated)", source)
            return []

        try:
            findings = self._fetch_guardduty_findings(since_minutes=since_minutes, limit=limit)
        except Exception as exc:  # network/SDK errors in a real connector
            status.status = "offline"
            status.error = str(exc)
            logger.error("MCP connector %s failed: %s", source, exc)
            return []

        status.status = "connected"
        status.error = None
        status.last_sync = datetime.now(timezone.utc)
        status.alerts_fetched = len(findings)
        return findings

    def _fetch_guardduty_findings(self, since_minutes: int, limit: int) -> list[dict]:
        """Stand-in for a real `boto3 guardduty.list_findings` + `get_findings`
        call. Returns a realistic, slightly randomized subset so repeated
        polls feel like a live feed rather than a static fixture."""
        pool = list(_GUARDDUTY_FINDINGS)
        random.shuffle(pool)
        selected = pool[: min(limit, len(pool))]

        now = datetime.now(timezone.utc)
        normalized = []
        for i, finding in enumerate(selected):
            age_minutes = random.uniform(0, max(since_minutes, 1))
            normalized.append(
                {
                    "id": f"MCP-{finding['id']}",
                    "source": "AWS GuardDuty",
                    "severity": _map_guardduty_severity(finding["severity"]),
                    "category": finding["type"].split(":")[0].lower(),
                    "title": finding["title"],
                    "description": f"{finding['description']} (resource: {finding['resource']}, region: {finding['region']})",
                    "timestamp": (now - timedelta(minutes=age_minutes)).isoformat(),
                    "raw_reference": finding["id"],
                }
            )
        return normalized

    def get_alert_by_id(self, source: str, alert_id: str) -> dict | None:
        """MCP tool: `get_alert_by_id`."""
        return next((a for a in self.get_alerts(source=source, limit=len(_GUARDDUTY_FINDINGS)) if a["id"] == alert_id), None)

    def acknowledge_alert(self, source: str, alert_id: str, decision: str) -> dict:
        """MCP tool: `acknowledge_alert`. Records that SentinelAI has
        processed the alert so the source platform can stop resurfacing it."""
        record = {"source": source, "alert_id": alert_id, "decision": decision, "acknowledged_at": datetime.now(timezone.utc).isoformat()}
        self._acknowledged[alert_id] = record
        return record

    def create_escalation(self, target: str, alert_id: str, summary: str, reasoning: str, severity: str) -> dict:
        """MCP tool: `create_escalation`. Simulates opening a ticket/message
        in the analyst's existing tool (Jira, ServiceNow, Slack, Teams)."""
        self._escalation_seq += 1
        ticket_id = f"{target.upper()[:4]}-{self._escalation_seq}"
        logger.info("MCP create_escalation -> %s for alert %s (%s)", ticket_id, alert_id, target)
        return {
            "ticket_id": ticket_id,
            "target": target,
            "alert_id": alert_id,
            "summary": summary,
            "reasoning": reasoning,
            "severity": severity,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }

    def get_connector_status(self, source: str = "aws_guardduty") -> ConnectorStatus:
        return self._status.get(source, ConnectorStatus(source=source, name=source))


mcp_client = McpClient()
