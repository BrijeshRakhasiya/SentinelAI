"""Shared FastAPI dependencies.

User management/login now lives entirely in Supabase Auth -- the frontend
signs in via supabase-js and attaches the resulting access token to every
request. We don't hold a JWT secret to verify that token locally, so instead
we ask Supabase to verify it for us via the `/auth/v1/user` endpoint. This
needs nothing but the public/publishable API key, which is safe to keep on
the backend as well as the frontend.
"""

import json
import logging
import urllib.error
import urllib.request
from typing import Optional

from fastapi import HTTPException, Query, Request, status

from app.config import settings

logger = logging.getLogger(__name__)

_NOT_AUTHENTICATED = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Not authenticated",
)


def _verify_with_supabase(token: str) -> dict:
    req = urllib.request.Request(
        f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/user",
        headers={
            "Authorization": f"Bearer {token}",
            "apikey": settings.SUPABASE_PUBLISHABLE_KEY,
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as exc:
        if exc.code not in (401, 403):
            logger.warning("Unexpected Supabase auth response: %s", exc.code)
        raise _NOT_AUTHENTICATED from exc
    except Exception as exc:  # network errors, timeouts, bad JSON, etc.
        logger.warning("Supabase auth verification failed: %s", exc)
        raise _NOT_AUTHENTICATED from exc


def get_current_user(
    request: Request,
    token: Optional[str] = Query(default=None),
) -> str:
    """Auth dependency guarding /api/* routes.

    Reads the Supabase access token from the `Authorization: Bearer <token>`
    header (normal fetch calls). SSE connections use the browser's native
    EventSource, which can't set custom headers, so those instead pass the
    token as a `?token=` query parameter.
    """
    auth_header = request.headers.get("authorization", "")
    bearer_token = None
    if auth_header.lower().startswith("bearer "):
        bearer_token = auth_header[7:].strip()

    access_token = bearer_token or token
    if not access_token:
        raise _NOT_AUTHENTICATED

    user = _verify_with_supabase(access_token)
    email = user.get("email")
    if not email:
        raise _NOT_AUTHENTICATED
    return email
