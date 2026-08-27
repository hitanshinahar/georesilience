from fastapi import APIRouter, HTTPException
import sys
import os

# Add ml folder to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..")))

from ml.fusion.schemas import FusionRequest, FusionResponse
from ml.fusion.engine import fuse_risk_assessments

router = APIRouter()

@router.post("/fuse", response_model=FusionResponse)
def fuse_assessments(request: FusionRequest):
    """
    Fuses independent risk assessments from XGBoost, LSTM, Transformer, and SLM Field Intelligence 
    into a unified final risk assessment with evidence coverage.
    """
    try:
        result = fuse_risk_assessments(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fusion error: {str(e)}")
