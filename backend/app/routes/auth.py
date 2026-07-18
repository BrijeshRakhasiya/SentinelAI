"""JWT auth in an httpOnly cookie: login, logout, session check."""

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from jose import JWTError, jwt
from passlib.hash import bcrypt

from app.config import settings
from app.schemas.auth import LoginRequest, UserInfo
from app.security import limiter, require_csrf_header

router = APIRouter(prefix="/auth", tags=["auth"])

COOKIE_NAME = "sentinel_token"

_INVALID_CREDENTIALS = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Invalid username or password",
)
_NOT_AUTHENTICATED = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Not authenticated",
)


def _create_token(username: str) -> str:
    now = datetime.now(timezone.utc)
    claims = {
        "sub": username,
        "iat": now,
        "exp": now + timedelta(hours=settings.JWT_EXPIRY_HOURS),
    }
    return jwt.encode(claims, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def get_current_user(request: Request) -> str:
    """Cookie-based auth dependency guarding /api/* routes."""
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        raise _NOT_AUTHENTICATED
    try:
        claims = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    except JWTError:
        raise _NOT_AUTHENTICATED
    username = claims.get("sub")
    if username != settings.ADMIN_USERNAME:
        raise _NOT_AUTHENTICATED
    return username


@router.post("/login", dependencies=[Depends(require_csrf_header)])
@limiter.limit("5/minute")
def login(request: Request, body: LoginRequest, response: Response) -> UserInfo:
    # bcrypt.verify runs even on wrong usernames (against a burned dummy hash)
    # to keep response timing uniform and avoid username enumeration.
    stored_hash = (
        settings.ADMIN_PASSWORD_HASH
        if body.username == settings.ADMIN_USERNAME
        else bcrypt.hash("dummy-password-for-constant-time")
    )
    try:
        password_ok = bcrypt.verify(body.password, stored_hash)
    except ValueError:
        password_ok = False

    if body.username != settings.ADMIN_USERNAME or not password_ok:
        raise _INVALID_CREDENTIALS

    response.set_cookie(
        key=COOKIE_NAME,
        value=_create_token(body.username),
        max_age=settings.JWT_EXPIRY_HOURS * 3600,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        path="/",
    )
    return UserInfo(username=body.username)


@router.post("/logout", dependencies=[Depends(require_csrf_header)])
def logout(response: Response, _user: str = Depends(get_current_user)) -> dict:
    response.delete_cookie(
        key=COOKIE_NAME,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        path="/",
    )
    return {"detail": "Logged out"}


@router.get("/me")
def me(user: str = Depends(get_current_user)) -> UserInfo:
    return UserInfo(username=user)
