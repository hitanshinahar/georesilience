from typing import Optional, Dict, Any
from .schemas import FusionRequest, EvidenceSource, ModelSourceInput, FieldIntelligenceInput
from .config import SOURCE_RELIABILITY
from .field_evidence import calculate_field_evidence_score

def normalize_model_source(source_name: str, data: Optional[ModelSourceInput]) -> EvidenceSource:
    if not data or not data.available:
        return EvidenceSource(
            source_name=source_name,
            risk_score=0.0,
            reliability_factor=0.0,
            available=False
        )
    
    # Use provided confidence if available, else default to prototype reliability factor
    reliability = data.confidence if data.confidence is not None else SOURCE_RELIABILITY.get(source_name, 0.5)
    
    return EvidenceSource(
        source_name=source_name,
        risk_score=data.risk_score,
        reliability_factor=reliability,
        available=True
    )

def normalize_field_intelligence(data: Optional[FieldIntelligenceInput]) -> EvidenceSource:
    if not data:
        return EvidenceSource(
            source_name="field_intelligence",
            risk_score=0.0,
            reliability_factor=0.0,
            available=False
        )
    
    # Field intelligence is not a calibrated probability. We map heuristics to a score.
    field_score, field_reliability, metadata = calculate_field_evidence_score(data)
    
    return EvidenceSource(
        source_name="field_intelligence",
        risk_score=field_score,
        reliability_factor=field_reliability,
        available=True,
        metadata=metadata
    )

def normalize_evidence(request: FusionRequest) -> Dict[str, EvidenceSource]:
    """
    Normalizes all incoming raw sources into a unified EvidenceSource format.
    Unavailable sources are explicitly marked as available=False, rather than silently yielding 0.
    """
    return {
        "xgboost": normalize_model_source("xgboost", request.xgboost),
        "lstm": normalize_model_source("lstm", request.lstm),
        "transformer": normalize_model_source("transformer", request.transformer),
        "field_intelligence": normalize_field_intelligence(request.field_intelligence)
    }
