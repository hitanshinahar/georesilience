from pydantic import BaseModel, Field
from typing import List, Optional

class StaticFeaturesInput(BaseModel):
    elevation_m: float
    slope_deg: float
    aspect_deg: float
    tri_ruggedness: float
    plan_curvature: float
    rainfall_3h_accum_mm: float
    rainfall_72h_accum_mm: float
    soil_moisture_saturation_pct: float
    ground_deformation_proxy_mm_yr: float
    anthropogenic_load_proxy_kpa: float

class FeatureContribution(BaseModel):
    feature: str
    contribution: float

class RunoutMetrics(BaseModel):
    debris_reach_km: float
    inundation_area_km2: float
    impacted_khasras: int
    impacted_residents: int

class RiskPredictionResponse(BaseModel):
    risk_score: float
    risk_level: str
    static_susceptibility_score: float
    risk_tier: str
    top_contributing_factors: List[FeatureContribution]
    factor_of_safety: Optional[float] = None
    runout: Optional[RunoutMetrics] = None
    pore_pressure_kpa: Optional[float] = None
    shear_stress_kpa: Optional[float] = None
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
