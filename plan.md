# SentinelAI — Hackathon Execution Plan

**Owner:** AI Product Manager  
**Goal:** Ship a working demo that shows SentinelAI auto-resolving easy alerts, escalating hard ones with clear reasoning, and proving analyst time saved — all in one hackathon sprint.

---

## 1. What Success Looks Like

By demo time, a judge or teammate should be able to:

1. Log in to a live dashboard
2. Watch security alerts stream in
3. See obvious alerts get **auto-resolved** with plain-English reasoning
4. See one ambiguous/high-severity alert get **escalated** with a specific explanation of why the agent is unsure
5. View a simple chart: **auto-resolved vs escalated** counts
6. Understand the real-world path via the `/integration` page

**One-line pitch:**  
*SentinelAI is not about replacing analysts — it removes alert noise so humans only handle the 20% that needs judgment.*

---

## 2. Team Roles

| Role | Owns | Does NOT own |
|------|------|--------------|
| **AI Product Manager (you)** | Scope, demo script, alert scenarios, pitch deck, judge Q&A, prioritization | Writing all the code |
| **Backend engineer** | FastAPI, agent logic, SSE stream, auth, SQLite audit log, Render deploy | UI polish |
| **Frontend engineer** | React (CRA) dashboard, alert feed, charts, login, `/integration` page | AI prompt tuning |
| **Full-stack / floater** | Docker Compose, env setup, glue work, bug fixes, demo rehearsal | New features outside scope |

If the team is smaller, combine roles — but **one person must own the demo script and one must own deployment**.

---

## 3. Scope — Build This, Skip Everything Else

### In scope (must ship)

- 25 synthetic alerts (mix of obvious + ambiguous)
- Gemini-powered triage: confidence + reasoning + auto-resolve / escalate
- Server-side decision rule (confidence ≥ 75 AND severity ≠ high → auto-resolve)
- Live alert feed (SSE)
- Dashboard with auto-resolved vs escalated split
- JWT login (single admin account is fine)
- Audit log of every decision
- Demo mode with cached responses (`USE_CACHE=true`) so the demo never breaks on API limits
- Docker Compose for local dev
- Deploy backend + frontend to Render

### Out of scope (do not build now)

