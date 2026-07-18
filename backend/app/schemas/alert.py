from enum import Enum

from pydantic import BaseModel


class Severity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class Alert(BaseModel):
    id: str
    title: str
    description: str
    source: str
    severity: Severity
    category: str
