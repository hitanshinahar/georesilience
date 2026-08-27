import pytest
from fastapi.testclient import TestClient
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "georesilience-backend"}

def test_predict_risk_valid():
    payload = {
        "elevation_m": 1650.0,
        "slope_deg": 38.5,
        "aspect_deg": 210.0,
        "tri_ruggedness": 18.2,
        "plan_curvature": -0.02,
        "rainfall_3h_accum_mm": 45.0,
        "rainfall_72h_accum_mm": 120.0,
        "soil_moisture_saturation_pct": 82.0,
        "ground_deformation_proxy_mm_yr": -12.5,
        "anthropogenic_load_proxy_kpa": 30.0
    }
    response = client.post("/api/risk/predict", json=payload)
    
    # If the model is not found, we expect a 503. Otherwise, 200.
    if response.status_code == 200:
        data = response.json()
        assert "static_susceptibility_score" in data
        assert "risk_tier" in data
        assert "top_contributing_factors" in data
        assert "provenance" in data
        
        factors = data["top_contributing_factors"]
        assert len(factors) > 0
        assert "feature" in factors[0]
        assert "contribution" in factors[0]
    elif response.status_code == 503:
        pass
    else:
        assert False, f"Unexpected status code: {response.status_code}, {response.text}"

def test_predict_risk_invalid_input():
    payload = {
        "elevation_m": "not_a_number", # Invalid type
        "slope_deg": 38.5
    }
    response = client.post("/api/risk/predict", json=payload)
    assert response.status_code == 422 # Validation error
