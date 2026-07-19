# SentinelAI Render Deployment Guide

## Deployment Goal

Deploy SentinelAI on Render with:

- FastAPI backend
- React frontend
- Supabase Auth
- Gemini key stored only on the backend
- stable demo alert source until the Wazuh MCP connector is ready

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
ALERT_SOURCE=demo
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
ALERT_SOURCE=demo
```

Available modes:

- `demo`: curated synthetic alerts with cached responses; best for stable demos.
- `real_world_json`: realistic sector-style alerts from JSON.
- `mcp`: connector mode; use after Wazuh/AWS connector is implemented and tested.

For the 30 July live demo:

1. Use `demo` while setting up Render.
2. Build the Wazuh MCP connector.
3. Test locally.
4. Switch Render to `ALERT_SOURCE=mcp` only after the connector is stable.

## Pre-Demo Checklist

- Backend `/health` returns `ok`.
- Frontend loads and login works.
- Supabase URL and publishable key are set in both services.
- Backend `CORS_ORIGINS` matches frontend URL.
- `GEMINI_API_KEY` is set only on backend.
- `USE_CACHE=true` for stable demo, unless live Gemini mode is fully tested.
- Do not show `.env` or API keys on screen.
