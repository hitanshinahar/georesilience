from typing import Tuple, Dict, Any
from .schemas import FieldIntelligenceInput
from .config import (
    FIELD_EVIDENCE_SEVERITY_MAPPING,
    FIELD_EVIDENCE_URGENCY_MULTIPLIER,
    FIELD_EVIDENCE_TEMPORAL_CHANGE_MULTIPLIER,
    CORROBORATING_OBSERVATIONS,
    SOURCE_RELIABILITY
)

def calculate_field_evidence_score(data: FieldIntelligenceInput) -> Tuple[float, float, Dict[str, Any]]:
    """
    Translates heuristic SLM field intelligence signals into a numerical field evidence score.
    Returns: (score, reliability, metadata)
    Note: This is NOT a calibrated probability model. It is a decision support heuristic.
    """
    # 1. Base severity score
    severity = (data.severity or "low").lower()
    base_score = FIELD_EVIDENCE_SEVERITY_MAPPING.get(severity, 0.3)
    
    # 2. Urgency multiplier
    urgency = (data.urgency or "routine").lower()
    urgency_mult = FIELD_EVIDENCE_URGENCY_MULTIPLIER.get(urgency, 1.0)
    
    # 3. Temporal change multiplier
    temp_change = (data.temporal_change or "stable").lower()
    temp_mult = FIELD_EVIDENCE_TEMPORAL_CHANGE_MULTIPLIER.get(temp_change, 1.0)
    
    # 4. Observation bonuses
    obs_bonus = 0.0
    for obs in data.observations:
        if obs in CORROBORATING_OBSERVATIONS:
            obs_bonus += CORROBORATING_OBSERVATIONS[obs]
    
    # Calculate initial score
    raw_score = (base_score * urgency_mult * temp_mult) + obs_bonus
    
    # Cap at 1.0
    final_score = min(max(raw_score, 0.0), 1.0)
    
    # Reliability
    # Use extraction confidence if provided, otherwise default base reliability
    reliability = data.hazard_confidence if data.hazard_confidence is not None else SOURCE_RELIABILITY["field_intelligence"]
    
    metadata = {
        "base_severity_score": base_score,
        "urgency_multiplier": urgency_mult,
        "temporal_change_multiplier": temp_mult,
        "observation_bonus": obs_bonus,
        "is_worsening": temp_change in ["worsening", "rapidly_worsening"]
    }
    
    return final_score, reliability, metadata
