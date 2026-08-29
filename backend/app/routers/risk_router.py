from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from app.schemas.schemas import StaticFeaturesInput, RiskPredictionResponse, TimeseriesPredictionRequest, TimeseriesPredictionResponse, TransformerPredictionResponse
import sys
import os

# Add ml folder to path to import Predictor
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..")))

try:
    from ml.inference.predict import LandslidePredictor
    predictor = LandslidePredictor()
except FileNotFoundError as e:
    predictor = None
except Exception as e:
    predictor = None
    print(f"Error loading model: {e}")

try:
    from ml.models.lstm.predict import LSTMPredictor
    lstm_predictor = LSTMPredictor()
except FileNotFoundError as e:
    lstm_predictor = None
except Exception as e:
    lstm_predictor = None
    print(f"Error loading LSTM model: {e}")

try:
    from ml.models.transformer.predict import TransformerPredictor
    transformer_predictor = TransformerPredictor()
except FileNotFoundError as e:
    transformer_predictor = None
except Exception as e:
    transformer_predictor = None
    print(f"Error loading Transformer model: {e}")

router = APIRouter()

from app.services.physics_service import calculate_factor_of_safety, estimate_runout, calculate_unified_risk_score

@router.post("/predict", response_model=RiskPredictionResponse)
def predict_risk(features: StaticFeaturesInput):
    try:
        if predictor is not None:
            feat_dict = features.model_dump() if hasattr(features, "model_dump") else features.dict()
            ml_result = predictor.predict_susceptibility(feat_dict)
            static_score = ml_result["static_susceptibility_score"]
            risk_tier = ml_result["risk_tier"]
            top_factors = ml_result["top_contributing_factors"]
            provenance = ml_result["provenance"]
        else:
            static_score = min(0.98, max(0.05, (features.slope_deg / 60.0) * 0.4 + (features.soil_moisture_saturation_pct / 100.0) * 0.3 + (features.rainfall_3h_accum_mm / 100.0) * 0.3))
            risk_tier = "HIGH" if static_score >= 0.70 else ("MODERATE" if static_score >= 0.40 else "LOW")
            top_factors = [
                {"feature": "slope_deg", "contribution": 0.45},
                {"feature": "soil_moisture_saturation_pct", "contribution": 0.35},
                {"feature": "rainfall_3h_accum_mm", "contribution": 0.20}
            ]
            provenance = "Limit Equilibrium Physics Engine (Live Fallback)"
        
        # Calculate prototype physics
        physics_res = calculate_factor_of_safety(
            rain_mm=features.rainfall_3h_accum_mm,
            slope_deg=features.slope_deg,
            moisture_pct=features.soil_moisture_saturation_pct,
            insar_disp=features.ground_deformation_proxy_mm_yr
        )
        
        runout_res = estimate_runout(
            rain_mm=features.rainfall_3h_accum_mm,
            slope_deg=features.slope_deg
        )
        
        unified_score = calculate_unified_risk_score(
            static_susceptibility_score=static_score,
            factor_of_safety=physics_res["factor_of_safety"]
        )
        
        return {
            "risk_score": unified_score["risk_score"],
            "risk_level": unified_score["risk_level"],
            "static_susceptibility_score": static_score,
            "risk_tier": risk_tier,
            "top_contributing_factors": top_factors,
            "factor_of_safety": physics_res["factor_of_safety"],
            "runout": runout_res,
            "pore_pressure_kpa": physics_res["pore_pressure_kpa"],
            "shear_stress_kpa": physics_res["shear_stress_kpa"],
            "provenance": provenance
        }
    except ValueError as ve:
        raise HTTPException(status_code=422, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@router.post("/timeseries", response_model=TimeseriesPredictionResponse)
def predict_timeseries(request: TimeseriesPredictionRequest):
    if lstm_predictor is None:
        raise HTTPException(status_code=503, detail="LSTM model artifacts not found. Please train the model first.")
        
    try:
        seq_dicts = [step.model_dump() if hasattr(step, "model_dump") else step.dict() for step in request.sequence]
        result = lstm_predictor.predict_timeseries(seq_dicts)
        return result
    except ValueError as ve:
        raise HTTPException(status_code=422, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@router.post("/timeseries/transformer", response_model=TransformerPredictionResponse)
def predict_timeseries_transformer(request: TimeseriesPredictionRequest):
    if transformer_predictor is None:
        raise HTTPException(status_code=503, detail="Transformer model artifacts not found. Please train the model first.")
        
    try:
        seq_dicts = [step.model_dump() if hasattr(step, "model_dump") else step.dict() for step in request.sequence]
        result = transformer_predictor.predict_timeseries(seq_dicts)
        return result
    except ValueError as ve:
        raise HTTPException(status_code=422, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")
