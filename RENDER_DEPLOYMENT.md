# SentinelAI Render Deployment Guide

## Deployment Goal

Deploy SentinelAI on Render with:

- FastAPI backend
- React frontend
- Supabase Auth
- Gemini key stored only on the backend
- stable real-world JSON alert source until the Wazuh MCP connector and backend live-ingestion logic are ready

## Recommended Render Setup

Use:

- Backend: Docker web service from `backend/Dockerfile`
- Frontend: Static site from `frontend/` using `npm ci && npm run build`

Why frontend static site:

- React builds to static files.
- Render static hosting is simpler and cheaper.
- `REACT_APP_*` environment variables are baked during build.
- The frontend Dockerfile still exists for local Docker Compose or Docker-based hosting.

## Backend Service

Render settings:

- Root directory: `backend`
- Runtime: Docker
- Dockerfile: `backend/Dockerfile`
- Health check path: `/health`

Required env vars:

```env
ENVIRONMENT=production
GEMINI_API_KEY=your_gemini_key
GEMINI_MODEL=gemini-3.5-flash
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
USE_CACHE=true
DATABASE_URL=sqlite:///./sentinelai.db
ALERT_SOURCE=real_world_json
CORS_ORIGINS=https://your-render-frontend-url.onrender.com
```

Do not commit these values to git.

## Frontend Service

Render settings:

- Root directory: `frontend`
- Runtime: Static Site
- Build command: `npm ci && npm run build`
- Publish directory: `build`

Required env vars:

```env
REACT_APP_API_URL=https://your-render-backend-url.onrender.com
REACT_APP_SUPABASE_URL=https://your-project-ref.supabase.co
REACT_APP_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

## Local Docker

Both services have Dockerfiles:

- `backend/Dockerfile`
- `frontend/Dockerfile`

Run locally:

```powershell
docker compose up --build
```

Local URLs:

- Frontend: http://localhost:3000
- Backend: http://localhost:8000

## Alert Source Modes

`ALERT_SOURCE` controls the backend alert feed:

```env
ALERT_SOURCE=real_world_json
```

Available modes:

- `real_world_json`: realistic sector-style alerts from JSON; recommended for Render now.
- `mcp`: currently a simulated connector mode; use for live Wazuh only after the MCP connector and backend source logic are implemented and tested.

For the 30 July live demo:

1. Use `real_world_json` while setting up Render.
2. Deploy through GitHub push / Render Blueprint.
3. Build the Wazuh MCP connector separately.
4. Test the connector locally against Wazuh.
5. Add the backend live-ingestion logic after the connector is stable.
6. Switch Render to live connector mode only after end-to-end testing.

## Pre-Demo Checklist

- Backend `/health` returns `ok`.
- Frontend loads and login works.
- Supabase URL and publishable key are set in both services.
- Backend `CORS_ORIGINS` matches frontend URL.
- `GEMINI_API_KEY` is set only on backend.
- `USE_CACHE=true` for stable demo, unless live Gemini mode is fully tested.
- Do not show `.env` or API keys on screen.
