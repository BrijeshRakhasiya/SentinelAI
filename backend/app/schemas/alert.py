from enum import Enum
from typing import Optional

from pydantic import BaseModel


class Severity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class Alert(BaseModel):
    """SentinelAI's normalized internal alert shape.

    Every alert source (demo data, a static JSON feed, or an MCP connector)
    must convert its native format into this schema before it reaches the
    triage pipeline -- this is what keeps the AI/decision logic identical
    regardless of where the alert originated (see MCP_CREATION_PLAN.md).
    """

    id: str
    title: str
    description: str
    source: str
    severity: Severity
    category: str
    # Present for alerts normalized from an external platform (MCP, JSON feed).
    # Demo alerts leave these unset.
    timestamp: Optional[str] = None
    raw_reference: Optional[str] = None