- Real SIEM / EDR integration
- Multi-user RBAC
- Slack / Teams / Jira integrations (describe on `/integration`, don't wire up)
- Auto-blocking on production networks
- Postgres, Kubernetes, or enterprise auth

**Rule:** If it doesn't appear in the demo script (Section 8), it waits until after the hackathon.

---

## 4. Architecture (Quick Reference)

```
Synthetic alerts (alerts.py)
        ↓
FastAPI backend (main.py) ──→ Gemini agent (agent.py)
        ↓                           ↓
   SSE stream              JSON: decision, confidence, reasoning
        ↓                           ↓
React dashboard           Server rule + audit log (database.py)
   AlertFeed                    cache.py fallback
   AnalystDashboard
```

**Key files to create:**

| Layer | Files |
|-------|-------|
| Backend | `main.py`, `agent.py`, `alerts.py`, `cache.py`, `database.py`, `auth.py`, `backup_responses.json` |
| Frontend | `src/pages/LoginPage.tsx`, `DashboardPage.tsx`, `IntegrationPage.tsx`, `components/AlertFeed.tsx`, `AlertCard.tsx`, `AnalystDashboard.tsx`, `ExplainerBanner.tsx` |
| Infra | `docker-compose.yml`, `Dockerfile` (backend + frontend), `.env.example` |

Full technical context: see [context.md](./context.md).

---

## 5. Phased Timeline

Adjust hours to your hackathon length. Priorities are fixed — do Phase 1 before Phase 2.

### Phase 1 — Core loop (Hours 0–8) — CRITICAL

**Backend**
- [ ] Scaffold FastAPI app with health check
- [ ] Create `alerts.py` with 25 synthetic alerts (vary severity, source, ambiguity)
- [ ] Implement `agent.py` — structured prompt → Gemini → parse JSON response
- [ ] Enforce decision rule server-side (don't trust model output blindly)
- [ ] Add `cache.py` fallback for API/parse failures
- [ ] Log every triage result to SQLite (`database.py`)

**Frontend**
- [ ] Scaffold Create React App + TypeScript + Tailwind
- [ ] Build `AlertCard` — show alert title, severity, decision badge, reasoning
- [ ] Build basic `AlertFeed` (polling is OK initially; SSE comes in Phase 2)

**PM**
- [ ] Finalize alert scenarios: which 5–8 should auto-resolve, which 2–3 must escalate
- [ ] Write first draft of demo script (Section 8)

**Exit criteria:** One alert can be sent to the API and return auto-resolve or escalate with reasoning, visible in the UI.

---

### Phase 2 — Live demo experience (Hours 8–16) — HIGH

**Backend**
- [ ] SSE endpoint for streaming alerts to the frontend
- [ ] JWT auth (`auth.py`) — login endpoint + protected routes
- [ ] Pre-record responses in `backup_responses.json` for demo mode
- [ ] `USE_CACHE=true` env flag for reliable judging

**Frontend**
- [ ] Wire `AlertFeed` to SSE
- [ ] Build `AnalystDashboard` — counts/chart for auto-resolved vs escalated
- [ ] Login page + protected dashboard route
- [ ] `ExplainerBanner` — problem/solution framing on main page

**PM**
- [ ] Review alert copy — reasoning must sound like a SOC analyst, not generic AI fluff
- [ ] Test the "escalation moment" — judges must feel the agent knows when it's unsure

**Exit criteria:** Full alert stream runs live; dashboard updates in real time; login works.

---

### Phase 3 — Polish & deploy (Hours 16–22) — MEDIUM

**Backend + Frontend**
- [ ] Docker Compose — both services run with one command
- [ ] Deploy backend to Render
- [ ] Deploy frontend to Render
- [ ] Confirm cold-start behavior; warm up services before judging

**Frontend**
- [ ] `/integration` page — how SentinelAI plugs into SIEM, escalation paths, on-prem vs cloud
- [ ] Visual polish: severity colors, auto-resolve (green) vs escalate (amber/red)

**PM**
- [ ] Final demo script + pitch deck (problem → solution → live demo → roadmap)
- [ ] Prepare honest answers for known limitations (see Section 9)
- [ ] Run 2 full demo rehearsals end-to-end

**Exit criteria:** Public URLs work; demo runs without manual fixes.

---

### Phase 4 — Buffer (Hours 22–24) — ONLY IF TIME

- [ ] Improve chart animations / UX micro-interactions
- [ ] Add export or view of audit log in UI
- [ ] Record a 60-second backup demo video in case live demo fails

---

## 6. Alert Design (PM Owns This)

Alerts drive the story. Design them intentionally:

| Type | Count | Example | Expected outcome |
|------|-------|---------|------------------|
| Obvious false positive | ~8 | Known scanner IP, duplicate login from same user | Auto-resolve, high confidence |
| Low-risk routine | ~7 | Failed login x3, outdated SSL cert on dev server | Auto-resolve |
| Ambiguous | ~5 | Unusual outbound traffic, new admin account | Escalate — explain uncertainty |
| High severity | ~5 | Possible data exfil, ransomware indicators | Escalate — never auto-resolve high severity |

**Quality bar for reasoning:**
- Bad: *"This alert requires review."*
- Good: *"Traffic to 185.x.x.x matches a known vulnerability scanner. No lateral movement observed. Confidence 92% — safe to close."*

---

## 7. Agent Decision Rules

These are non-negotiable — implement exactly:

```
IF confidence >= 75 AND severity != "high"
  → auto_resolve
ELSE
  → escalate
```

On any Gemini failure (timeout, bad JSON, rate limit):
- Fall back to `cache.py` severity-aware default
- **Never crash the demo**

For judging, default deployed backend to `USE_CACHE=true`.

---

## 8. Demo Script (5 Minutes)

Practice this until it's smooth.

| Time | What happens | Who |
|------|--------------|-----|
| 0:00–0:45 | Problem: alert fatigue, analysts drowning in noise | PM |
| 0:45–1:15 | Solution: calibrated trust — auto-resolve when confident, escalate when not | PM |
| 1:15–1:30 | Log in to live dashboard | PM or FE |
| 1:30–3:00 | Alerts stream in; point out 2–3 auto-resolves with reasoning on screen | PM |
| 3:00–3:45 | **Key moment:** ambiguous alert escalates — read the reasoning aloud | PM |
| 3:45–4:15 | Show dashboard chart — "X alerts handled without analyst time" | PM |
| 4:15–4:45 | Quick tour of `/integration` — SIEM webhook, audit trail, iDEX path | PM |
| 4:45–5:00 | Close: "AI teammate, not AI replacement" | PM |

**Backup plan:** If Render cold-starts, run locally via Docker Compose. If API fails, confirm `USE_CACHE=true` is set.

---

## 9. Judge Q&A — Be Honest

| Question | Answer |
|----------|--------|
| Is this connected to a real SIEM? | Not yet — synthetic alerts for demo. Integration path is documented at `/integration`. |
| What if the AI is wrong? | High-severity alerts always escalate. Every decision is audit-logged. Humans stay in the loop for uncertain cases. |
| Why Gemini? | Fast, cost-effective for hackathon; architecture is model-agnostic. |
| Can this scale? | Demo uses SQLite; production would use Postgres + queue-based alert ingestion. |
| What's next after hackathon? | iDEX/DISC submission path for defence cybersecurity funding in India. |

---

## 10. Environment Setup

### Backend `.env.example`

```
GEMINI_API_KEY=your_key_here
JWT_SECRET=change_me_in_production
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change_me
USE_CACHE=true
DATABASE_URL=sqlite:///./sentinelai.db
```

### Local run (target state)

```bash
docker compose up --build
# Backend: http://localhost:8000
# Frontend: http://localhost:3000
```

### Deploy checklist

- [ ] Backend env vars set on Render
- [ ] Frontend `REACT_APP_API_URL` points to backend
- [ ] CORS allows frontend origin
- [ ] `USE_CACHE=true` on production for demo day
- [ ] Warm up both services 5 minutes before presenting

---

## 11. Definition of Done

The hackathon is **done** when all of these are true:

- [ ] Live URLs work (backend + frontend)
- [ ] Login required to view dashboard
- [ ] Alerts stream live with visible reasoning
- [ ] At least one alert clearly escalates with a specific "why I'm unsure" explanation
- [ ] Dashboard shows auto-resolved vs escalated counts
- [ ] `/integration` page explains real-world deployment
- [ ] Demo rehearsed twice without crashes
- [ ] PM can deliver 5-minute pitch from memory

---

## 12. Daily Standup Format (15 min)

Each sync, every person answers:

1. **What I shipped since last standup**
2. **What I'm building next**
3. **What's blocking me**

PM ends every standup with:
- Updated priority (if something slipped)
- Next milestone and who owns it

---

## 13. Communication Norms

- **Scope changes** go through PM — no surprise features
- **Broken demo** beats perfect code — prioritize the demo script path
- **Push to `main` often** — small commits, don't hoard work
- **Document env vars** in `.env.example` immediately when added
- If stuck >30 minutes, ask in team chat — don't silently spin

---

## 14. Links & References

| Resource | Location |
|----------|----------|
| Product overview | [README.md](./README.md) |
| Technical architecture | [ARCHITECTURE.md](./ARCHITECTURE.md) |
| Security policy | [SECURITY.md](./SECURITY.md) |
| GitHub repo | https://github.com/BrijeshRakhasiya/SentinelAI |
| Backend (when deployed) | https://sentinelai-backend-mtxy.onrender.com |

---

**Next action for the team:** Read Sections 1–3, assign roles (Section 2), and start Phase 1 backend scaffold + alert list today.
