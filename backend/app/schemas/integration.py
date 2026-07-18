"""Schemas for the connector/integration status surfaced on the dashboard."""

from typing import Literal, Optional

from pydantic import BaseModel

ConnectorStatusValue = Literal["connected", "degraded", "offline", "not_configured"]


class ConnectorInfo(BaseModel):
    source: str
    name: str
    status: ConnectorStatusValue
    last_sync: Optional[str] = None
    alerts_fetched: int = 0
    error: Optional[str] = None


class AvailableSource(BaseModel):
    id: str
    label: str


class IntegrationStatusResponse(BaseModel):
    alert_source: str
    active_source_label: str
    connector: Optional[ConnectorInfo] = None
    available_sources: list[AvailableSource]
