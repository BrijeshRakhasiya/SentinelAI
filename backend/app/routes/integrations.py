"""Connector/integration status for the dashboard's Integration page.

Exposes which alert source is active (demo / real-world JSON feed / MCP
connector) and, when it's an MCP connector, live health so the dashboard can
show "connected / degraded / offline" instead of pretending everything is
always fine (MCP_CREATION_PLAN.md "Phase 4: Dashboard Connector Status").

The active source can also be switched at runtime from the dashboard via
POST /api/integrations/source, so demoing "here's live GuardDuty data" vs
"here's a broader real-world feed" doesn't require touching the backend.
"""

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.dependencies import get_current_user
from app.schemas.integration import ConnectorInfo, IntegrationStatusResponse, SetAlertSourceRequest
from app.security import limiter
from app.services.alert_sources import available_sources, get_alert_source, get_current_mode, set_current_mode
from app.services.mcp_client import mcp_client

router = APIRouter(prefix="/api", tags=["integrations"])


def _build_status() -> IntegrationStatusResponse:
    mode = get_current_mode()
    source = get_alert_source()

    connector: ConnectorInfo | None = None
    if mode == "mcp":
        # Touch the connector once so the dashboard reflects live status even
        # before the first /api/stream connection of a session.
        state = mcp_client.get_connector_status("aws_guardduty")
        if state.last_sync is None:
            get_alert_source().get_alerts()
            state = mcp_client.get_connector_status("aws_guardduty")
        connector = ConnectorInfo(
            source=state.source,
            name=state.name,
            status=state.status,
            last_sync=state.last_sync.isoformat() if state.last_sync else None,
            alerts_fetched=state.alerts_fetched,
            error=state.error,
        )

    return IntegrationStatusResponse(
        alert_source=mode,
        active_source_label=source.name,
        connector=connector,
        available_sources=[a for a in available_sources()],
    )


@router.get("/integrations/status")
def integration_status(_user: str = Depends(get_current_user)) -> IntegrationStatusResponse:
    return _build_status()


@router.post("/integrations/source")
@limiter.limit("20/minute")
def set_alert_source(
    request: Request,
    body: SetAlertSourceRequest,
    _user: str = Depends(get_current_user),
) -> IntegrationStatusResponse:
    valid_ids = {s["id"] for s in available_sources()}
    if body.source not in valid_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown alert source '{body.source}'. Valid options: {sorted(valid_ids)}",
        )
    set_current_mode(body.source)
    return _build_status()
