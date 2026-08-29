import sys
import os
import pytest

# Ensure project and backend directories are in sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from ml.models.slm.schemas import (
    safe_extract_json,
    HazardIntelligence,
    HazardTypeEnum,
    SeverityEnum,
    UrgencyEnum,
    TemporalChangeEnum
)


# ==========================================
# 1. HAZARD TYPE NORMALIZATION TESTS
# ==========================================

def test_hazard_type_rockfall():
    for phrase in ["falling rocks", "rocks blocking the road", "boulders", "rockfall", "rock fall"]:
        res = safe_extract_json(f'{{"hazard_type": "{phrase}"}}')
        assert res["hazard_type"] == "rockfall", f"Failed for {phrase}"


def test_hazard_type_landslide():
    for phrase in ["sliding mud", "moving soil", "soil movement", "mudslide", "landslide", "slide", "earth movement"]:
        res = safe_extract_json(f'{{"hazard_type": "{phrase}"}}')
        assert res["hazard_type"] == "landslide", f"Failed for {phrase}"


def test_hazard_type_slope_crack():
    for phrase in ["large crack on the slope", "ground crack", "fracture", "slope fracture", "slope_crack"]:
        res = safe_extract_json(f'{{"hazard_type": "{phrase}"}}')
        assert res["hazard_type"] == "slope_crack", f"Failed for {phrase}"


def test_hazard_type_seepage():
    for phrase in ["water seeping through the hillside", "water leaking from slope", "wet ground", "seepage", "water seep"]:
        res = safe_extract_json(f'{{"hazard_type": "{phrase}"}}')
        assert res["hazard_type"] == "seepage", f"Failed for {phrase}"


def test_hazard_type_debris_flow():
    for phrase in ["debris flow", "debris", "debris_flow"]:
        res = safe_extract_json(f'{{"hazard_type": "{phrase}"}}')
        assert res["hazard_type"] == "debris_flow", f"Failed for {phrase}"


def test_hazard_type_road_blockage():
    for phrase in ["road block", "road is blocked", "blocked", "road blockage"]:
        res = safe_extract_json(f'{{"hazard_type": "{phrase}"}}')
        assert res["hazard_type"] == "road_blockage", f"Failed for {phrase}"


def test_hazard_type_flooding():
    for phrase in ["flood", "flooding", "flash flood"]:
        res = safe_extract_json(f'{{"hazard_type": "{phrase}"}}')
        assert res["hazard_type"] == "flooding", f"Failed for {phrase}"


def test_hazard_type_erosion():
    for phrase in ["erosion", "soil erosion"]:
        res = safe_extract_json(f'{{"hazard_type": "{phrase}"}}')
        assert res["hazard_type"] == "erosion", f"Failed for {phrase}"


def test_hazard_type_unknown_fallback():
    for phrase in ["aliens", "slam", "unknown", "random gibberish", ""]:
        res = safe_extract_json(f'{{"hazard_type": "{phrase}"}}')
        assert res["hazard_type"] == "unknown", f"Failed for {phrase}"


# ==========================================
# 2. SEVERITY NORMALIZATION TESTS
# ==========================================

def test_severity_normalization():
    # Critical
    for s in ["extreme", "severe", "catastrophic", "dangerous", "critical", "CRITICAL", "Extreme"]:
        res = safe_extract_json(f'{{"severity": "{s}"}}')
        assert res["severity"] == "critical", f"Failed for {s}"

    # High
    for s in ["elevated", "high_risk", "high", "HIGH", "High_Risk"]:
        res = safe_extract_json(f'{{"severity": "{s}"}}')
        assert res["severity"] == "high", f"Failed for {s}"

    # Medium
    for s in ["moderate", "medium_risk", "medium", "MEDIUM"]:
        res = safe_extract_json(f'{{"severity": "{s}"}}')
        assert res["severity"] == "medium", f"Failed for {s}"

    # Low / Default
    for s in ["low", "minor", "minimal", "unknown_severity", ""]:
        res = safe_extract_json(f'{{"severity": "{s}"}}')
        assert res["severity"] == "low", f"Failed for {s}"


# ==========================================
# 3. URGENCY NORMALIZATION TESTS
# ==========================================

def test_urgency_normalization():
    # Immediate
    for u in ["urgent", "critical", "high", "asap", "emergency", "immediate", "IMMEDIATE", "Emergency"]:
        res = safe_extract_json(f'{{"urgency": "{u}"}}')
        assert res["urgency"] == "immediate", f"Failed for {u}"

    # Inspect
    for u in ["investigate", "check", "inspect", "INSPECT"]:
        res = safe_extract_json(f'{{"urgency": "{u}"}}')
        assert res["urgency"] == "inspect", f"Failed for {u}"

    # Monitor / Default
    for u in ["monitor", "routine", "low", "unrecognized_urgency", ""]:
        res = safe_extract_json(f'{{"urgency": "{u}"}}')
        assert res["urgency"] == "monitor", f"Failed for {u}"


