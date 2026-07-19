# SentinelAI Live Demo Roadmap — 30 July

## Goal

Move SentinelAI from a static demo feed to a credible live SOC integration demo.

By 30 July, the demo should show:

- a real or realistic SIEM source producing alerts
- SentinelAI fetching those alerts through a connector layer
- Gemini analyzing alert context
- backend safety rules making the final decision
- the React dashboard showing auto-resolved vs escalated alerts
- audit logging for every decision

## Recommended Demo Source: Wazuh

Use **Wazuh** as the first live connector.

Why Wazuh:

- free and open source
- works like a real SIEM/EDR platform
- can run locally or on a VM
- generates real security alerts
- avoids cloud billing surprises before the demo
- useful for login failures, file integrity alerts, suspicious commands, and endpoint events

Positioning:

> Wazuh gives real alerts. SentinelAI decides what to do with them.

## Target Architecture

```text
Wazuh Agent / Wazuh Manager
        ↓
Wazuh Alerts API
        ↓
SentinelAI MCP Connector
        ↓
FastAPI Backend
        ↓
Gemini Analysis
        ↓
Backend Safety Rules
        ↓
React SOC Dashboard
        ↓
Audit Log / Escalation
```

## Why Not Start With Every Tool

Do not try to connect every SIEM/EDR product first.

First prove one real connector:

1. Wazuh
2. AWS GuardDuty
3. Microsoft Sentinel
4. Splunk
5. CrowdStrike / Okta
6. Jira / Slack / ServiceNow escalation

The same connector pattern can be repeated after the first one works.

## Live Demo Story

Use this explanation:

> Earlier SentinelAI used realistic demo alerts. For the 30 July live demo, we are connecting SentinelAI to Wazuh, an open-source SIEM/EDR platform. Wazuh generates real security alerts from system activity. Our MCP connector fetches those alerts, normalizes them, and sends them to SentinelAI. Gemini analyzes the alert, but the FastAPI backend applies safety rules and makes the final decision. The dashboard shows whether the alert is auto-resolved or escalated, and every decision is saved in the audit log.

## Demo Alerts To Generate

Prepare three hero alerts:

### 1. Failed Login / Brute Force

- Source: Wazuh authentication alert
- Expected decision: escalate if repeated or suspicious
- Story: possible credential attack

### 2. File Integrity Change

- Source: Wazuh file integrity monitoring
- Expected decision: escalate
- Story: important system file changed unexpectedly

### 3. Known Low-Risk Event

- Source: Wazuh low-severity system event
- Expected decision: auto-resolve
- Story: routine event with low severity and high confidence

## Development Plan

### By 22 July

- Install Wazuh locally or on a small VM
- Generate 5–10 alerts
- Confirm Wazuh API access
- Document API credentials in local `.env` only

### By 24 July

- Build Wazuh connector
- Implement `get_alerts`
- Normalize Wazuh alerts into SentinelAI `Alert` schema

### By 26 July

- Connect Wazuh alerts to the existing `/api/stream` pipeline
- Show Wazuh source labels in the dashboard
- Add connector status card

### By 28 July

- Test Gemini triage with Wazuh alerts
- Add cached responses for hero alerts
- Keep safe fallback behavior

### By 29 July

- Full live rehearsal
- Record backup demo video
- Prepare Q&A answers

### 30 July

- Warm up backend and frontend
- Verify Wazuh connector status
- Run live demo

## Local Model Positioning

Gemini is the default because it is faster and more accurate.

Local models are optional for regulated clients:

- defence
- government
- banking
- hospitals
- private SOC environments

Use this answer:

> Local model is a privacy-first option, not the default accuracy-first option. If a customer cannot send alert data outside its network, SentinelAI can run with a local model and stricter backend rules. In that mode, more alerts are escalated and fewer are auto-resolved.

## Cost Control

SentinelAI should not send raw logs to Gemini.

Cost control strategy:

- SIEM/EDR filters raw logs into alerts first
- SentinelAI receives alert summaries, not all logs
- repeated alerts are deduplicated
- known low-risk alerts can be handled by rules/cache
- Gemini is used for reasoning-heavy cases
- enterprise customers can use private/local models

## Final Positioning

> Existing tools generate alerts. SentinelAI turns those alerts into decisions.

> MCP connectors bring real-time data in. SentinelAI provides the AI triage and safety layer.
