from typing import Dict, List, Tuple
from .schemas import EvidenceSource
from .config import AGREEMENT_THRESHOLDS

def calculate_model_agreement(sources: Dict[str, EvidenceSource]) -> Tuple[str, bool]:
    """
    Calculates agreement (spread) across available numerical risk-producing models.
    Returns: (agreement_level, requires_human_review)
    """
    numerical_sources = ["xgboost", "lstm", "transformer"]
    
    available_scores = [
        sources[src].risk_score for src in numerical_sources
        if src in sources and sources[src].available
    ]
    
    if len(available_scores) < 2:
        return "insufficient_data", True # Trigger review if we lack multiple models to compare
        
    spread = max(available_scores) - min(available_scores)
    
    if spread <= AGREEMENT_THRESHOLDS["high"]:
        return "high", False
    elif spread <= AGREEMENT_THRESHOLDS["medium"]:
        return "medium", False
    else:
        return "low", True # High disagreement triggers review
