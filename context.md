# SentinelAI — Project Context

## What This Is

SentinelAI is an autonomous SOC (Security Operations Center) co-pilot. It
reads incoming security alerts, decides whether to auto-resolve them or
escalate them to a human analyst, and explains its reasoning in plain
language either way. Built for a hackathon; designed to demonstrate a real,
deployable path beyond the demo.

## The Problem

Security teams get thousands of alerts a day — most are false alarms.
Analysts get exhausted, tune out, and real threats slip through. Existing
AI security tools either auto-block everything (risky, breaks trust) or
just dump more alerts on already-tired humans (doesn't help).

## The Solution

An AI agent that:
- **Auto-resolves** alerts it's confident about and considers low-risk
- **Escalates** alerts it's uncertain about or that are high-stakes, with
  clear, specific reasoning attached — never a generic "please review"
- Logs every decision to an audit trail for compliance/review

The core differentiator: calibrated trust, not blanket automation. The
agent explicitly says when it's unsure rather than guessing.

## Tech Stack

**Backend** — Python + FastAPI
- `main.py` — API endpoints, auth, orchestration
- `agent.py` — Gemini-powered triage logic (model: gemini-3.5-flash)
- `alerts.py` — 25 synthetic security alerts (mix of obvious/ambiguous)
- `cache.py` — fallback decisions + demo-day response caching
- `database.py` — SQLite audit log (triage_log table)
- `auth.py` — JWT-based authentication

**Frontend** — Next.js (App Router) + TypeScript + Tailwind CSS
- `app/login/page.tsx` — login screen
- `app/page.tsx` — main dashboard (protected route)
- `app/integration/page.tsx` — customer-facing "how this integrates" page
- `components/AlertFeed.tsx` — live SSE-driven alert stream
- `components/AlertCard.tsx` — individual alert display
- `components/AnalystDashboard.tsx` — auto-resolved vs escalated split
- `components/ExplainerBanner.tsx` — problem/solution framing on dashboard

**Infrastructure**
- Docker Compose for local dev (both services containerized)
- Backend deployed on Render: `https://sentinelai-backend-mtxy.onrender.com`
- Frontend deployed on Render (service: `sentinelai-frontend`)
- SQLite for audit logging (file-based, no separate DB service needed)

## How the Agent Decides

1. Alert is sent to Gemini with a structured prompt asking for a triage
   decision, confidence score, reasoning, and suggested action
2. Response is parsed as JSON (markdown fences stripped if present)
3. A server-side rule enforces consistency regardless of what Gemini's
   own "decision" field said:
   - `confidence >= 75` AND `severity != "high"` → `auto_resolve`
   - otherwise → `escalate`
4. On any failure (API error, parse error, timeout), falls back to a
   severity-aware generic decision from `cache.py` — the demo never
   crashes on an API hiccup

## Demo Mode (`USE_CACHE=true`)

For reliable, quota-free demoing, the backend can serve pre-recorded
Gemini responses (`backup_responses.json`) instead of calling the live
API on every request. This is the default for the deployed version —
avoids Gemini free-tier rate limits during judging, with zero visible
difference to the person using the dashboard.

## Authentication

Single admin account, JWT-based (24-hour expiry), stored in an httponly
cookie. Intentionally simple for a hackathon — no refresh tokens, no
password rotation — but demonstrates real access-control thinking rather
than leaving the dashboard open.

## Real-World Integration Path (shown in-app at `/integration`)

- **Alert ingestion:** connects to existing SIEM/EDR tools (Splunk, QRadar,
  Microsoft Sentinel, CrowdStrike) via webhook/API — not a replacement for
  the existing security stack
- **Positioning:** a triage layer sitting between "alert fires" and "human
  looks at it"
- **Escalation delivery:** can post into Slack, Teams, or ticketing systems
  (Jira, ServiceNow) instead of requiring a separate dashboard
- **Deployment model:** on-premises (for regulated/defense clients who can't
  send data externally) or managed cloud
- **Compliance:** full audit trail of every automated decision

## Path to Real Deployment (India context)

India's Ministry of Defence funds cybersecurity/AI innovation through
**iDEX** (Innovations for Defence Excellence), via open challenges called
DISC (Defence India Startup Challenges). This working prototype would serve
as the proof-of-concept for a matching open challenge submission — startups
retain full IP, iDEX provides grant funding (up to ₹1.5 crore, or up to
₹10 crore under iDEX Prime) rather than acquiring the idea.

## Known Limitations (be upfront about these if asked)

- Single hardcoded admin account, not multi-user/role-based (yet)
- Synthetic alert data, not connected to a real SIEM
- Free-tier Render hosting — cold starts possible after inactivity
- SQLite audit log is fine for demo scale, would move to Postgres for
  production multi-instance deployment

## Live URLs

- Backend: `https://sentinelai-backend-mtxy.onrender.com`
- Frontend: (confirm exact URL from Render's `sentinelai-frontend` service)

## Repo

`https://github.com/BrijeshRakhasiya/SentinelAI`
