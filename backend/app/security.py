"""Cross-cutting security: response headers, CSRF check, login rate limiter."""

from fastapi import HTTPException, Request, status
from slowapi import Limiter
from slowapi.util import get_remote_address
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

from app.config import settings

# Shared limiter instance; wired to the app in main.py and used as a
# decorator on the login route (5/min/IP against brute force).
limiter = Limiter(key_func=get_remote_address)

CSRF_HEADER_NAME = "X-Requested-With"
CSRF_HEADER_VALUE = "SentinelAI"


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Attach hardening headers to every response."""

    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        # The backend serves JSON/SSE only, so a maximally strict CSP is safe.
        response.headers["Content-Security-Policy"] = (
            "default-src 'none'; frame-ancestors 'none'"
        )
        if settings.is_production:
            response.headers["Strict-Transport-Security"] = (
                "max-age=63072000; includeSubDomains"
            )
        return response


async def require_csrf_header(request: Request) -> None:
    """CSRF defense-in-depth for state-changing endpoints.

    Browsers won't attach custom headers on cross-site form/image requests
    without a CORS preflight, so requiring `X-Requested-With: SentinelAI`
    blocks classic CSRF even where SameSite=None is used (production).
    """
    if request.headers.get(CSRF_HEADER_NAME) != CSRF_HEADER_VALUE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Missing or invalid CSRF header",
        )
