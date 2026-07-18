"""SSE endpoint streaming triaged alerts to the dashboard."""

import asyncio
import logging
from collections.abc import AsyncGenerator

from fastapi import APIRouter, Depends, Request
from fastapi.concurrency import run_in_threadpool
from fastapi.responses import StreamingResponse

from app.config import settings
from app.dependencies import get_current_user
from app.models.db import SessionLocal
from app.schemas.alert import Alert
from app.schemas.triage import TriageResult
from app.services.alert_sources import get_alert_source
from app.services.mcp_client import mcp_client
from app.services.triage import triage_alert

router = APIRouter(prefix="/api", tags=["stream"])

logger = logging.getLogger(__name__)

# Delay between alerts so the demo feed feels live rather than instant.
STREAM_INTERVAL_SECONDS = 2.0


def _triage_with_own_session(alert: Alert) -> TriageResult:
    db = SessionLocal()
    try:
        return triage_alert(alert, db)
    finally:
        db.close()


async def _event_stream(request: Request) -> AsyncGenerator[str, None]:
    source = get_alert_source()
    alerts = source.get_alerts()
    is_mcp = settings.alert_source_normalized == "mcp"

    for index, alert in enumerate(alerts):
        if await request.is_disconnected():
            logger.info("SSE client disconnected after %d alerts", index)
            return
        # Triage may call Gemini (blocking I/O) -> keep the event loop free.
        result = await run_in_threadpool(_triage_with_own_session, alert)
        if is_mcp:
            # Tell the source platform SentinelAI has processed this alert
            # (MCP tool: acknowledge_alert) so it isn't resurfaced.
            await run_in_threadpool(mcp_client.acknowledge_alert, "aws_guardduty", alert.id, result.decision)
        yield f"id: {index}\nevent: triage\ndata: {result.model_dump_json()}\n\n"
        await asyncio.sleep(STREAM_INTERVAL_SECONDS)
    yield "event: done\ndata: {}\n\n"


@router.get("/stream")
async def stream(request: Request, _user: str = Depends(get_current_user)) -> StreamingResponse:
    return StreamingResponse(
        _event_stream(request),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            # Disable proxy buffering so events arrive immediately
            "X-Accel-Buffering": "no",
        },
    )
