from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from app.schemas.schemas import StaticFeaturesInput, RiskPredictionResponse, TimeseriesPredictionRequest, TimeseriesPredictionResponse
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

router = APIRouter()

@router.post("/predict", response_model=RiskPredictionResponse)
def predict_risk(features: StaticFeaturesInput):
    if predictor is None:
        raise HTTPException(status_code=503, detail="ML model artifacts not found. Please train the model first.")
        
    try:
        result = predictor.predict_susceptibility(features.dict())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@router.post("/timeseries", response_model=TimeseriesPredictionResponse)
def predict_timeseries(request: TimeseriesPredictionRequest):
    if lstm_predictor is None:
        raise HTTPException(status_code=503, detail="LSTM model artifacts not found. Please train the model first.")
        
    try:
        seq_dicts = [step.dict() for step in request.sequence]
        result = lstm_predictor.predict_timeseries(seq_dicts)
        return result
    except ValueError as ve:
        raise HTTPException(status_code=422, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")
