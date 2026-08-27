from fastapi import APIRouter, HTTPException
from typing import Optional
from app.schemas.alert import AlertResponse
from app.services import alert_service

router = APIRouter()


@router.get("")
def list_alerts(severity: Optional[str] = None, status: Optional[str] = None):
    """List alerts with optional filters."""
    return alert_service.get_alerts(severity=severity, status=status)


@router.post("/{alert_id}/acknowledge", response_model=AlertResponse)
def acknowledge_alert(alert_id: str):
    """Acknowledge an active alert."""
    result = alert_service.acknowledge_alert(alert_id)
    if not result:
        raise HTTPException(status_code=404, detail="Alert not found")
    return result


@router.post("/{alert_id}/resolve", response_model=AlertResponse)
def resolve_alert(alert_id: str):
    """Resolve an alert."""
    result = alert_service.resolve_alert(alert_id)
    if not result:
        raise HTTPException(status_code=404, detail="Alert not found")
    return result
