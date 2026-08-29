import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from app.main import app
from app.core.database import init_db
from ml.models.slm.predictor import deterministic_rule_fallback
from ml.models.slm.schemas import HazardIntelligence, HazardTypeEnum, SeverityEnum, UrgencyEnum

client = TestClient(app)

def setup_module():
    init_db()

def test_1_qwen_unknown_critical_override():
    """
    TEST 1:
    Qwen returns unknown/low/monitor for critical report.
    Expected: overridden to road_blockage, critical, immediate, deterministic_rule_fallback.
    """
    report_text = "Massive mudslide near NH-10. Road completely blocked. Vehicles stranded and houses at risk."
    
    # Direct fallback test
    fallback = deterministic_rule_fallback(report_text)
    assert fallback["hazard_type"] == "road_blockage"
    assert fallback["severity"] == "critical"
    assert fallback["urgency"] == "immediate"
    assert fallback["provenance"] == "deterministic_rule_fallback"

    # Simulated Qwen weak output override
    mock_slm = MagicMock()
    mock_slm.analyze.return_value = {
        "hazard_type": "unknown",
        "hazard_confidence": 0.2,
        "severity": "low",
        "urgency": "monitor",
        "observations": [],
        "provenance": "qwen_slm"
    }

    from app.services.report_service import create_report
    res = create_report({
        "report_text": report_text,
        "latitude": 27.32,
        "longitude": 88.62,
        "reporter_type": "field_officer"
    }, slm_predictor=mock_slm)

    assert res["slm_analysis"]["hazard_type"] == "road_blockage"
    assert res["slm_analysis"]["severity"] == "critical"
    assert res["slm_analysis"]["urgency"] == "immediate"
    assert res["linked_incident_id"] is not None


def test_2_minor_crack_no_escalation():
    """
    TEST 2:
    Input: 'Small crack observed on retaining wall. No road obstruction.'
    Expected: DO NOT escalate to a critical road-blockage incident.
    """
    report_text = "Small crack observed on retaining wall. No road obstruction."
    fallback = deterministic_rule_fallback(report_text)
    assert fallback["hazard_type"] == "slope_crack"
    assert fallback["severity"] in ["low", "medium"]
    assert fallback["urgency"] == "monitor"

    from app.services.report_service import create_report
    res = create_report({
        "report_text": report_text,
        "latitude": 27.25,
        "longitude": 88.55,
        "reporter_type": "citizen"
    })
    assert res["linked_incident_id"] is None


def test_3_risk_prediction_with_valid_moisture():
    """
    TEST 3:
    Valid soil moisture and rainfall -> HTTP 200.
    """
    payload = {
        "elevation_m": 1000.0,
        "aspect_deg": 180.0,
        "slope_deg": 35.0,
        "tri_ruggedness": 50.0,
        "plan_curvature": 0.1,
        "soil_moisture_saturation_pct": 75.0,
        "rainfall_3h_accum_mm": 25.0,
        "rainfall_72h_accum_mm": 80.0,
        "ground_deformation_proxy_mm_yr": -4.2,
        "anthropogenic_load_proxy_kpa": 10.0
    }
    response = client.post("/api/risk/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "risk_score" in data
    assert "factor_of_safety" in data
    assert len(data.get("top_contributing_factors", [])) > 0


def test_4_risk_prediction_null_moisture_rejected_defensively():
    """
    TEST 4:
    Passing null soil moisture directly to risk predict must be rejected (422),
    verifying backend Pydantic validation is intact.
    """
    payload = {
        "elevation_m": 1000.0,
        "aspect_deg": 180.0,
        "slope_deg": 35.0,
        "tri_ruggedness": 50.0,
        "plan_curvature": 0.1,
        "soil_moisture_saturation_pct": None, # Explicitly null
        "rainfall_3h_accum_mm": 25.0,
        "rainfall_72h_accum_mm": 80.0,
        "ground_deformation_proxy_mm_yr": -4.2,
        "anthropogenic_load_proxy_kpa": 10.0
    }
    response = client.post("/api/risk/predict", json=payload)
    assert response.status_code == 422


def test_5_full_pipeline_report_incident_alert_routing():
    """
    TEST 5:
    Full pipeline:
    report -> incident -> alert -> active incident -> A* route avoids blocked NH-10.
    """
    # 1. Submit critical road blockage report
    report_payload = {
        "report_text": "Massive mudslide near NH-10. Road completely blocked. Vehicles stranded and houses at risk.",
        "latitude": 27.33,
        "longitude": 88.61, # on j1 -> threat_mid
        "reporter_type": "field_officer"
    }
    r_res = client.post("/api/reports", json=report_payload)
    assert r_res.status_code == 200
    r_data = r_res.json()
    inc_id = r_data["linked_incident_id"]
    assert inc_id is not None

    # 2. Verify Incident exists and is active (UNDER_REVIEW or OPEN)
    inc_res = client.get(f"/api/incidents/{inc_id}")
    assert inc_res.status_code == 200
    inc_data = inc_res.json()
    assert inc_data["status"] in ["OPEN", "UNDER_REVIEW"]
    assert inc_data["assessment_data"]["hazard_type"] == "road_blockage"

    # 3. Verify Alert generated
    alt_res = client.get("/api/alerts")
    assert alt_res.status_code == 200
    alerts = alt_res.json()
    assert any(a["incident_id"] == inc_id for a in alerts)

    # 4. Request A* route from Origin to South Exit
    route_payload = {
        "origin": {"lat": 27.38, "lon": 88.58}, # origin
        "destination": {"lat": 27.30, "lon": 88.59, "khasra_id": "104/A"}, # j2
        "risk_context": {
            "risk_score": 10.0,
            "risk_level": "GREEN",
            "factor_of_safety": 1.5,
            "inundation_area_km2": 0.0
        }
    }
    route_res = client.post("/api/routing/astar", json=route_payload)
    assert route_res.status_code == 200
    route_data = route_res.json()

    assert route_data["status"] == "ROUTE_FOUND"
    assert route_data["reason"] == "ROAD BLOCKED — FIELD REPORT"
    # Verify threatened midpoint (27.32, 88.62) is avoided and alternate route taken
    route_lats = [pt["lat"] for pt in route_data["route"]]
    assert 27.32 not in route_lats
