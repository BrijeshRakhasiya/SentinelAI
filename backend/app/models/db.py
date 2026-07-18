"""SQLAlchemy engine, session factory, and schema init."""

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import settings


class Base(DeclarativeBase):
    pass


def _engine_kwargs() -> dict:
    # SQLite needs check_same_thread=False because FastAPI may hand the
    # session to a different thread; other databases must not receive it.
    if settings.DATABASE_URL.startswith("sqlite"):
        return {"connect_args": {"check_same_thread": False}}
    return {}


engine = create_engine(settings.DATABASE_URL, **_engine_kwargs())

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)


def init_db() -> None:
    # Import models so their tables are registered on Base.metadata
    from app.models import audit  # noqa: F401

    Base.metadata.create_all(bind=engine)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
