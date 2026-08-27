"""
Phase 7 comprehensive tests for incident, alert, field reporting, and human review workflows.
Tests the full end-to-end flow without requiring actual ML model artifacts.
"""

import sys
import os
import json
import unittest

# Ensure imports work
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from app.core.database import init_db, get_connection, DB_PATH
from app.main import app

client = TestClient(app)


def _reset_db():
    """Reset the database for a clean test state."""
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)
    init_db()


class TestFieldReports(unittest.TestCase):
    """Part 1: Field report submission and processing."""

    @classmethod
    def setUpClass(cls):
        _reset_db()

    def test_01_submit_report(self):
        """Test basic field report submission."""
        response = client.post("/api/reports", json={
            "report_text": "Heavy rainfall since morning. New cracks near road.",
            "latitude": 27.3235,
            "longitude": 88.5120,
            "location_name": "NH-10 Sector 4",
            "reporter_type": "citizen",
        })
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("report_id", data)
        self.assertEqual(data["report_text"], "Heavy rainfall since morning. New cracks near road.")
        self.assertEqual(data["latitude"], 27.3235)
        self.assertIn(data["status"], ["SUBMITTED", "PROCESSED"])  # PROCESSED if SLM available, SUBMITTED otherwise
        self.__class__.report_id = data["report_id"]
        self.__class__.linked_incident_id = data.get("linked_incident_id")

    def test_02_list_reports(self):
        """Test listing all reports."""
        response = client.get("/api/reports")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        self.assertGreater(len(data), 0)

    def test_03_get_report(self):
        """Test getting a single report."""
        if not hasattr(self, "report_id"):
            self.skipTest("No report created")
        response = client.get(f"/api/reports/{self.report_id}")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["report_id"], self.report_id)

    def test_04_report_not_found(self):
        """Test 404 for missing report."""
        response = client.get("/api/reports/RPT-NONEXIST")
        self.assertEqual(response.status_code, 404)


class TestIncidentManagement(unittest.TestCase):
    """Part 2: Incident creation, update, and lifecycle."""

    @classmethod
    def setUpClass(cls):
        _reset_db()

    def test_01_create_incident(self):
        """Test creating an incident."""
        response = client.post("/api/incidents", json={
            "latitude": 27.3235,
            "longitude": 88.5120,
            "location_name": "NH-10 Sector 4",
            "risk_level": "RED",
            "risk_score": 0.9,
            "evidence_coverage": 0.85,
            "model_agreement": "high",
            "requires_human_review": False,
            "recommended_action": "emergency_response",
            "source": "assessment",
        })
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("incident_id", data)
        self.assertEqual(data["risk_level"], "RED")
        self.assertEqual(data["status"], "OPEN")
        self.__class__.incident_id = data["incident_id"]

    def test_02_create_incident_with_review(self):
        """Test that requires_human_review sets status to UNDER_REVIEW."""
        response = client.post("/api/incidents", json={
            "latitude": 27.3385,
            "longitude": 88.6122,
            "location_name": "Upper Sichey",
            "risk_level": "ORANGE",
            "risk_score": 0.7,
            "evidence_coverage": 0.6,
            "model_agreement": "low",
            "requires_human_review": True,
            "recommended_action": "field_inspection",
            "source": "assessment",
        })
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "UNDER_REVIEW")
        self.__class__.review_incident_id = data["incident_id"]

    def test_03_list_incidents(self):
        """Test listing incidents."""
        response = client.get("/api/incidents")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        self.assertGreaterEqual(len(data), 2)

    def test_04_filter_incidents_by_risk_level(self):
        """Test filtering incidents by risk level."""
        response = client.get("/api/incidents?risk_level=RED")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        for incident in data:
            self.assertEqual(incident["risk_level"], "RED")

    def test_05_filter_incidents_by_human_review(self):
        """Test filtering incidents requiring human review."""
        response = client.get("/api/incidents?requires_human_review=true")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        for incident in data:
            self.assertTrue(incident["requires_human_review"])

    def test_06_get_incident(self):
        """Test getting a single incident."""
        response = client.get(f"/api/incidents/{self.incident_id}")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["incident_id"], self.incident_id)

    def test_07_incident_not_found(self):
        """Test 404 for missing incident."""
        response = client.get("/api/incidents/INC-NONEXIST")
        self.assertEqual(response.status_code, 404)


class TestDuplicateIncidentPrevention(unittest.TestCase):
    """Part 5: Duplicate incident prevention."""

    @classmethod
    def setUpClass(cls):
        _reset_db()

    def test_duplicate_prevention(self):
        """Test that nearby incidents are not duplicated."""
        from app.services import incident_service

        # Create first incident
        inc1 = incident_service.create_incident({
            "latitude": 27.3235,
            "longitude": 88.5120,
            "location_name": "Test Zone",
            "risk_level": "ORANGE",
            "risk_score": 0.7,
            "source": "assessment",
        })
        self.assertIsNotNone(inc1)

        # Check that a nearby location finds this incident
        existing = incident_service.find_existing_incident(27.3236, 88.5121)
        self.assertIsNotNone(existing)
        self.assertEqual(existing["incident_id"], inc1["incident_id"])

        # Faraway location should not match
        far = incident_service.find_existing_incident(28.0, 89.0)
        self.assertIsNone(far)


