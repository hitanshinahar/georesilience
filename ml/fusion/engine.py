from typing import Dict, Any, List
from .schemas import FusionRequest, FusionResponse
from .normalizer import normalize_evidence
from .agreement import calculate_model_agreement
from .confidence import calculate_fusion_weights_and_confidence
from .config import RISK_THRESHOLDS, get_recommended_action

def get_risk_level(score: float) -> str:
    if score > RISK_THRESHOLDS["RED"]:
        return "RED"
    elif score > RISK_THRESHOLDS["ORANGE"]:
        return "ORANGE"
    elif score > RISK_THRESHOLDS["YELLOW"]:
        return "YELLOW"
    return "GREEN"

def fuse_risk_assessments(request: FusionRequest) -> FusionResponse:
    # 1. Normalize Evidence
    sources = normalize_evidence(request)
    
    # 2. Check Agreement (numerical models only)
    agreement, requires_review_from_agreement = calculate_model_agreement(sources)
    
    # 3. Calculate weights and fusion confidence
    weights, fusion_confidence = calculate_fusion_weights_and_confidence(sources)
    
    # 4. Compute weighted final score
    final_score = 0.0
    for src_name, weight in weights.items():
        if weight > 0:
            final_score += sources[src_name].risk_score * weight
            
    # Cap score
    final_score = min(max(final_score, 0.0), 1.0)
    
    # 5. Risk Level
    risk_level = get_risk_level(final_score)
    
    # 6. Action Recommendation Logic
    has_worsening_field_evidence = False
    if sources["field_intelligence"].available:
        meta = sources["field_intelligence"].metadata
        has_worsening_field_evidence = meta.get("is_worsening", False)
        
    requires_review = requires_review_from_agreement
    if not requires_review and sources["field_intelligence"].available:
        # Trigger review if severe field evidence but numerical models are low
        numerical_scores = [sources[s].risk_score for s in ["xgboost", "lstm", "transformer"] if sources.get(s) and sources[s].available]
        if numerical_scores:
            avg_num_score = sum(numerical_scores) / len(numerical_scores)
            if sources["field_intelligence"].risk_score > 0.8 and avg_num_score < 0.6:
                requires_review = True
            
    recommended_action = get_recommended_action(
        risk_level=risk_level,
        agreement=agreement,
        has_worsening_field_evidence=has_worsening_field_evidence,
        requires_human_review=requires_review
    )
    
    # 7. Construct Contributing Factors
    factors = []
    for src_name, src_data in sources.items():
        if src_data.available and weights.get(src_name, 0.0) > 0.0:
            factor = {
                "source": src_name,
                "risk_score_contribution": round(src_data.risk_score * weights[src_name], 3),
                "raw_score": round(src_data.risk_score, 3),
                "weight": round(weights[src_name], 3)
            }
            if src_name == "field_intelligence":
                factor["heuristic_metadata"] = src_data.metadata
            factors.append(factor)
            
    # 8. Source Availability Map
    availability_map = {name: data.available for name, data in sources.items()}
    
    return FusionResponse(
        final_risk_score=round(final_score, 3),
        risk_level=risk_level,
        confidence=round(fusion_confidence, 3),
        model_agreement=agreement,
        requires_human_review=requires_review,
        recommended_action=recommended_action,
        source_availability=availability_map,
        contributing_factors=factors
    )
