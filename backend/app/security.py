"""Cross-cutting security: response headers, rate limiter.

Login/logout is handled entirely by Supabase Auth now, and every /api/*
request is authenticated with a bearer token (not a cookie), so classic
CSRF -- which relies on browsers automatically attaching cookies -- no
longer applies here; there is nothing for a CSRF header to defend.
"""

from fastapi import Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

from app.config import settings

# Shared limiter instance; wired to the app in main.py and used as a
# decorator on rate-sensitive routes (e.g. chat) against abuse.
limiter = Limiter(key_func=get_remote_address)


# Swagger UI loads CSS/JS from jsDelivr and a FastAPI favicon; the strict API
# CSP would block those, so /docs gets a dedicated allowlist (docs are off in prod).
_DOCS_CSP = (
    "default-src 'none'; "
    "script-src 'self' https://cdn.jsdelivr.net 'unsafe-inline'; "
    "style-src 'self' https://cdn.jsdelivr.net 'unsafe-inline'; "
    "img-src 'self' https://fastapi.tiangolo.com data:; "
    "connect-src 'self'; "
    "frame-ancestors 'none'"
)
_API_CSP = "default-src 'none'; frame-ancestors 'none'"


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Attach hardening headers to every response."""

    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        path = request.url.path
        if path == "/docs" or path.startswith("/docs/"):
            response.headers["Content-Security-Policy"] = _DOCS_CSP
        else:
            # JSON/SSE API responses: maximally strict CSP is safe.
            response.headers["Content-Security-Policy"] = _API_CSP
        if settings.is_production:
            response.headers["Strict-Transport-Security"] = (
                "max-age=63072000; includeSubDomains"
            )
        return response
