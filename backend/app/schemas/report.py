from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class ReporterType(str, Enum):
    citizen = "citizen"
    field_officer = "field_officer"


class ReportCreate(BaseModel):
    report_text: str = Field(..., min_length=1)
    latitude: float
    longitude: float
    location_name: Optional[str] = None
    reporter_type: ReporterType = ReporterType.citizen
    timestamp: Optional[str] = None
    image_url: Optional[str] = None


class ReportResponse(BaseModel):
    report_id: str
    report_text: str
    latitude: float
    longitude: float
    location_name: Optional[str] = None
    reporter_type: str
    timestamp: str
    image_url: Optional[str] = None
    status: str
    slm_analysis: Optional[dict] = None
    linked_incident_id: Optional[str] = None
    created_at: str
