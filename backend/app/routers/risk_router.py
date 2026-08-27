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

@router.post("/predict", response_model=RiskPredictionResponse)
def predict_risk(features: StaticFeaturesInput):
    if predictor is None:
        raise HTTPException(status_code=503, detail="ML model artifacts not found. Please train the model first.")
        
    try:
        feat_dict = features.model_dump() if hasattr(features, "model_dump") else features.dict()
        result = predictor.predict_susceptibility(feat_dict)
        return result
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
