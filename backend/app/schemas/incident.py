from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum


class IncidentStatus(str, Enum):
    OPEN = "OPEN"
    UNDER_REVIEW = "UNDER_REVIEW"
    FIELD_VERIFIED = "FIELD_VERIFIED"
    ESCALATED = "ESCALATED"
    RESOLVED = "RESOLVED"
    DISMISSED = "DISMISSED"


class IncidentCreate(BaseModel):
    latitude: float
    longitude: float
    location_name: Optional[str] = None
    risk_level: str
    risk_score: float = Field(0.0, ge=0.0, le=1.0)
    evidence_coverage: float = Field(0.0, ge=0.0, le=1.0)
    model_agreement: str = "insufficient_data"
    requires_human_review: bool = False
    recommended_action: Optional[str] = None
    source: str = "assessment"
    assessment_data: Optional[dict] = None


class ReviewActionRequest(BaseModel):
    action: str = Field(..., description="One of: VERIFY, ESCALATE, DISMISS, RESOLVE")
    reviewer_id: str = Field(default="operator")
    note: Optional[str] = None


class StatusUpdateRequest(BaseModel):
    status: str
    note: Optional[str] = None
    reviewer_id: str = Field(default="operator")


class ReviewActionResponse(BaseModel):
    review_id: str
    incident_id: str
    action: str
    reviewer_id: str
    note: Optional[str] = None
    timestamp: str
    new_status: str


class IncidentResponse(BaseModel):
    incident_id: str
    latitude: float
    longitude: float
    location_name: Optional[str] = None
    status: str
    risk_level: str
    risk_score: float
    evidence_coverage: float
    model_agreement: str
    requires_human_review: bool
    recommended_action: Optional[str] = None
    source: str
    assessment_data: Optional[dict] = None
    linked_report_ids: List[str] = []
    review_history: List[dict] = []
    created_at: str
    updated_at: str
