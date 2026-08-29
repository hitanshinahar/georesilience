import pytest
from fastapi.testclient import TestClient
import sys
import os
import sqlite3
import json

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
from app.main import app
from app.core.database import get_connection, init_db, DB_PATH
from ml.models.slm.schemas import safe_extract_json
from ml.models.slm.predictor import SLMPredictor, deterministic_rule_fallback

client = TestClient(app)


def setup_module():
    """Ensure database schema is ready before running tests."""
    init_db()


def test_slm_normalization_slam_recovery():
    # Test that "slam" is recovered to "unknown" safely
    # This verifies the Pydantic schema will no longer blow up
    data = safe_extract_json('{"hazard_type": "slam", "severity": "high"}')
    assert data["hazard_type"] == "unknown"
    assert data["severity"] == "high"


def test_deterministic_fallback():
    # Test that unparseable junk triggers the deterministic rule fallback
    res = deterministic_rule_fallback("Massive mudslide blocking NH-10. Large rocks are falling continuously and the road is completely blocked.")
    assert res["hazard_type"] == "landslide"
    assert res["severity"] == "critical"
    assert res["urgency"] == "immediate"
    assert res["provenance"] == "deterministic_rule_fallback"


def test_e2e_critical_mudslide_report_and_db_verification():
    # 1. Submit critical field report via HTTP POST
    payload = {
        "latitude": 27.4125,
        "longitude": 88.7230,
        "location_name": "NH-10 Km 42",
        "reporter_type": "official",
        "report_text": "Massive mudslide blocking NH-10. Large rocks are falling continuously and the road is completely blocked.",
    }
    
    response = client.post("/api/reports", json=payload)
    assert response.status_code == 200
    report_data = response.json()
    
    report_id = report_data["report_id"]
    linked_incident_id = report_data["linked_incident_id"]
    
    assert report_data["status"] == "PROCESSED"
    assert report_data["slm_analysis"] is not None
    assert report_data["slm_analysis"]["severity"] in ["high", "critical"]
    assert linked_incident_id is not None

    # 2. Verify DB row in 'reports' table
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM reports WHERE report_id = ?", (report_id,))
    report_row = cursor.fetchone()
    assert report_row is not None, "Report row missing in database"
    assert report_row["report_text"] == payload["report_text"]
    assert report_row["status"] == "PROCESSED"
    assert report_row["linked_incident_id"] == linked_incident_id
    
    # Parse stored SLM analysis JSON from DB
    db_slm_analysis = json.loads(report_row["slm_analysis"])
    assert db_slm_analysis["severity"] in ["high", "critical"]

    # 3. Verify DB row in 'incidents' table
    cursor.execute("SELECT * FROM incidents WHERE incident_id = ?", (linked_incident_id,))
    incident_row = cursor.fetchone()
    assert incident_row is not None, "Incident row missing in database"
    assert incident_row["risk_level"] in ["ORANGE", "RED"]
    assert incident_row["source"] == "field_report"
    assert report_id in json.loads(incident_row["linked_report_ids"])

    # 4. Verify DB row in 'alerts' table
    cursor.execute("SELECT * FROM alerts WHERE incident_id = ?", (linked_incident_id,))
    alert_row = cursor.fetchone()
    assert alert_row is not None, "Alert row missing in database"
    assert alert_row["severity"] in ["ORANGE", "RED"]
    assert alert_row["status"] == "ACTIVE"
    alert_id = alert_row["alert_id"]
    
    conn.close()

    # 5. Verify API endpoints reflect the exact DB state
    # Verify via GET /api/reports/{report_id}
    rpt_get = client.get(f"/api/reports/{report_id}")
    assert rpt_get.status_code == 200
    assert rpt_get.json()["report_id"] == report_id

    # Verify via GET /api/incidents/{incident_id}
    inc_get = client.get(f"/api/incidents/{linked_incident_id}")
    assert inc_get.status_code == 200
    assert inc_get.json()["incident_id"] == linked_incident_id
    assert inc_get.json()["risk_level"] in ["ORANGE", "RED"]

    # Verify via GET /api/alerts
    alr_get = client.get("/api/alerts")
    assert alr_get.status_code == 200
    alerts_list = alr_get.json()
    matching_alert = next((a for a in alerts_list if a["alert_id"] == alert_id), None)
    assert matching_alert is not None
    assert matching_alert["incident_id"] == linked_incident_id


def test_e2e_low_risk_report_db_verification():
    # Submit a routine/safe report with no critical keywords
    payload = {
        "latitude": 27.2000,
        "longitude": 88.3000,
        "location_name": "Clear Weather Valley",
        "reporter_type": "citizen",
        "report_text": "Sunny day, road is clean and completely clear. No issues or movement observed.",
    }
    
    response = client.post("/api/reports", json=payload)
    assert response.status_code == 200
    data = response.json()
    report_id = data["report_id"]
    
    # Verify in DB
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM reports WHERE report_id = ?", (report_id,))
    row = cursor.fetchone()
    assert row is not None
    assert row["report_text"] == payload["report_text"]
    conn.close()

