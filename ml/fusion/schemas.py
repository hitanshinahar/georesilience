from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any

class ModelSourceInput(BaseModel):
    risk_score: float = Field(..., ge=0.0, le=1.0)
    confidence: Optional[float] = Field(None, ge=0.0, le=1.0)
    available: bool = True

class FieldIntelligenceInput(BaseModel):
    hazard_type: Optional[str] = None
    hazard_confidence: Optional[float] = Field(None, ge=0.0, le=1.0) # Extraction confidence
    severity: Optional[str] = None
    urgency: Optional[str] = None
    observations: List[str] = []
    temporal_change: Optional[str] = None
    recommended_action: Optional[str] = None

class FusionRequest(BaseModel):
    xgboost: Optional[ModelSourceInput] = None
    lstm: Optional[ModelSourceInput] = None
    transformer: Optional[ModelSourceInput] = None
    field_intelligence: Optional[FieldIntelligenceInput] = None

class EvidenceSource(BaseModel):
    source_name: str
    risk_score: float
    reliability_factor: float
    available: bool
    metadata: Dict[str, Any] = {}

class FusionResponse(BaseModel):
    final_risk_score: float
    risk_level: str
    confidence: float # Overall fusion confidence heuristic
    model_agreement: str
    requires_human_review: bool
    recommended_action: str
    source_availability: Dict[str, bool]
    contributing_factors: List[Dict[str, Any]]
