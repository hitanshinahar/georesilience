"""
Configuration for the Confidence-Aware Risk Fusion Engine.
Contains prototype decision thresholds, weights, and mappings.
Values are not scientifically calibrated and serve as prototype guidelines.
"""

# Base importance weights for different sources
# These determine how much influence a source has if all sources are perfectly reliable and available.
SOURCE_IMPORTANCE = {
    "xgboost": 0.35,      # Static terrain/environmental risk
    "lstm": 0.25,         # Temporal risk
    "transformer": 0.25,  # Temporal risk (alternate architecture)
    "field_intelligence": 0.15 # Heuristic field evidence (acts as corroborative/escalation factor)
}

# Source Reliability Factors (Not calibrated probabilities)
# These represent our prototype-defined confidence in the source's general reliability
SOURCE_RELIABILITY = {
    "xgboost": 0.85,
    "lstm": 0.82,
    "transformer": 0.86,
    "field_intelligence": 0.80 # Default base reliability for field intelligence if extraction confidence is missing
}

# Risk Thresholds
# Prototype decision boundaries for mapping numerical risk (0.0 to 1.0) to categorical levels
RISK_THRESHOLDS = {
    "YELLOW": 0.35, # 0.0 to 0.35 is GREEN
    "ORANGE": 0.65, # 0.35 to 0.65 is YELLOW
    "RED": 0.85     # 0.65 to 0.85 is ORANGE, >0.85 is RED
}

# Agreement Thresholds for Numerical Models
# Measures the maximum spread (max - min) between available numerical model risk scores
AGREEMENT_THRESHOLDS = {
    "high": 0.10,    # Spread <= 0.10 means high agreement
    "medium": 0.25   # Spread <= 0.25 means medium agreement, >0.25 means low agreement
}

# Field Evidence Mapping Heuristics
# Maps qualitative SLM outputs to numerical evidence scores (not probabilities of landslide occurrence)
FIELD_EVIDENCE_SEVERITY_MAPPING = {
    "low": 0.3,
    "medium": 0.6,
    "high": 0.9,
    "critical": 1.0
}

FIELD_EVIDENCE_URGENCY_MULTIPLIER = {
    "routine": 1.0,
    "monitor": 1.1,
    "inspect": 1.2,
    "immediate": 1.3
}

FIELD_EVIDENCE_TEMPORAL_CHANGE_MULTIPLIER = {
    "stable": 1.0,
    "improving": 0.8,
    "worsening": 1.2,
    "rapidly_worsening": 1.5
}

# High-value observations that strongly corroborate environmental risk
CORROBORATING_OBSERVATIONS = {
    "new_ground_crack": 0.1,
    "water_seepage": 0.1,
    "slope_movement": 0.15,
    "debris_flow": 0.2,
    "active_landslide": 0.3,
    "road_blockage": 0.05
}

# Action Recommendations Logic
# Matrix defining recommendations based on Risk Level and Agreement/Field Evidence
# This is a decision support heuristic.
def get_recommended_action(risk_level: str, agreement: str, has_worsening_field_evidence: bool, requires_human_review: bool) -> str:
    if requires_human_review:
        if risk_level in ["ORANGE", "RED"]:
            return "field_inspection"
        return "human_review"

    if risk_level == "RED":
        return "emergency_response"
    elif risk_level == "ORANGE":
        if has_worsening_field_evidence or agreement == "low":
            return "field_inspection"
        return "increased_monitoring"
    elif risk_level == "YELLOW":
        if has_worsening_field_evidence:
            return "field_inspection"
        return "increased_monitoring"
    else: # GREEN
        if has_worsening_field_evidence:
            return "increased_monitoring"
        return "continue_monitoring"
