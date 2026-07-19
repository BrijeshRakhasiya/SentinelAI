# SentinelAI

SentinelAI is an AI-powered SOC alert triage platform. It sits above existing security tools, explains alert risk, auto-resolves safe low-risk alerts, and escalates risky or unclear alerts to human analysts with an audit trail.

Core message:

> Existing tools generate alerts and scores. SentinelAI turns them into decisions.

## Why This Product Exists

Security teams already use tools such as AWS GuardDuty, Microsoft Sentinel, Splunk, CrowdStrike, Okta, EDR, firewalls, and cloud logs. These tools are excellent at producing alerts, but analysts still need to decide:

- Is this alert real risk or noise?
- Should it be closed, watched, or escalated?
- Why did the system make that decision?
- How do we prove the decision later during review or audit?

SentinelAI adds the missing decision layer.

## What SentinelAI Does

- Streams SOC alerts into a React dashboard.
- Uses Gemini for alert reasoning.
- Applies FastAPI backend safety rules before any final action.
- Auto-resolves only low-risk, high-confidence alerts.
- Escalates high-severity, risky, or unclear alerts.
- Logs every decision with confidence, reasoning, and action.
- Provides a roadmap to real-time SIEM/EDR ingestion through MCP connectors.

## Current Architecture

```text
Alert source
  demo data / real-world JSON / future MCP connector
        ↓
FastAPI backend
        ↓
Gemini analysis
        ↓
Backend safety rules
        ↓
React SOC dashboard
        ↓
SQLite audit log
```

The AI is not the final authority. Gemini provides reasoning, but the backend decides.

Decision rule:

```text
IF confidence >= 75 AND severity != high
  → auto_resolve
ELSE
  → escalate
```

## 30 July Live Demo Roadmap

The next milestone is a real integration demo using Wazuh as the first SIEM/EDR source.

Target flow:

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
React Dashboard + Audit Log
```

Why Wazuh first:

- Free and open source.
- Runs locally or on a VM.
- Produces real SIEM/EDR-style alerts.
- Avoids cloud billing surprises.
- Good for failed login, file integrity, endpoint, and suspicious activity demos.

See [LIVE_DEMO_ROADMAP.md](./LIVE_DEMO_ROADMAP.md) for the full 30 July plan.

## MCP Integration Plan

MCP connectors are the bridge from static/demo data to live production data.

Planned MCP tools:

- `get_alerts` — fetch latest alerts from a connected platform.
- `get_alert_by_id` — fetch full alert details.
- `acknowledge_alert` — mark an alert as processed.
- `create_escalation` — create a Jira, Slack, Teams, or ServiceNow escalation.

Initial connector priority:

1. Wazuh
2. AWS GuardDuty
3. Microsoft Sentinel
4. Splunk
5. CrowdStrike / Okta
6. Jira / Slack / ServiceNow escalation

See [MCP_CREATION_PLAN.md](./MCP_CREATION_PLAN.md) for the connector design.

## Sector Coverage

SentinelAI is not only for IT companies. Any sector with digital systems and alerts can use it:

- Finance: customer data export, fraud, privileged access.
- Healthcare: patient record access, ransomware, privacy alerts.
- Legal: confidential file access, unusual downloads.
- Government/Defence: sensitive system communication, classified data access.
- Manufacturing: IoT/OT anomalies, factory system compromise.
- Telecom: routing system alerts, abnormal traffic.
- Retail/E-commerce: credential stuffing, payment and checkout abuse.
- Cloud/SaaS: IAM key misuse, cloud workload compromise.

## Local Development

### Backend

```powershell
cd backend
py -3.12 -m venv .venv
.\.venv\Scripts\pip install -r requirements.txt
.\.venv\Scripts\uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Backend:

- API: http://127.0.0.1:8000
- Health: http://127.0.0.1:8000/health
- Docs: http://127.0.0.1:8000/docs

### Frontend

```powershell
cd frontend
npm install
npm start
```

Frontend:

- App: http://localhost:3000

## Docker

Both services include Dockerfiles:

- Backend: [backend/Dockerfile](./backend/Dockerfile)
- Frontend: [frontend/Dockerfile](./frontend/Dockerfile)

Run both locally:

```powershell
docker compose up --build
```

Services:

- Backend: http://localhost:8000
- Frontend: http://localhost:3000

## Render Deployment

This repo includes [render.yaml](./render.yaml) for Render deployment.

Full deployment instructions are in [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md).

Required backend env vars on Render:

- `ENVIRONMENT=production`
- `GEMINI_API_KEY`
- `GEMINI_MODEL`
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `USE_CACHE`
- `DATABASE_URL`
- `ALERT_SOURCE`
- `CORS_ORIGINS`

Required frontend env vars on Render:

- `REACT_APP_API_URL`
- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_PUBLISHABLE_KEY`

Never commit `.env` files or API keys.

## Security Notes

- Gemini key stays server-side only.
- Frontend never receives the Gemini key.
- Backend validates alert data before triage.
- High-severity alerts always escalate.
- Every decision is logged.
- For defence or regulated customers, SentinelAI can run on-premises with a local/private model and stricter rules.
