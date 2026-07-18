"""SentinelAI backend application factory."""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.config import settings
from app.models.db import init_db
from app.routes import chat, integrations, stats, stream
from app.security import SecurityHeadersMiddleware, limiter

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    logger.info(
        "SentinelAI backend started (environment=%s, use_cache=%s)",
        settings.ENVIRONMENT,
        settings.USE_CACHE,
    )
    yield


def create_app() -> FastAPI:
    app = FastAPI(
        title="SentinelAI API",
        version="0.1.0",
        lifespan=lifespan,
        # No interactive docs in production -- smaller surface, no endpoint map
        docs_url=None if settings.is_production else "/docs",
        redoc_url=None,
        openapi_url=None if settings.is_production else "/openapi.json",
    )

    # Rate limiting (slowapi)
    app.state.limiter = limiter
    app.add_middleware(SlowAPIMiddleware)

    @app.exception_handler(RateLimitExceeded)
    async def rate_limit_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
        return JSONResponse(
            status_code=429,
            content={"detail": "Too many requests. Try again in a minute."},
        )

    # Generic 500s in production: never leak stack traces or internals
    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.exception("Unhandled error on %s %s", request.method, request.url.path)
        detail = "Internal server error" if settings.is_production else f"{type(exc).__name__}: {exc}"
        return JSONResponse(status_code=500, content={"detail": detail})

    app.add_middleware(SecurityHeadersMiddleware)

    # Strict allowlist; Authorization carries the Supabase access token
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["GET", "POST"],
        allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
    )

    app.include_router(stream.router)
    app.include_router(stats.router)
    app.include_router(chat.router)
    app.include_router(integrations.router)

    @app.get("/health", tags=["health"])
    def health() -> dict:
        return {"status": "ok"}

    return app


app = create_app()
