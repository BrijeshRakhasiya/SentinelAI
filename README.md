# SentinelAI

SentinelAI is an AI-powered SOC alert triage platform. It sits above existing security tools, explains alert risk, auto-resolves safe low-risk alerts, and escalates risky or unclear alerts to human analysts with an audit trail.

<<<<<<< HEAD
Core message:

> Existing tools generate alerts and scores. SentinelAI turns them into decisions.
=======
## The Problem

Security teams get thousands of alerts a day. Most are false alarms. Analysts get exhausted, tune out, and real threats slip through. Existing "AI security tools" usually go in one of two directions:
>>>>>>> fbd20077460cded6dff90ac69ad681ec3d26e15e

## Why This Product Exists

<<<<<<< HEAD
Security teams already use tools such as AWS GuardDuty, Microsoft Sentinel, Splunk, CrowdStrike, Okta, EDR, firewalls, and cloud logs. These tools are excellent at producing alerts, but analysts still need to decide:
=======
## The Solution

An AI agent that watches security alerts and does two things:
>>>>>>> fbd20077460cded6dff90ac69ad681ec3d26e15e

- Is this alert real risk or noise?
- Should it be closed, watched, or escalated?
- Why did the system make that decision?
- How do we prove the decision later during review or audit?

SentinelAI adds the missing decision layer.

<<<<<<< HEAD
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
=======
### Why This Idea

- It solves a real problem: alert fatigue and analyst burnout are well-known pain points in cybersecurity.
- It stands out from other AI security tools: most compete on "automate everything." SentinelAI competes on knowing when to trust itself versus when to ask for help.
- It is easier to trust and easier to pitch: it reduces grunt work instead of replacing analysts.
- It has a real path after the hackathon: India's iDEX / Ministry of Defence ecosystem actively funds cybersecurity startups like this, so the idea can extend beyond a demo.

## What's Built So Far

- **Live alert triage feed** — alerts stream in over SSE, get triaged by Gemini one at a time, and render with the model's decision, confidence, and plain-English reasoning.
- **Auto-resolve vs. escalate**, enforced server-side — the backend never blindly trusts the model's own verdict (see [Agent Decision Rule](#agent-decision-rule) below).
- **Switchable alert sources** — the dashboard's Integration page can flip between a hand-curated real-world-style alert feed and a simulated AWS GuardDuty MCP connector, without touching the backend.
- **Analyst dashboard** — auto-resolved vs. escalated counts/chart, backed by a persistent audit log of every decision.
- **AI chat assistant** — an in-app chat sidebar (guardrailed against prompt injection) that analysts can ask about the current triage session.
- **Integration page** — explains the real-world deployment story: SIEM/EDR ingestion, MCP connector pattern, escalation delivery into Slack/Jira/ServiceNow, on-prem vs. managed cloud, and known limitations.
- **Supabase-backed authentication** — the dashboard is login-gated; user accounts live in Supabase Auth rather than a hardcoded credential.

## Scope

No real network integration is required for the demo. Alert data is either a hand-curated realistic dataset or a simulated MCP connector — both are mock data, not a live SIEM or cloud account. See [MCP_CREATION_PLAN.md](./MCP_CREATION_PLAN.md) for the path to a real connector.

## Core Message

SentinelAI is not about replacing analysts. It is about reducing noise, preserving trust, and helping teams focus on the alerts that actually need human judgment.
>>>>>>> fbd20077460cded6dff90ac69ad681ec3d26e15e

## Tech Stack

| Layer | Choice |
|-------|--------|
| Backend | FastAPI, SQLAlchemy, SQLite |
| Frontend | Create React App + TypeScript + React Router + Tailwind CSS |
| AI | Google Gemini (server-side only) |
| Auth | Supabase Auth (frontend signs in via `supabase-js`; backend verifies the access token per request) |
| Streaming | Server-Sent Events (`/api/stream`) |
| Deploy | Docker Compose locally; Render for the hosted demo |

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full technical breakdown and [context.md](./context.md) for product/project context.

## Agent Decision Rule

```
IF confidence >= 75 AND severity != "high"
  → auto_resolve
ELSE
  → escalate
```

High-severity alerts never auto-resolve, regardless of confidence. On any Gemini failure (timeout, bad JSON, rate limit), the backend falls back to a severity-aware cached decision — the demo never crashes on an API hiccup.

## Local Development

<<<<<<< HEAD
### Backend
=======
### Prerequisites

- Python 3.11+ and Node.js 18+
- A Supabase project (for auth) — grab the project URL and publishable key from Supabase Dashboard → Project Settings → API
- A Gemini API key (optional if running with `USE_CACHE=true`, which serves pre-recorded responses instead of calling the live API)

### Environment variables

Copy the example files and fill in your own values (both `.env` files are git-ignored):

**`backend/.env`**

```
ENVIRONMENT=development
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-3.5-flash
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
CORS_ORIGINS=http://localhost:3000
USE_CACHE=true
DATABASE_URL=sqlite:///./sentinelai.db
ALERT_SOURCE=real_world_json
```

**`frontend/.env`**

```
REACT_APP_API_URL=http://localhost:8000
REACT_APP_SUPABASE_URL=https://<your-project>.supabase.co
REACT_APP_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

### Create a login user

There's no self-serve sign-up flow — create a user under Supabase Dashboard → Authentication → Users, then sign in with that email/password on the login page.

### Run the backend
>>>>>>> fbd20077460cded6dff90ac69ad681ec3d26e15e

```bash
cd backend
<<<<<<< HEAD
py -3.12 -m venv .venv
.\.venv\Scripts\pip install -r requirements.txt
.\.venv\Scripts\uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Backend:
=======
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

FastAPI is available at http://127.0.0.1:8000 and Swagger UI at http://127.0.0.1:8000/docs (docs are disabled when `ENVIRONMENT=production`).
>>>>>>> fbd20077460cded6dff90ac69ad681ec3d26e15e

- API: http://127.0.0.1:8000
- Health: http://127.0.0.1:8000/health
- Docs: http://127.0.0.1:8000/docs

### Frontend

```bash
cd frontend
npm install
npm start
```

<<<<<<< HEAD
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
=======
Open http://localhost:3000 and sign in with the Supabase user you created above.

### Or run both with Docker Compose

```bash
docker compose up --build
# Backend:  http://localhost:8000
# Frontend: http://localhost:3000
```

## Deployment

The backend and frontend deploy as two Render services, defined in [render.yaml](./render.yaml) (Render Blueprint). `USE_CACHE=true` is the default in production so the demo never depends on live Gemini quota during judging.

## Known Limitations

- Both alert sources are mock data — the real-world feed is a hand-curated dataset and the MCP connector runs against a simulated finding pool, not a live AWS account.
- No self-serve sign-up or role-based analyst/admin permissions yet — accounts are created directly in Supabase.
- Free-tier Render hosting can cold-start after inactivity.
- SQLite audit log is fine at demo scale; production would move to Postgres.

## More Documentation

| Resource | Purpose |
|----------|---------|
| [context.md](./context.md) | Product/project context and rationale |
| [plan.md](./plan.md) | Hackathon execution plan and demo script |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Technical architecture, API reference, security model |
| [MCP_CREATION_PLAN.md](./MCP_CREATION_PLAN.md) | Plan for real MCP connectors to live security platforms |
| [SECURITY.md](./SECURITY.md) | Vulnerability disclosure policy |
>>>>>>> fbd20077460cded6dff90ac69ad681ec3d26e15e