class TestAlertGeneration(unittest.TestCase):
    """Part 3: Alert generation and deduplication."""

    @classmethod
    def setUpClass(cls):
        _reset_db()

    def test_01_alert_from_red_incident(self):
        """Test alert generation for RED incidents."""
        from app.services import incident_service, alert_service

        incident = incident_service.create_incident({
            "latitude": 27.3235,
            "longitude": 88.5120,
            "location_name": "Alert Test Zone",
            "risk_level": "RED",
            "risk_score": 0.9,
            "evidence_coverage": 0.85,
            "source": "assessment",
        })
        alert = alert_service.generate_alert_from_incident(incident)
        self.assertIsNotNone(alert)
        self.assertEqual(alert["severity"], "RED")
        self.assertEqual(alert["status"], "ACTIVE")
        self.__class__.alert_id = alert["alert_id"]

    def test_02_alert_deduplication(self):
        """Test that duplicate alerts are not generated."""
        from app.services import incident_service, alert_service

        incident = incident_service.get_incidents()[0]
        duplicate = alert_service.generate_alert_from_incident(incident)
        self.assertIsNone(duplicate)

    def test_03_list_alerts(self):
        """Test listing alerts."""
        response = client.get("/api/alerts")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        self.assertGreater(len(data), 0)

    def test_04_acknowledge_alert(self):
        """Test acknowledging an alert."""
        response = client.post(f"/api/alerts/{self.alert_id}/acknowledge")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "ACKNOWLEDGED")

    def test_05_resolve_alert(self):
        """Test resolving an alert."""
        response = client.post(f"/api/alerts/{self.alert_id}/resolve")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "RESOLVED")

    def test_06_no_alert_for_green(self):
        """Test that GREEN risk does not generate alerts."""
        from app.services import alert_service

        result = alert_service.generate_alert_from_incident({
            "risk_level": "GREEN",
            "incident_id": "fake",
            "location_name": "Safe Zone",
        })
        self.assertIsNone(result)


class TestHumanReviewWorkflow(unittest.TestCase):
    """Part 4: Human review required workflow."""

    @classmethod
    def setUpClass(cls):
        _reset_db()

    def test_01_review_required_creates_under_review(self):
        """Test that requires_human_review triggers UNDER_REVIEW status."""
        response = client.post("/api/incidents", json={
            "latitude": 27.3300,
            "longitude": 88.6000,
            "location_name": "Review Zone",
            "risk_level": "ORANGE",
            "risk_score": 0.7,
            "model_agreement": "low",
            "requires_human_review": True,
            "source": "assessment",
        })
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "UNDER_REVIEW")
        self.assertTrue(data["requires_human_review"])
        self.__class__.incident_id = data["incident_id"]

    def test_02_verify_action(self):
        """Test VERIFY review action."""
        response = client.post(f"/api/incidents/{self.incident_id}/review", json={
            "action": "VERIFY",
            "reviewer_id": "officer_1",
            "note": "Confirmed ground cracks on site.",
        })
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["new_status"], "FIELD_VERIFIED")
        self.assertEqual(data["action"], "VERIFY")

    def test_03_escalate_action(self):
        """Test ESCALATE review action."""
        # Create new incident for this test
        resp = client.post("/api/incidents", json={
            "latitude": 27.3400,
            "longitude": 88.6100,
            "location_name": "Escalate Zone",
            "risk_level": "ORANGE",
            "risk_score": 0.75,
            "requires_human_review": True,
            "source": "assessment",
        })
        inc_id = resp.json()["incident_id"]

        response = client.post(f"/api/incidents/{inc_id}/review", json={
            "action": "ESCALATE",
            "reviewer_id": "admin_1",
            "note": "Conditions worsening rapidly. Escalating to state level.",
        })
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["new_status"], "ESCALATED")

    def test_04_dismiss_requires_note(self):
        """Test that DISMISS without note returns 422."""
        resp = client.post("/api/incidents", json={
            "latitude": 27.3500,
            "longitude": 88.6200,
            "location_name": "Dismiss Zone",
            "risk_level": "YELLOW",
            "risk_score": 0.4,
            "requires_human_review": True,
            "source": "assessment",
        })
        inc_id = resp.json()["incident_id"]

        response = client.post(f"/api/incidents/{inc_id}/review", json={
            "action": "DISMISS",
            "reviewer_id": "officer_2",
        })
        self.assertEqual(response.status_code, 422)

    def test_05_dismiss_with_note(self):
        """Test DISMISS with note succeeds."""
        resp = client.post("/api/incidents", json={
            "latitude": 27.3600,
            "longitude": 88.6300,
            "location_name": "Dismiss Zone 2",
            "risk_level": "YELLOW",
            "risk_score": 0.4,
            "requires_human_review": True,
            "source": "assessment",
        })
        inc_id = resp.json()["incident_id"]

        response = client.post(f"/api/incidents/{inc_id}/review", json={
            "action": "DISMISS",
            "reviewer_id": "officer_2",
            "note": "False alarm. Construction activity caused readings.",
        })
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["new_status"], "DISMISSED")

    def test_06_resolve_action(self):
        """Test RESOLVE review action."""
        resp = client.post("/api/incidents", json={
            "latitude": 27.3700,
            "longitude": 88.6400,
            "location_name": "Resolve Zone",
            "risk_level": "ORANGE",
            "risk_score": 0.65,
            "requires_human_review": True,
            "source": "assessment",
        })
        inc_id = resp.json()["incident_id"]

        response = client.post(f"/api/incidents/{inc_id}/review", json={
            "action": "RESOLVE",
            "reviewer_id": "admin_1",
            "note": "Drainage installed. Risk mitigated.",
        })
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["new_status"], "RESOLVED")

    def test_07_review_history(self):
        """Test that review history is recorded and retrievable."""
        response = client.get(f"/api/incidents/{self.incident_id}")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("review_history", data)
        self.assertGreater(len(data["review_history"]), 0)
        self.assertEqual(data["review_history"][0]["action"], "VERIFY")


