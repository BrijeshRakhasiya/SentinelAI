"""Central application settings.

All configuration comes from environment variables (or a local .env file).
Import the module-level ``settings`` instance everywhere -- never call
``os.getenv`` directly in the rest of the codebase.
"""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    ENVIRONMENT: str = "development"

    # Gemini (server-side only; never exposed to the frontend)
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-3.5-flash"

    # Auth: user management/login lives in Supabase Auth. The frontend talks
    # to Supabase directly (supabase-js) and sends the resulting access token
    # to us as `Authorization: Bearer <token>`; we verify it against Supabase
    # on every request (see app/dependencies.py). No secrets to sign/verify
    # our own JWTs are needed here.
    SUPABASE_URL: str = ""
    SUPABASE_PUBLISHABLE_KEY: str = ""

    # CORS: comma-separated allowlist, never "*" (credentials are enabled)
    CORS_ORIGINS: str = "http://localhost:3000"

    # Demo mode: serve pre-recorded responses instead of calling Gemini
    USE_CACHE: bool = True

    DATABASE_URL: str = "sqlite:///./sentinelai.db"

    # Alert ingestion source (see MCP_CREATION_PLAN.md):
    #   demo            -> curated synthetic alerts (app/data/alerts.py)
    #   real_world_json -> static real-world-shaped feed (app/data/real_world_soc_alerts.json)
    #   mcp             -> live MCP connector (AWS GuardDuty by default)
    ALERT_SOURCE: str = "demo"

    @property
    def alert_source_normalized(self) -> str:
        value = self.ALERT_SOURCE.strip().lower()
        return value if value in ("demo", "real_world_json", "mcp") else "demo"

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() == "production"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
