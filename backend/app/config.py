"""Central application settings.

All configuration comes from environment variables (or a local .env file).
Import the module-level ``settings`` instance everywhere -- never call
``os.getenv`` directly in the rest of the codebase.
"""

from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    ENVIRONMENT: str = "development"

    # Gemini (server-side only; never exposed to the frontend)
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-3.5-flash"

    # Auth
    JWT_SECRET: str = ""
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRY_HOURS: int = 24
    ADMIN_USERNAME: str = "admin"
    ADMIN_PASSWORD_HASH: str = ""  # bcrypt hash, never plaintext

    # CORS: comma-separated allowlist, never "*" (credentials are enabled)
    CORS_ORIGINS: str = "http://localhost:3000"

    # Demo mode: serve pre-recorded responses instead of calling Gemini
    USE_CACHE: bool = True

    DATABASE_URL: str = "sqlite:///./sentinelai.db"

    @field_validator("JWT_SECRET")
    @classmethod
    def _jwt_secret_length(cls, v: str) -> str:
        if v and len(v) < 32:
            raise ValueError("JWT_SECRET must be at least 32 characters")
        return v

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() == "production"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    # Cookie policy is environment-aware so login works both locally and on
    # Render, where frontend and backend live on different origins:
    #   dev  -> SameSite=Lax,  Secure=False (plain http://localhost)
    #   prod -> SameSite=None, Secure=True  (cross-site cookie over HTTPS).
    # SameSite=Strict (per ARCHITECTURE.md) would silently break cross-origin
    # login on Render, so production intentionally relaxes it to None+Secure.
    @property
    def cookie_samesite(self) -> str:
        return "none" if self.is_production else "lax"

    @property
    def cookie_secure(self) -> bool:
        return self.is_production


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
