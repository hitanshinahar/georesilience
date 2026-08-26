from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum

class RiskTierEnum(str, Enum):
    LOW = "LOW"
    MODERATE = "MODERATE"
    HIGH = "HIGH"

class ContributingFactor(BaseModel):
    feature: str
    contribution: float

class StaticRiskPredictionResponse(BaseModel):
    static_susceptibility_score: float = Field(..., ge=0.0, le=1.0)
    risk_tier: RiskTierEnum
    top_contributing_factors: List[ContributingFactor]
    provenance: str = "XGBoost_Static_Baseline_v1.0"

class FieldReportCreate(BaseModel):
    latitude: float
    longitude: float
    hazard_type: str
    confidence: float
    image_base64: Optional[str] = None
    is_offline_cached: bool = False
    timestamp_iso: str
