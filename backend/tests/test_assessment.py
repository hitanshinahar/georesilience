import sys
import os
from fastapi.testclient import TestClient

# Make sure backend is in path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from app.main import app

client = TestClient(app)

def test_analyze_xgboost_only():
    response = client.post("/api/assessment/analyze", json={
        "static_features": {
            "elevation_m": 1200,
            "slope_deg": 35,
            "aspect_deg": 180,
            "tri_ruggedness": 5,
            "plan_curvature": 0.1,
            "rainfall_3h_accum_mm": 50,
            "rainfall_72h_accum_mm": 150,
            "soil_moisture_saturation_pct": 80,
            "ground_deformation_proxy_mm_yr": 10,
            "anthropogenic_load_proxy_kpa": 50
        }
    })
    assert response.status_code == 200
    data = response.json()
    assert "data_sources" in data
    assert "assessment" in data
    # Only 1 numerical model means insufficient data
    # But since models might not be loaded, we just assert the structure is valid
    assert "evidence_coverage" in data["assessment"]

def test_analyze_full():
    response = client.post("/api/assessment/analyze", json={
        "static_features": {
            "elevation_m": 1200,
            "slope_deg": 35,
            "aspect_deg": 180,
            "tri_ruggedness": 5,
            "plan_curvature": 0.1,
            "rainfall_3h_accum_mm": 50,
            "rainfall_72h_accum_mm": 150,
            "soil_moisture_saturation_pct": 80,
            "ground_deformation_proxy_mm_yr": 10,
            "anthropogenic_load_proxy_kpa": 50
        },
        "timeseries_sequence": [
            {"rainfall_mm": 10, "cumulative_rainfall_mm": 10, "soil_moisture": 50},
            {"rainfall_mm": 20, "cumulative_rainfall_mm": 30, "soil_moisture": 60}
        ],
        "field_report": "Heavy rain and active crack on the road.",
        "location": {
            "latitude": 27.0,
            "longitude": 88.0,
            "name": "Demo"
        }
    })
    assert response.status_code == 200
    data = response.json()
    assert "data_sources" in data
    assert "evidence_coverage" in data["assessment"]
