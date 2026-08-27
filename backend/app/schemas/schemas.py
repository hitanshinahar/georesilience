from pydantic import BaseModel, Field
from typing import List, Optional

class StaticFeaturesInput(BaseModel):
    elevation_m: float = Field(0.0)
    slope_deg: float = Field(0.0)
    aspect_deg: float = Field(0.0)
    tri_ruggedness: float = Field(0.0)
    plan_curvature: float = Field(0.0)
    rainfall_3h_accum_mm: float = Field(0.0)
    rainfall_72h_accum_mm: float = Field(0.0)
    soil_moisture_saturation_pct: float = Field(0.0)
    ground_deformation_proxy_mm_yr: float = Field(0.0)
    anthropogenic_load_proxy_kpa: float = Field(0.0)

class FeatureContribution(BaseModel):
    feature: str
    contribution: float

class RiskPredictionResponse(BaseModel):
    static_susceptibility_score: float
    risk_tier: str
    top_contributing_factors: List[FeatureContribution]
    provenance: str

class TimeseriesStep(BaseModel):
    rainfall_mm: float
    cumulative_rainfall_mm: float
    soil_moisture: float

class TimeseriesPredictionRequest(BaseModel):
    sequence: List[TimeseriesStep]

class TimeseriesPredictionResponse(BaseModel):
    temporal_risk_lstm: float
    trend: str
    sequence_length: int
    model_available: bool

class TransformerPredictionResponse(BaseModel):
    temporal_risk_transformer: float
    sequence_length: int
    model_available: bool

class FieldIntelligenceRequest(BaseModel):
    report_text: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    source_type: Optional[str] = None
