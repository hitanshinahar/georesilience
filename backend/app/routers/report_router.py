from fastapi import APIRouter, HTTPException
from typing import Optional
from app.schemas.report import ReportCreate, ReportResponse
from app.services import report_service
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..")))

# Import SLM predictor (may be None if model not loaded)
try:
    from ml.models.slm.predictor import SLMPredictor
    slm_predictor = SLMPredictor()
except Exception:
    slm_predictor = None

router = APIRouter()


@router.post("", response_model=ReportResponse)
def submit_report(report: ReportCreate):
    """Submit a field report. Triggers SLM analysis and incident linkage."""
    try:
        result = report_service.create_report(
            data=report.model_dump(),
            slm_predictor=slm_predictor,
        )
        if not result:
            raise HTTPException(status_code=500, detail="Failed to create report")
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report submission error: {str(e)}")


@router.get("")
def list_reports(status: Optional[str] = None):
    """List all field reports with optional status filter."""
    return report_service.get_reports(status=status)


@router.get("/{report_id}", response_model=ReportResponse)
def get_report(report_id: str):
    """Get a single field report by ID."""
    result = report_service.get_report(report_id)
    if not result:
        raise HTTPException(status_code=404, detail="Report not found")
    return result
