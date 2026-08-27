from typing import Dict, Tuple
from .schemas import EvidenceSource
from .config import SOURCE_IMPORTANCE

def calculate_fusion_weights_and_coverage(sources: Dict[str, EvidenceSource]) -> Tuple[Dict[str, float], float]:
    """
    Calculates normalized effective weights for all available sources and an overall evidence coverage.
    effective_weight = base_importance * reliability_factor * availability
    
    Returns: (normalized_weights_dict, evidence_coverage)
    """
    effective_weights = {}
    total_effective_weight = 0.0
    
    # Calculate unnormalized effective weights for available sources
    for src_name, src_data in sources.items():
        if src_data.available:
            base_w = SOURCE_IMPORTANCE.get(src_name, 0.0)
            eff_w = base_w * src_data.reliability_factor
            effective_weights[src_name] = eff_w
            total_effective_weight += eff_w
        else:
            effective_weights[src_name] = 0.0
            
    # Normalize weights so they sum to 1.0 (among available sources)
    normalized_weights = {}
    if total_effective_weight > 0:
        for src_name, eff_w in effective_weights.items():
            normalized_weights[src_name] = eff_w / total_effective_weight
    else:
        # If no sources have weight, return 0 for all
        for src_name in sources.keys():
            normalized_weights[src_name] = 0.0
            
    # Calculate evidence coverage.
    # This is roughly the sum of effective weights compared to the theoretical max if all sources were 1.0 reliable.
    max_possible_weight = sum(SOURCE_IMPORTANCE.values())
    evidence_coverage = total_effective_weight / max_possible_weight if max_possible_weight > 0 else 0.0
    evidence_coverage = min(max(evidence_coverage, 0.0), 1.0)
    
    return normalized_weights, evidence_coverage
