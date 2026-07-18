"""Default alert source: the 25 curated synthetic alerts used for the demo."""

from app.data.alerts import get_alerts as _get_synthetic_alerts
from app.schemas.alert import Alert
from app.services.alert_sources.base import AlertSource


class DemoAlertSource(AlertSource):
    name = "Demo dataset"

    def get_alerts(self) -> list[Alert]:
        return _get_synthetic_alerts()
