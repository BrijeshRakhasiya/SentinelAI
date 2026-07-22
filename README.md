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

## What's Built So Far

- **Live alert triage feed** - alerts stream over SSE, get triaged by Gemini one at a time, and render with the model's decision, confidence, and plain-English reasoning.
- **Server-enforced auto-resolve vs escalate** - the backend never blindly trusts the model's own verdict.
- **Real-world JSON alert source** - `ALERT_SOURCE=real_world_json` uses a hand-curated realistic SOC feed for the current stable demo.
- **Simulated MCP connector mode** - `ALERT_SOURCE=mcp` currently exercises the connector pattern with mock AWS GuardDuty-style findings; it is not a live Wazuh integration.
- **Analyst dashboard** - auto-resolved vs escalated counts and chart, backed by a persistent audit log of every decision.
- **AI chat assistant** - an in-app chat sidebar that analysts can use to ask about the current triage session.
- **Integration page** - explains SIEM/EDR ingestion, MCP connector pattern, escalation delivery, deployment options, and known limitations.
- **Supabase-backed authentication** - user accounts live in Supabase Auth.

## Current Architecture

```text
Alert source
  real-world JSON feed / simulated MCP connector
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
  -> auto_resolve
ELSE
  -> escalate
```

## Next Phase: Wazuh Live Feed

The next milestone is a live integration demo using Wazuh as the first SIEM/EDR source. This should be built as an MCP connector first, then wired into backend ingestion logic after the connector is tested.

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

See [LIVE_DEMO_ROADMAP.md](./LIVE_DEMO_ROADMAP.md) for the full live demo plan and [MCP_CREATION_PLAN.md](./MCP_CREATION_PLAN.md) for the connector design.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Backend | FastAPI, SQLAlchemy, SQLite |
| Frontend | Create React App + TypeScript + React Router + Tailwind CSS |
| AI | Google Gemini (server-side only) |
| Auth | Supabase Auth |
| Streaming | Server-Sent Events (`/api/stream`) |
| Deploy | Docker Compose locally; Render via GitHub push/Blueprint |

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full technical breakdown and [context.md](./context.md) for product/project context.

## Local Development

### Prerequisites

- Python 3.11+ and Node.js 18+
- A Supabase project for auth
- A Gemini API key, optional when running with `USE_CACHE=true`

### Environment Variables

Copy the example files and fill in your own values. `.env` files are git-ignored and must not be committed.

Backend:

```env
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

Frontend:

```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_SUPABASE_URL=https://<your-project>.supabase.co
REACT_APP_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

### Run The Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

On Windows PowerShell, activate the virtual environment with:

```powershell
.\.venv\Scripts\Activate.ps1
```

FastAPI is available at http://127.0.0.1:8000 and Swagger UI at http://127.0.0.1:8000/docs.

### Run The Frontend

```bash
cd frontend
npm install
npm start
```

Open http://localhost:3000 and sign in with a Supabase user.

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

This repo includes [render.yaml](./render.yaml) for Render Blueprint deployment from GitHub. Push changes to GitHub, then Render can build the backend Docker web service from [backend/Dockerfile](./backend/Dockerfile) and the frontend as a static site from `frontend/`.

Recommended Render setup:

- Backend: Docker web service, `rootDir: backend`, `dockerfilePath: ./Dockerfile`.
- Frontend: Static Site, `rootDir: frontend`, build command `npm ci && npm run build`, publish directory `build`.
- Production `ALERT_SOURCE=real_world_json` until the Wazuh MCP connector and backend live-ingestion logic are implemented.

Full deployment instructions are in [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md).

## Known Limitations

- The current stable feed is static, realistic JSON data, not live SIEM traffic.
- The existing MCP mode is simulated and should not be described as a live Wazuh connector.
- Wazuh live ingestion is the next phase: build the MCP connector, validate it locally, then update backend source logic.
- Free-tier Render hosting can cold-start after inactivity.
- SQLite audit log is fine at demo scale; production should move to Postgres.

## Security Notes

- Gemini key stays server-side only.
- Frontend never receives the Gemini key.
- Backend validates alert data before triage.
- High-severity alerts always escalate.
- Every decision is logged.
- For defence or regulated customers, SentinelAI can run on-premises with a local/private model and stricter rules.

## More Documentation

| Resource | Purpose |
|----------|---------|
| [context.md](./context.md) | Product/project context and rationale |
| [plan.md](./plan.md) | Hackathon execution plan and demo script |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Technical architecture, API reference, security model |
| [MCP_CREATION_PLAN.md](./MCP_CREATION_PLAN.md) | Plan for real MCP connectors to live security platforms |
| [LIVE_DEMO_ROADMAP.md](./LIVE_DEMO_ROADMAP.md) | Wazuh live alert feed roadmap |
| [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) | Render deployment guide |
| [SECURITY.md](./SECURITY.md) | Vulnerability disclosure policy |
