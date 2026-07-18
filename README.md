# SentinelAI

SentinelAI is an AI security teammate for alert fatigue: it watches incoming security alerts, resolves the obvious ones on its own, and escalates the uncertain ones to a human with a clear explanation of what it saw and why it is unsure.

## The Problem

Security teams get thousands of alerts a day. Most are false alarms. Analysts get exhausted, tune out, and real threats slip through. Existing "AI security tools" usually go in one of two directions:

- auto-block everything, which is risky and can break trust
- dump even more alerts on already overloaded humans, which does not solve the problem

## The Solution

An AI agent that watches security alerts and does two things:

- If it's confident, it handles the threat itself and logs why.
- If it's not confident, it asks a human and explains clearly what it saw and why it's unsure.

In short: an AI teammate that takes the boring, repetitive 80% off analysts' plates, so humans only handle the hard 20% that actually needs judgment.

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

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

FastAPI is available at http://127.0.0.1:8000 and Swagger UI at http://127.0.0.1:8000/docs (docs are disabled when `ENVIRONMENT=production`).

### Run the frontend

In a second terminal:

```bash
cd frontend
npm install
npm start
```

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
