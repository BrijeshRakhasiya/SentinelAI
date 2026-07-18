# SentinelAI — Technical Architecture

**Stack:** Python 3.11+ / FastAPI (backend) · React 18 / Create React App / TypeScript (frontend)  
**No Vite. No Next.js.** Pure React SPA bundled with `react-scripts` (Webpack).

---

## Stack

| Layer | Choice |
|-------|--------|
| Backend | FastAPI, SQLAlchemy, SQLite |
| Frontend | Create React App + TypeScript + React Router + Tailwind |
| AI | Google Gemini (server-side only) |
| Auth | JWT in httpOnly cookie (bcrypt password hash) |
| Streaming | SSE (`/api/stream`) |
| Deploy | Docker Compose locally; Render for demo |

---

## System Overview

```
Synthetic alerts (alerts.py)
        ↓
FastAPI backend ──→ Gemini agent (agent.py)
        ↓                    ↓
   SSE stream         decision + reasoning
        ↓                    ↓
React dashboard      audit log (SQLite)
```

---

## Repository Layout

```
SentinelAI/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── routes/          # auth, stream, stats
│   │   ├── services/        # agent, decision, cache
│   │   ├── models/          # SQLAlchemy audit log
│   │   ├── schemas/         # Pydantic models
│   │   └── data/            # alerts.py, backup_responses.json
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── public/index.html
│   ├── src/
│   │   ├── index.tsx        # CRA entry
│   │   ├── App.tsx          # React Router
│   │   ├── setupProxy.js    # Dev proxy → backend:8000
│   │   ├── api/client.ts
│   │   ├── hooks/useAlertStream.ts
│   │   ├── pages/           # Login, Dashboard, Integration
│   │   └── components/      # AlertFeed, AlertCard, AnalystDashboard
│   ├── package.json         # react-scripts (no Vite)
│   └── Dockerfile           # nginx serves build/
└── docker-compose.yml
```

---

## Frontend — Create React App (Not Vite)

### Scaffold

```bash
npx create-react-app frontend --template typescript
cd frontend
npm install react-router-dom recharts
npm install --save-dev tailwindcss http-proxy-middleware
```

### Dev server

- `npm start` → `http://localhost:3000`
- API proxy via `src/setupProxy.js`:

```javascript
const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    ["/auth", "/api", "/health"],
    createProxyMiddleware({ target: "http://localhost:8000", changeOrigin: true })
  );
};
```

### Environment

- Use `REACT_APP_API_URL` (CRA convention) — **not** `VITE_*`
- Production build output: `frontend/build/` (not `dist/`)

### Routing

| Path | Page | Auth |
|------|------|------|
| `/login` | LoginPage | Public |
| `/` | DashboardPage | Protected |
| `/integration` | IntegrationPage | Protected |

---

## Backend API

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/auth/login` | Public (rate-limited) | Set httpOnly JWT cookie |
| POST | `/auth/logout` | Auth | Clear cookie |
| GET | `/auth/me` | Auth | Session check |
| GET | `/api/stream` | Auth | SSE alert stream |
| GET | `/api/stats` | Auth | Auto-resolved vs escalated counts |
| GET | `/health` | Public | Liveness |

---

## Agent Decision Rule (Server-Enforced)

```
IF confidence >= 75 AND severity != "high"
  → auto_resolve
ELSE
  → escalate
```

High-severity alerts never auto-resolve. On Gemini failure → `cache.py` fallback.

---

## Security (No Loopholes)

| Risk | Mitigation |
|------|------------|
| JWT theft via XSS | httpOnly + Secure + SameSite=Strict cookie — never localStorage |
| CSRF | SameSite=Strict + `X-Requested-With: SentinelAI` on POST |
| Open CORS | Strict origin allowlist (`http://localhost:3000` in dev) |
| SQL injection | SQLAlchemy ORM only |
| XSS in alerts | React text nodes only — no `dangerouslySetInnerHTML` |
| Prompt injection | Alert content treated as untrusted data; schema-validated LLM output |
| Brute force login | Rate limit 5/min/IP on `/auth/login` |
| Secret leakage | Env vars only; `.env` gitignored; Gemini key server-side only |
| Verbose errors | Generic messages in production |
| Unauthenticated SSE | JWT required on `/api/stream` |

### Security headers (every response)

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Content-Security-Policy` (restrict scripts/connect to self + API)
- `Strict-Transport-Security` (production only)

---

## Local Run

```bash
docker compose up --build
# Backend: http://localhost:8000
# Frontend: http://localhost:3000
```

Or separately:

```bash
# Terminal 1 — backend
cd backend && uvicorn app.main:app --reload --port 8000

# Terminal 2 — frontend
cd frontend && npm start
```

---

## Environment Variables

### Backend (`.env`)

```
GEMINI_API_KEY=
JWT_SECRET=                    # min 32 random chars
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=         # bcrypt hash, not plaintext
CORS_ORIGINS=http://localhost:3000
USE_CACHE=true
ENVIRONMENT=development
DATABASE_URL=sqlite:///./sentinelai.db
```

### Frontend (`.env`)

```
REACT_APP_API_URL=http://localhost:8000
```

---

## Implementation Phases

1. **Backend core** — FastAPI, auth, agent, audit log, security middleware
2. **SSE + React** — stream endpoint, CRA frontend, login, dashboard
3. **Deploy** — Docker, Render, `USE_CACHE=true`, security checklist
4. **Buffer** — Integration page, audit log viewer, demo rehearsal

See [plan.md](./plan.md) for hackathon timeline and demo script.
