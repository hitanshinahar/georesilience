import pytest
from ml.models.slm.schemas import safe_extract_json, HazardIntelligence
from ml.models.slm.predictor import deterministic_rule_fallback
from app.services.report_service import _should_create_incident
from app.services import report_service, incident_service, alert_service
from app.routers import report_router
from fastapi.testclient import TestClient
from app.main import app

# Force deterministic fallback for pipeline tests to avoid LLM variability
report_router.slm_predictor = None

client = TestClient(app)

def test_invalid_enum_normalization():
    # Simulate SLM outputting an invalid hazard_type
    bad_output = '{"hazard_type": "slam", "severity": "critical", "urgency": "immediate"}'
    extracted = safe_extract_json(bad_output)
    assert extracted["hazard_type"] == "unknown"
    assert extracted["severity"] == "critical"
    
    # Simulate SLM outputting a synonym
    synonym_output = '{"hazard_type": "mudslide", "severity": "high", "urgency": "immediate"}'
    extracted2 = safe_extract_json(synonym_output)
    assert extracted2["hazard_type"] == "landslide"

def test_deterministic_rule_fallback_trigger():
    # Simulate complete failure of extraction (fallback called manually in predictor on except)
    critical_text = "Massive mudslide near NH-10. Road completely blocked. Vehicles stranded and houses at risk."
    fallback = deterministic_rule_fallback(critical_text)
    
    assert fallback["hazard_type"] == "landslide"
    assert fallback["severity"] == "critical"
    assert fallback["urgency"] == "immediate"
    assert fallback["provenance"] == "deterministic_rule_fallback"
    
def test_non_critical_report():
    text = "Small crack observed on retaining wall. No road obstruction."
    fallback = deterministic_rule_fallback(text)
    
    # Handle both string and Enum returns (depending on Pydantic version/mode)
    ht = fallback["hazard_type"]
    ht_val = ht.value if hasattr(ht, "value") else ht
    assert ht_val == "slope_crack"
    
    sev = fallback["severity"]
    sev_val = sev.value if hasattr(sev, "value") else sev
    assert sev_val == "low"
    
    urg = fallback["urgency"]
    urg_val = urg.value if hasattr(urg, "value") else urg
    assert urg_val == "monitor"

def test_incident_escalation_rules():
    # Test our new escalation rules logic
    assert _should_create_incident({"severity": "critical", "urgency": "immediate", "hazard_type": "unknown"}) == True
    assert _should_create_incident({"severity": "high", "urgency": "immediate", "hazard_type": "unknown"}) == True
    assert _should_create_incident({"severity": "high", "urgency": "inspect", "hazard_type": "landslide"}) == False
    assert _should_create_incident({"severity": "low", "urgency": "monitor", "hazard_type": "road_blockage"}) == True
    assert _should_create_incident({"severity": "low", "urgency": "monitor", "hazard_type": "landslide"}) == False

import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_full_critical_report_and_deduplication():
    # Submit a critical report with random coordinates to avoid DB collision
    import random
    lat = 27.0 + random.random()
    lon = 88.0 + random.random()
    payload = {
        "report_text": "Massive mudslide near NH-10. Road completely blocked. Vehicles stranded and houses at risk.",
        "latitude": lat,
        "longitude": lon,
        "location_name": "NH-10 Critical",
        "reporter_type": "field_officer"
    }
    
    # 1. First submission
    response = client.post("/api/reports", json=payload)
    assert response.status_code == 200
    report_id_1 = response.json()["report_id"]
    
    # Check that exactly one incident was created for this area recently
    inc_response = client.get("/api/incidents")
    incidents = inc_response.json()
    assert len(incidents) >= 1
    
    # Find the incident linked to this report
    incident = next(inc for inc in incidents if report_id_1 in inc["linked_report_ids"])
    assert incident["status"] == "OPEN" or incident["status"] == "UNDER_REVIEW"
    assert incident["risk_level"] == "RED" # From critical severity
    incident_id = incident["incident_id"]
    
    # Check that exactly one alert was created
    alert_response = client.get("/api/alerts")
    alerts = alert_response.json()
    my_alerts = [a for a in alerts if a["incident_id"] == incident_id]
    assert len(my_alerts) == 1
    assert my_alerts[0]["severity"] == "RED"
    
    # 2. Duplicate submission (retry of the exact same report text/location)
    response2 = client.post("/api/reports", json=payload)
    assert response2.status_code == 200
    report_id_2 = response2.json()["report_id"]
    
    # Check incidents again
    inc_response2 = client.get("/api/incidents")
    incidents2 = inc_response2.json()
    incident_after_retry = next(inc for inc in incidents2 if incident_id == inc["incident_id"])
    
    # The incident should now have both reports linked
    assert report_id_1 in incident_after_retry["linked_report_ids"]
    assert report_id_2 in incident_after_retry["linked_report_ids"]
    
    # Check alerts again (should STILL be exactly 1)
    alert_response2 = client.get("/api/alerts")
    alerts2 = alert_response2.json()
    my_alerts2 = [a for a in alerts2 if a["incident_id"] == incident_id]
    assert len(my_alerts2) == 1 # No duplicate alert created
    
def test_incident_status_transitions():
    # Submit a report to get an incident
    import random
    lat = 28.0 + random.random()
    lon = 89.0 + random.random()
    payload = {
        "report_text": "Massive mudslide near NH-10. Road completely blocked. Vehicles stranded and houses at risk.",
        "latitude": lat, # Different location to avoid linking
        "longitude": lon
    }
    response = client.post("/api/reports", json=payload)
    report_id = response.json()["report_id"]
    
    incidents = client.get("/api/incidents").json()
    incident = next(inc for inc in incidents if report_id in inc["linked_report_ids"])
    inc_id = incident["incident_id"]
    
    # Patch to ACKNOWLEDGED
    patch_resp = client.patch(f"/api/incidents/{inc_id}", json={"status": "ACKNOWLEDGED", "reviewer_id": "operator", "note": "Testing"})
    assert patch_resp.status_code == 200
    assert patch_resp.json()["status"] == "ACKNOWLEDGED"
    
    # Verify persistence
    get_resp = client.get(f"/api/incidents/{inc_id}")
    assert get_resp.json()["status"] == "ACKNOWLEDGED"