# ==========================================
# 4. TEMPORAL CHANGE NORMALIZATION TESTS
# ==========================================

def test_temporal_change_normalization():
    # Worsening
    for t in ["worsening", "escalating", "deteriorating", "increasing", "getting worse", "WORSENING"]:
        res = safe_extract_json(f'{{"temporal_change": "{t}"}}')
        assert res["temporal_change"] == "worsening", f"Failed for {t}"

    # Improving
    for t in ["improving", "decreasing", "receding", "better", "IMPROVING"]:
        res = safe_extract_json(f'{{"temporal_change": "{t}"}}')
        assert res["temporal_change"] == "improving", f"Failed for {t}"

    # Stable
    for t in ["stable", "unchanged", "no change", "steady", "STABLE"]:
        res = safe_extract_json(f'{{"temporal_change": "{t}"}}')
        assert res["temporal_change"] == "stable", f"Failed for {t}"

    # Unknown
    for t in ["unknown", "other", ""]:
        res = safe_extract_json(f'{{"temporal_change": "{t}"}}')
        assert res["temporal_change"] == "unknown", f"Failed for {t}"


# ==========================================
# 5. MARKDOWN FENCES & SURROUNDING TEXT TESTS
# ==========================================

def test_markdown_json_fences():
    text = """```json
    {
        "hazard_type": "falling rocks",
        "severity": "extreme",
        "urgency": "asap",
        "temporal_change": "worsening"
    }
    ```"""
    data = safe_extract_json(text)
    assert data["hazard_type"] == "rockfall"
    assert data["severity"] == "critical"
    assert data["urgency"] == "immediate"
    assert data["temporal_change"] == "worsening"


def test_markdown_fences_without_language_tag():
    text = """```
    {
        "hazard_type": "ground crack",
        "severity": "elevated",
        "urgency": "investigate"
    }
    ```"""
    data = safe_extract_json(text)
    assert data["hazard_type"] == "slope_crack"
    assert data["severity"] == "high"
    assert data["urgency"] == "inspect"


def test_surrounding_conversational_text():
    text = """
    Certainly! Based on the field observations provided in the report, here is the structured JSON output:
    
    {
        "hazard_type": "sliding mud",
        "hazard_confidence": 0.85,
        "severity": "severe",
        "urgency": "emergency",
        "observations": ["heavy mudflow", "cracks expanding"],
        "temporal_change": "escalating",
        "recommended_action": "evacuate_zone"
    }
    
    Please let me know if you need additional hazard analysis.
    """
    data = safe_extract_json(text)
    assert data["hazard_type"] == "landslide"
    assert data["hazard_confidence"] == 0.85
    assert data["severity"] == "critical"
    assert data["urgency"] == "immediate"
    assert data["temporal_change"] == "worsening"
    assert data["observations"] == ["heavy mudflow", "cracks expanding"]
    assert data["recommended_action"] == "evacuate_zone"


def test_nested_quotes_and_escapes():
    text = r'{"hazard_type": "rockfall", "observations": ["boulders \"size of cars\"", "debris"]}'
    data = safe_extract_json(text)
    assert data["hazard_type"] == "rockfall"
    assert len(data["observations"]) == 2


# ==========================================
# 6. INVALID JSON / ERROR HANDLING TESTS
# ==========================================

def test_invalid_json_raises_value_error():
    with pytest.raises(ValueError):
        safe_extract_json("This is pure natural language with no JSON structure at all.")


def test_empty_string_raises_value_error():
    with pytest.raises(ValueError):
        safe_extract_json("")


def test_malformed_unclosed_json_raises_value_error():
    with pytest.raises(ValueError):
        safe_extract_json('{"hazard_type": "landslide", "severity": ')


# ==========================================
# 7. PYDANTIC SCHEMA INTEGRATION
# ==========================================

def test_hazard_intelligence_model_validation():
    raw_json = """{
        "hazard_type": "falling rocks",
        "hazard_confidence": 0.95,
        "severity": "severe",
        "urgency": "immediate",
        "observations": ["road partially blocked"],
        "temporal_change": "worsening",
        "recommended_action": "clear_road"
    }"""
    extracted = safe_extract_json(raw_json)
    model = HazardIntelligence(**extracted)

    assert model.hazard_type == HazardTypeEnum.rockfall
    assert model.severity == SeverityEnum.critical
    assert model.urgency == UrgencyEnum.immediate
    assert model.temporal_change == TemporalChangeEnum.worsening
    assert model.hazard_confidence == 0.95
    assert model.model_available is True
