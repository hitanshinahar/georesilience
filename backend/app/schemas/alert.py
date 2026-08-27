from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class AlertStatus(str, Enum):
    ACTIVE = "ACTIVE"
    ACKNOWLEDGED = "ACKNOWLEDGED"
    RESOLVED = "RESOLVED"


class AlertResponse(BaseModel):
    alert_id: str
    incident_id: Optional[str] = None
    severity: str
    title: str
    message: str
    target_area: Optional[str] = None
    status: str
    created_at: str
