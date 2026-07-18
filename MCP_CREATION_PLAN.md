# SentinelAI MCP Integration Plan

## Goal

SentinelAI today proves the **AI triage and SOC overview layer** using realistic demo alerts. The next step is to add **MCP connectors** so SentinelAI can receive real-time alerts from external security platforms and apply the same triage logic to live data.

Simple positioning:

> SentinelAI is the decision layer. MCP connectors are the bridge to real-world alert sources.

---

## Current State

```text
Demo alert dataset
        ↓
FastAPI backend
        ↓
Gemini analysis + backend safety rules
        ↓
React SOC dashboard
        ↓
Audit log
```

This is useful because it shows:

- live SOC-style dashboard
- auto-resolve vs escalate decisions
- AI reasoning
- audit trail
- analyst workflow

But the current data source is still demo data.

---

## Target MCP Architecture

```text
AWS / Azure / Splunk / CrowdStrike / Okta / Email Gateway
        ↓
MCP connector tools
        ↓
Normalized alert schema
        ↓
SentinelAI FastAPI backend
        ↓
Gemini analysis
        ↓
Backend safety rules
        ↓
Dashboard + audit log + escalation
```

## Why MCP

MCP gives a standard way for SentinelAI to talk to external systems.

Without MCP:

```text
Sample alerts → SentinelAI demo
```

With MCP:

```text
Real-time company alerts → SentinelAI triage → real SOC action
```

---

## First MCP Connectors To Build

Start with one connector, prove the pattern, then add more.

| Priority | Connector | Why |
|---|---|---|
| 1 | AWS GuardDuty | Common cloud security alerts; easy API story |
| 2 | Microsoft Sentinel / Azure security alerts | Strong enterprise SOC use case |
| 3 | CrowdStrike / EDR | Endpoint alerts like malware, PowerShell, ransomware |
| 4 | Okta / identity provider | Login anomalies and MFA abuse |
| 5 | Slack / Jira / ServiceNow | Escalation delivery after triage |

For hackathon explanation, use AWS GuardDuty as the first real connector example.

---

## MCP Tool Design

The MCP server should expose small, safe tools.

### Tool 1: `get_alerts`

Fetch latest security alerts from a connected platform.

Input:

```json
{
  "source": "aws_guardduty",
  "since_minutes": 15,
  "limit": 25
}
```

Output:

```json
{
  "alerts": [
    {
      "id": "gd-123",
      "source": "AWS GuardDuty",
      "severity": "high",
      "category": "cloud_threat",
      "title": "EC2 instance communicating with malicious IP",
      "description": "Instance i-123 sent traffic to a known command-and-control IP.",
      "raw_reference": "guardduty-finding-id"
    }
  ]
}
```

### Tool 2: `get_alert_by_id`

Fetch full details for a single alert.

Input:

```json
{
  "source": "aws_guardduty",
  "alert_id": "gd-123"
}
```

### Tool 3: `acknowledge_alert`

Mark that SentinelAI has processed the alert.

Input:

```json
{
  "source": "aws_guardduty",
  "alert_id": "gd-123",
  "decision": "escalate"
}
```

### Tool 4: `create_escalation`

Create a ticket or message for human review.

Input:

```json
{
  "target": "jira",
  "alert_id": "gd-123",
  "summary": "Possible EC2 compromise",
  "reasoning": "Outbound traffic to malicious IP from production instance.",
  "severity": "high"
}
```

---

## Normalized Alert Schema

All external alerts should be converted into SentinelAI's internal shape before triage.

```json
{
  "id": "string",
  "source": "string",
  "severity": "low | medium | high",
  "category": "string",
  "title": "string",
  "description": "string",
  "timestamp": "ISO-8601 datetime",
  "raw_reference": "external platform alert id"
}
```

This prevents every integration from changing the core AI logic.

---

## Backend Integration Plan

### Phase 1: Connector Mode

Add a new env var:

```env
ALERT_SOURCE=demo
# demo | real_world_json | mcp
```

Backend behavior:

- `demo` → use `alerts.py`
- `real_world_json` → use `real_world_soc_alerts.json`
- `mcp` → call MCP connector tool and normalize alerts

### Phase 2: Alert Provider Interface

Create:

```text
backend/app/services/alert_sources/
├── base.py
├── demo_source.py
├── json_source.py
└── mcp_source.py
```

Interface:

```python
class AlertSource:
    def get_alerts(self) -> list[Alert]:
        ...
```

This keeps triage unchanged.

### Phase 3: MCP Client

Create:

```text
backend/app/services/mcp_client.py
```

Responsibilities:

- connect to MCP server
- call `get_alerts`
- validate response
- normalize into `Alert`
- fail safely if MCP is unavailable

Failure behavior:

```text
MCP unavailable → show connector error → do not auto-resolve unknown alerts
```

### Phase 4: Dashboard Connector Status

Add dashboard cards:

- connected source: AWS GuardDuty / Sentinel / CrowdStrike
- last sync time
- alerts fetched
- MCP status: connected / degraded / offline

---

## Security Requirements

MCP connectors must not become a loophole.

| Risk | Control |
|---|---|
| External tool credentials leaked | Store connector tokens in backend env/secrets manager only |
| Bad data from external platform | Validate every alert with Pydantic schema |
| MCP server down | Fail closed; escalate or pause ingestion |
| Duplicate alerts | Deduplicate by external alert id |
| Over-permissioned connector | Read-only API keys for alert ingestion |
| AI closes risky alert | Backend safety rule still applies |
| Compliance issue | Store raw external reference and audit decision |

Important:

> MCP fetches data. It does not make final security decisions. SentinelAI backend still controls the decision.

---

## Workable Development Timeline

### Day 1: Design

- Define normalized alert schema
- Add `ALERT_SOURCE` env var
- Add `AlertSource` interface
- Keep demo source working

### Day 2: First MCP Connector

- Build `aws_guardduty_mcp`
- Implement `get_alerts`
- Convert GuardDuty finding severity to low/medium/high
- Return normalized alerts

### Day 3: Backend Integration

- Add `mcp_source.py`
- Call MCP connector from FastAPI
- Feed alerts into existing `triage_alert`
- Save decisions to audit log

### Day 4: Dashboard

- Add connector status card
- Show source label on each alert
- Add last fetched time
- Add reconnect/error state

### Day 5: Reliability

- Add deduplication
- Add retry/backoff
- Add safe fallback
- Add demo mode toggle

---

## Judge Explanation

Use this:

> The dashboard we built is the SOC overview and AI triage layer. Today it proves the workflow using realistic alert data. By adding MCP connectors, SentinelAI can plug into real platforms like AWS GuardDuty, Microsoft Sentinel, Splunk, CrowdStrike, and Okta. MCP brings real-time alerts into our backend, then Gemini analyzes them, backend safety rules make the final decision, and the dashboard shows what is auto-resolved or escalated. This turns the demo from sample data into real-world SOC impact.

---

## MVP For This Project

For the hackathon/project, do not build every connector at once.

MVP:

1. Keep existing dashboard and triage logic.
2. Add `ALERT_SOURCE=mcp`.
3. Build one MCP connector for AWS GuardDuty-style alerts.
4. Normalize alerts into existing `Alert` schema.
5. Stream them through the same `/api/stream`.
6. Show connector status on Integration page.

This proves the platform can move from demo alerts to real alert feeds.
