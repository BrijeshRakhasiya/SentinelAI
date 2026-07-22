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
- Frontend: Docker web service from `frontend/Dockerfile`

Why Docker for both services:

- The deployment path is consistent: GitHub push -> Render Docker build -> service restart.
- The frontend Dockerfile builds the React app and serves it with nginx.
- `REACT_APP_*` environment variables are passed by Render as Docker build args and baked into the CRA build.
- nginx handles React Router SPA fallback inside the container.

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
- Runtime: Docker
- Dockerfile: `frontend/Dockerfile`

Required env vars:

```env
REACT_APP_API_URL=https://your-render-backend-url.onrender.com
REACT_APP_SUPABASE_URL=https://your-project-ref.supabase.co
REACT_APP_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

Render web services must listen on `$PORT`. The frontend nginx config is rendered from a template at container startup so it listens on Render's assigned port in production and port `80` locally by default.

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
2. Deploy backend and frontend through GitHub push / Render Blueprint Docker builds.
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
