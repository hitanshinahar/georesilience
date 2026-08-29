import sys
import os
import pytest
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_live_mapped_request():
    payload = {
        "elevation_m": 1000.0,
        "slope_deg": 44.5,
        "aspect_deg": 180.0,
        "tri_ruggedness": 50.0,
        "plan_curvature": 0.1,
        "rainfall_3h_accum_mm": 30.0,
        "rainfall_72h_accum_mm": 90.0,
        "soil_moisture_saturation_pct": 65.0,
        "ground_deformation_proxy_mm_yr": -4.2,
        "anthropogenic_load_proxy_kpa": 10.0
    }
    response = client.post("/api/risk/predict", json=payload)
    assert response.status_code == 200, f"Expected 200, got {response.status_code}. Response: {response.text}"
    data = response.json()
    assert "risk_score" in data
    assert "risk_tier" in data
    assert "static_susceptibility_score" in data
    assert "top_contributing_factors" in data
    assert "provenance" in data

def test_missing_required_feature():
    payload = {
        "elevation_m": 1000.0,
        "slope_deg": 44.5
        # Missing other required features
    }
    response = client.post("/api/risk/predict", json=payload)
    assert response.status_code == 422, f"Expected 422 validation error, got {response.status_code}"

def test_dynamic_prediction():
    payload1 = {
        "elevation_m": 1000.0,
        "slope_deg": 44.5,
        "aspect_deg": 180.0,
        "tri_ruggedness": 50.0,
        "plan_curvature": 0.1,
        "rainfall_3h_accum_mm": 30.0,
        "rainfall_72h_accum_mm": 90.0,
        "soil_moisture_saturation_pct": 65.0,
        "ground_deformation_proxy_mm_yr": -4.2,
        "anthropogenic_load_proxy_kpa": 10.0
    }
    response1 = client.post("/api/risk/predict", json=payload1)
    assert response1.status_code == 200
    
    payload2 = dict(payload1)
    payload2["slope_deg"] = 10.0 # significant difference in slope
    
    response2 = client.post("/api/risk/predict", json=payload2)
    assert response2.status_code == 200
    
    data1 = response1.json()
    data2 = response2.json()
    
    assert data1["risk_score"] != data2["risk_score"] or data1["static_susceptibility_score"] != data2["static_susceptibility_score"]

def test_response_contract():
    payload = {
        "elevation_m": 1000.0,
        "slope_deg": 44.5,
        "aspect_deg": 180.0,
        "tri_ruggedness": 50.0,
        "plan_curvature": 0.1,
        "rainfall_3h_accum_mm": 30.0,
        "rainfall_72h_accum_mm": 90.0,
        "soil_moisture_saturation_pct": 65.0,
        "ground_deformation_proxy_mm_yr": -4.2,
        "anthropogenic_load_proxy_kpa": 10.0
    }
    response = client.post("/api/risk/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    
    # Verify contract
    assert "static_susceptibility_score" in data
    assert "risk_tier" in data
    assert "top_contributing_factors" in data
    assert "provenance" in data
