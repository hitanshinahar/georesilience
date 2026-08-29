from fastapi import APIRouter, HTTPException
import sys
import os
from typing import Dict, Any
from app.schemas.schemas import FieldIntelligenceRequest

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..")))

try:
    from ml.models.slm.predictor import SLMPredictor
    slm_predictor = SLMPredictor()
except FileNotFoundError as e:
    slm_predictor = None
except Exception as e:
    slm_predictor = None
    print(f"Error loading SLM model: {e}")

router = APIRouter()

@router.post("/analyze")
def analyze_field_intelligence(request: FieldIntelligenceRequest) -> Dict[str, Any]:
    if slm_predictor is None:
        from ml.models.slm.predictor import deterministic_rule_fallback
        return deterministic_rule_fallback(request.report_text)
        
    try:
        result = slm_predictor.analyze(request.report_text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"SLM analysis error: {str(e)}")
