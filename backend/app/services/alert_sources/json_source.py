"""Alert source backed by a static, real-world-shaped JSON feed.

This is the stepping stone between the curated demo dataset and a live MCP
connector: the alerts look like real SOC output (multiple platforms,
mixed severities) but still ship with the repo so the dashboard works with
zero external credentials.
"""

import json
import logging
from functools import lru_cache
from pathlib import Path

from app.schemas.alert import Alert
from app.services.alert_sources.base import AlertSource

logger = logging.getLogger(__name__)

_DATA_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "real_world_soc_alerts.json"

# Fields on the raw JSON records that map directly onto Alert's normalized
# schema. `expected_decision` is test/demo metadata only -- never triage input.
_ALERT_FIELDS = {"id", "title", "description", "source", "severity", "category", "timestamp", "raw_reference"}


@lru_cache
def _load_raw_records() -> list[dict]:
    try:
        with _DATA_PATH.open(encoding="utf-8") as f:
            return json.load(f)
    except (OSError, json.JSONDecodeError) as exc:
        logger.error("Failed to load real-world alert dataset from %s: %s", _DATA_PATH, exc)
        return []


class JsonAlertSource(AlertSource):
    name = "Real-World SOC Alert Feed (Mock Data)"

    def get_alerts(self) -> list[Alert]:
        alerts: list[Alert] = []
        for record in _load_raw_records():
            fields = {k: v for k, v in record.items() if k in _ALERT_FIELDS}
            try:
                alerts.append(Alert(**fields))
            except Exception as exc:  # malformed record -- skip, don't crash the feed
                logger.warning("Skipping malformed alert record %s: %s", record.get("id"), exc)
        return alerts
