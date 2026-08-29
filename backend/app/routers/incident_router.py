from fastapi import APIRouter, HTTPException
from typing import Optional
from app.schemas.incident import (
    IncidentCreate,
    IncidentResponse,
    ReviewActionRequest,
    ReviewActionResponse,
    StatusUpdateRequest,
)
from app.services import incident_service

router = APIRouter()


@router.post("", response_model=IncidentResponse)
def create_incident(incident: IncidentCreate):
    """Create a new incident."""
    try:
        result = incident_service.create_incident(incident.model_dump())
        if not result:
            raise HTTPException(status_code=500, detail="Failed to create incident")
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Incident creation error: {str(e)}")


@router.get("")
def list_incidents(
    risk_level: Optional[str] = None,
    status: Optional[str] = None,
    requires_human_review: Optional[bool] = None,
):
    """List incidents with optional filters."""
    return incident_service.get_incidents(
        risk_level=risk_level,
        status=status,
        requires_human_review=requires_human_review,
    )


@router.get("/{incident_id}", response_model=IncidentResponse)
def get_incident(incident_id: str):
    """Get a single incident with review history."""
    result = incident_service.get_incident(incident_id)
    if not result:
        raise HTTPException(status_code=404, detail="Incident not found")
    return result


@router.post("/{incident_id}/review", response_model=ReviewActionResponse)
def review_incident(incident_id: str, review: ReviewActionRequest):
    """
    Submit a review action on an incident.
    Valid actions: VERIFY, ESCALATE, DISMISS, RESOLVE.
    DISMISS requires a note.
    """
    try:
        result = incident_service.apply_review_action(
            incident_id=incident_id,
            action=review.action,
            reviewer_id=review.reviewer_id,
            note=review.note,
        )
        if not result:
            raise HTTPException(status_code=404, detail="Incident not found")
        return result
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Review error: {str(e)}")


@router.post("/{incident_id}/status", response_model=IncidentResponse)
def update_incident_status(incident_id: str, update: StatusUpdateRequest):
    """Directly update incident status with audit trail."""
    result = incident_service.update_status(
        incident_id=incident_id,
        status=update.status,
        reviewer_id=update.reviewer_id,
        note=update.note,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Incident not found")
    return result


@router.patch("/{incident_id}", response_model=IncidentResponse)
def patch_incident_status(incident_id: str, update: StatusUpdateRequest):
    """Alias for POST /{incident_id}/status using RESTful PATCH convention."""
    result = incident_service.update_status(
        incident_id=incident_id,
        status=update.status,
        reviewer_id=update.reviewer_id,
        note=update.note,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Incident not found")
    return result