class TestAssessmentToIncidentIntegration(unittest.TestCase):
    """Part 5: Assessment-to-incident integration via workflow hook."""

    @classmethod
    def setUpClass(cls):
        _reset_db()

    def test_assessment_creates_incident_for_high_risk(self):
        """Test that assessment workflow hook creates incidents for ORANGE/RED."""
        from app.services.assessment_workflow import post_assessment_hook

        result = post_assessment_hook(
            assessment_result={
                "final_risk_score": 0.9,
                "risk_level": "RED",
                "evidence_coverage": 0.85,
                "model_agreement": "high",
                "requires_human_review": False,
                "recommended_action": "emergency_response",
            },
            location={
                "latitude": 27.3235,
                "longitude": 88.5120,
                "name": "Integration Test Zone",
            },
        )
        self.assertIsNotNone(result)
        self.assertEqual(result["risk_level"], "RED")
        self.assertIn("incident_id", result)

    def test_assessment_does_not_create_incident_for_green(self):
        """Test that GREEN assessments do not create incidents."""
        from app.services.assessment_workflow import post_assessment_hook

        result = post_assessment_hook(
            assessment_result={
                "final_risk_score": 0.2,
                "risk_level": "GREEN",
                "evidence_coverage": 0.9,
                "model_agreement": "high",
                "requires_human_review": False,
                "recommended_action": "continue_monitoring",
            },
            location={
                "latitude": 27.3200,
                "longitude": 88.6050,
                "name": "Safe Zone",
            },
        )
        self.assertIsNone(result)


class TestRegressionPhase1To6(unittest.TestCase):
    """Regression tests to verify existing functionality is preserved."""

    def test_health_check(self):
        """Test health endpoint still works."""
        response = client.get("/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "ok")

    def test_assessment_endpoint_unchanged(self):
        """Test that /api/assessment/analyze still returns the same schema."""
        response = client.post("/api/assessment/analyze", json={
            "static_features": {
                "elevation_m": 1200, "slope_deg": 35, "aspect_deg": 180,
                "tri_ruggedness": 5, "plan_curvature": 0.1,
                "rainfall_3h_accum_mm": 50, "rainfall_72h_accum_mm": 150,
                "soil_moisture_saturation_pct": 80,
                "ground_deformation_proxy_mm_yr": 10,
                "anthropogenic_load_proxy_kpa": 50,
            },
            "location": {"latitude": 27.0, "longitude": 88.0, "name": "Regression"},
        })
        self.assertEqual(response.status_code, 200)
        data = response.json()
        # Verify original schema fields still present
        self.assertIn("assessment", data)
        self.assertIn("data_sources", data)
        self.assertIn("model_outputs", data)
        self.assertIn("evidence_coverage", data["assessment"])
        self.assertIn("risk_level", data["assessment"])
        self.assertIn("requires_human_review", data["assessment"])

    def test_fusion_endpoint_unchanged(self):
        """Test that /api/risk/fuse still works."""
        response = client.post("/api/risk/fuse", json={
            "xgboost": {"risk_score": 0.5, "available": True},
            "lstm": {"risk_score": 0.6, "available": True},
            "transformer": {"risk_score": 0.55, "available": True},
        })
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("final_risk_score", data)
        self.assertIn("risk_level", data)


if __name__ == "__main__":
    unittest.main()
