from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from app.schemas.assessment import AssessmentRequest, AssessmentResponse
from app.schemas.schemas import TimeseriesPredictionRequest, FieldIntelligenceRequest
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..")))

from app.routers.risk_router import predict_risk, predict_timeseries, predict_timeseries_transformer
from app.routers.slm_router import analyze_field_intelligence
from app.routers.fusion_router import fuse_assessments
from ml.fusion.schemas import FusionRequest, ModelSourceInput, FieldIntelligenceInput

router = APIRouter()

@router.post("/analyze", response_model=AssessmentResponse)
def run_orchestrated_assessment(request: AssessmentRequest):
    """
    Orchestrates the entire Phase 6 intelligence pipeline.
    Runs XGBoost, LSTM, Transformer, and SLM based on provided inputs.
    Fuses all available intelligence into a unified assessment.
    """
    model_outputs = {}
    data_sources = {
        "xgboost_available": False,
        "lstm_available": False,
        "transformer_available": False,
        "field_intelligence_available": False
    }
    
    fusion_req = FusionRequest()
    
    # 1. XGBoost
    if request.static_features:
        try:
            xgboost_res = predict_risk(request.static_features)
            # Handle Pydantic V2 dict() deprecation gracefully
            model_outputs["xgboost"] = xgboost_res.model_dump() if hasattr(xgboost_res, "model_dump") else xgboost_res.dict()
            data_sources["xgboost_available"] = True
            fusion_req.xgboost = ModelSourceInput(
                risk_score=xgboost_res.static_susceptibility_score,
                confidence=0.85, # using default prototype reliability
                available=True
            )
        except Exception as e:
            model_outputs["xgboost"] = {"error": str(e)}
            fusion_req.xgboost = ModelSourceInput(risk_score=0, available=False)
    
    # 2. LSTM & Transformer
    if request.timeseries_sequence:
        ts_req = TimeseriesPredictionRequest(sequence=request.timeseries_sequence)
        
        # LSTM
        try:
            lstm_res = predict_timeseries(ts_req)
            model_outputs["lstm"] = lstm_res.model_dump() if hasattr(lstm_res, "model_dump") else lstm_res.dict()
            data_sources["lstm_available"] = lstm_res.model_available
            fusion_req.lstm = ModelSourceInput(
                risk_score=lstm_res.temporal_risk_lstm,
                confidence=0.82,
                available=lstm_res.model_available
            )
        except Exception as e:
            model_outputs["lstm"] = {"error": str(e)}
            fusion_req.lstm = ModelSourceInput(risk_score=0, available=False)
            
        # Transformer
        try:
            tf_res = predict_timeseries_transformer(ts_req)
            model_outputs["transformer"] = tf_res.model_dump() if hasattr(tf_res, "model_dump") else tf_res.dict()
            data_sources["transformer_available"] = tf_res.model_available
            fusion_req.transformer = ModelSourceInput(
                risk_score=tf_res.temporal_risk_transformer,
                confidence=0.86,
                available=tf_res.model_available
            )
        except Exception as e:
            model_outputs["transformer"] = {"error": str(e)}
            fusion_req.transformer = ModelSourceInput(risk_score=0, available=False)
            
    # 3. SLM Field Intelligence
    if request.field_report:
        fi_req = FieldIntelligenceRequest(
            report_text=request.field_report,
            latitude=request.location.latitude if request.location else None,
            longitude=request.location.longitude if request.location else None
        )
        try:
            slm_res = analyze_field_intelligence(fi_req)
            model_outputs["field_intelligence"] = slm_res
            data_sources["field_intelligence_available"] = True
            
            fusion_req.field_intelligence = FieldIntelligenceInput(
                hazard_type=slm_res.get("hazard_type", "none"),
                hazard_confidence=slm_res.get("hazard_confidence", 0.0),
                severity=slm_res.get("severity", "low"),
                urgency=slm_res.get("urgency", "routine"),
                observations=slm_res.get("observations", []),
                temporal_change=slm_res.get("temporal_change", "stable"),
                recommended_action=slm_res.get("recommended_action", "")
            )
        except Exception as e:
            model_outputs["field_intelligence"] = {"error": str(e)}
            
    # 4. Run Fusion
    try:
        fusion_response = fuse_assessments(fusion_req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fusion orchestrator error: {str(e)}")
    
    return AssessmentResponse(
        location=request.location,
        assessment=fusion_response,
        model_outputs=model_outputs,
        data_sources=data_sources
    )
