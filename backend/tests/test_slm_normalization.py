import pytest
from ml.models.slm.schemas import safe_extract_json

def test_slm_hazard_type_normalization():
    # Test rocks / rockfall
    assert safe_extract_json('{"hazard_type": "falling rocks"}')["hazard_type"] == "rockfall"
    assert safe_extract_json('{"hazard_type": "rocks blocking the road"}')["hazard_type"] == "rockfall"
    assert safe_extract_json('{"hazard_type": "boulders"}')["hazard_type"] == "rockfall"

    # Test sliding / landslide
    assert safe_extract_json('{"hazard_type": "sliding mud"}')["hazard_type"] == "landslide"
    assert safe_extract_json('{"hazard_type": "moving soil"}')["hazard_type"] == "landslide"
    assert safe_extract_json('{"hazard_type": "soil movement"}')["hazard_type"] == "landslide"

    # Test crack / slope_crack
    assert safe_extract_json('{"hazard_type": "large crack on the slope"}')["hazard_type"] == "slope_crack"
    assert safe_extract_json('{"hazard_type": "ground crack"}')["hazard_type"] == "slope_crack"

    # Test seepage
    assert safe_extract_json('{"hazard_type": "water seeping through the hillside"}')["hazard_type"] == "seepage"
    assert safe_extract_json('{"hazard_type": "water leaking from slope"}')["hazard_type"] == "seepage"
    assert safe_extract_json('{"hazard_type": "wet ground"}')["hazard_type"] == "seepage"

def test_slm_normalization_unknown_fallback():
    # It should pass through unknown strings; they will be caught by Pydantic validation later if unsupported
    assert safe_extract_json('{"hazard_type": "aliens"}')["hazard_type"] == "aliens"

def test_slm_normalization_severity():
    assert safe_extract_json('{"severity": "severe"}')["severity"] == "critical"
    assert safe_extract_json('{"severity": "dangerous"}')["severity"] == "critical"
    assert safe_extract_json('{"severity": "elevated"}')["severity"] == "high"

def test_slm_normalization_markdown_fences():
    text = """```json
    {
        "hazard_type": "falling rocks",
        "severity": "extreme"
    }
    ```"""
    data = safe_extract_json(text)
    assert data["hazard_type"] == "rockfall"
    assert data["severity"] == "critical"
