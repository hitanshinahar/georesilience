"""
Field report service.
Handles report submission, SLM processing, and incident linkage.
"""

import uuid
import json
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any

from app.core.database import get_connection
from app.services import incident_service
from app.services import alert_service


def create_report(data: Dict[str, Any], slm_predictor=None) -> Dict[str, Any]:
    """
    Create a field report:
    1. Persist the report
    2. Run SLM analysis if available
    3. Find or create an incident
    4. Link the report to the incident
    """
    report_id = f"RPT-{uuid.uuid4().hex[:8].upper()}"
    now = datetime.now(timezone.utc).isoformat()
    timestamp = data.get("timestamp") or now

    # Run SLM analysis or fallback
    slm_analysis = None
    if slm_predictor is not None:
        try:
            slm_analysis = slm_predictor.analyze(data["report_text"])
            if slm_analysis and (slm_analysis.get("hazard_type") == "unknown" or "error" in slm_analysis):
                from ml.models.slm.predictor import deterministic_rule_fallback
                fallback = deterministic_rule_fallback(data["report_text"])
                if fallback.get("hazard_type") != "unknown":
                    slm_analysis = fallback
        except Exception as e:
            slm_analysis = None
            
    if not slm_analysis:
        from ml.models.slm.predictor import deterministic_rule_fallback
        slm_analysis = deterministic_rule_fallback(data["report_text"])


    # Persist report
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """INSERT INTO reports
           (report_id, report_text, latitude, longitude, location_name, reporter_type,
            timestamp, image_url, status, slm_analysis, linked_incident_id, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'SUBMITTED', ?, NULL, ?)""",
        (
            report_id,
            data["report_text"],
            data["latitude"],
            data["longitude"],
            data.get("location_name"),
            data.get("reporter_type", "citizen"),
            timestamp,
            data.get("image_url"),
            json.dumps(slm_analysis) if slm_analysis else None,
            now,
        ),
    )
    conn.commit()
    conn.close()

    # Determine incident linkage
    linked_incident_id = _link_to_incident(
        report_id=report_id,
        latitude=data["latitude"],
        longitude=data["longitude"],
        location_name=data.get("location_name"),
        slm_analysis=slm_analysis,
    )

    if linked_incident_id:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE reports SET linked_incident_id = ?, status = 'PROCESSED' WHERE report_id = ?",
            (linked_incident_id, report_id),
        )
        conn.commit()
        conn.close()

    return get_report(report_id)


def _link_to_incident(
    report_id: str,
    latitude: float,
    longitude: float,
    location_name: Optional[str],
    slm_analysis: Optional[Dict],
) -> Optional[str]:
    """
    Determine whether to create a new incident or link to an existing one.
    Returns the incident_id if linked/created, or None.
    """
    # Check for existing nearby incident
    existing = incident_service.find_existing_incident(latitude, longitude)

    if existing:
        # Update existing incident with this report
        incident_service.update_incident_from_report(
            existing["incident_id"], report_id, slm_analysis
        )
        return existing["incident_id"]

    # Determine if report warrants a new incident
    should_create = _should_create_incident(slm_analysis)

    if should_create:
        risk_level = _derive_risk_level(slm_analysis)
        requires_review = _requires_review(slm_analysis)

        incident = incident_service.create_incident({
            "latitude": latitude,
            "longitude": longitude,
            "location_name": location_name,
            "risk_level": risk_level,
            "risk_score": _derive_risk_score(slm_analysis),
            "evidence_coverage": 0.3,  # Field report only = low coverage
            "model_agreement": "field_report_only",
            "requires_human_review": requires_review,
            "recommended_action": (slm_analysis or {}).get("recommended_action", "field_inspection"),
            "source": "field_report",
            "linked_report_ids": [report_id],
            "assessment_data": slm_analysis
        })

        if incident:
            # Generate alert if risk warrants it
            alert_service.generate_alert_from_incident(incident)
            return incident["incident_id"]

    return None


def _should_create_incident(slm_analysis: Optional[Dict]) -> bool:
    """Determine if the SLM analysis warrants creating an incident."""
    if not slm_analysis or slm_analysis.get("error"):
        return False

    severity = (slm_analysis.get("severity") or "low").lower()
    urgency = (slm_analysis.get("urgency") or "monitor").lower()
    hazard_type = (slm_analysis.get("hazard_type") or "none").lower()

    # Rule 1: CRITICAL severity
    if severity == "critical":
        return True
        
    # Rule 2: HIGH severity + IMMEDIATE urgency
    if severity == "high" and urgency == "immediate":
        return True
        
    # Rule 3: Explicit road blockage
    if hazard_type == "road_blockage":
        return True
        
    # Rule 4: People / houses / vehicles at risk
    # This should be extracted into 'observations' by SLM, but we can also check the raw text
    # if passed. For now, since we only have slm_analysis, check observations.
    observations = slm_analysis.get("observations", [])
    if isinstance(observations, list):
        obs_text = " ".join(observations).lower()
        if any(x in obs_text for x in ["people", "house", "vehicle", "strande", "evacuat"]):
            return True

    return False


def _derive_risk_level(slm_analysis: Optional[Dict]) -> str:
    """Derive risk level from SLM analysis."""
    if not slm_analysis:
        return "YELLOW"

    severity = (slm_analysis.get("severity") or "low").lower()
    urgency = (slm_analysis.get("urgency") or "routine").lower()

    if severity == "critical" or urgency == "immediate":
        return "RED"
    if severity == "high" or urgency == "inspect":
        return "ORANGE"
    if severity == "medium":
        return "YELLOW"
    return "YELLOW"


def _derive_risk_score(slm_analysis: Optional[Dict]) -> float:
    """Derive a risk score from SLM analysis for incident record."""
    if not slm_analysis:
        return 0.4

    severity_scores = {"low": 0.3, "medium": 0.5, "high": 0.7, "critical": 0.9}
    severity = (slm_analysis.get("severity") or "low").lower()
    return severity_scores.get(severity, 0.4)


def _requires_review(slm_analysis: Optional[Dict]) -> bool:
    """Check if field report warrants human review."""
    if not slm_analysis:
        return True
    severity = (slm_analysis.get("severity") or "low").lower()
    return severity in ("high", "critical")


def get_reports(status: Optional[str] = None) -> List[Dict[str, Any]]:
    """List all reports with optional status filter."""
    conn = get_connection()
    cursor = conn.cursor()

    if status:
        cursor.execute(
            "SELECT * FROM reports WHERE status = ? ORDER BY created_at DESC", (status,)
        )
    else:
        cursor.execute("SELECT * FROM reports ORDER BY created_at DESC")

    rows = cursor.fetchall()
    conn.close()
    return [_row_to_dict(row) for row in rows]


def get_report(report_id: str) -> Optional[Dict[str, Any]]:
    """Get single report by ID."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM reports WHERE report_id = ?", (report_id,))
    row = cursor.fetchone()
    conn.close()
    return _row_to_dict(row) if row else None


def _row_to_dict(row) -> Dict[str, Any]:
    """Convert a sqlite3.Row to a dict with JSON parsing."""
    d = dict(row)
    if d.get("slm_analysis"):
        try:
            d["slm_analysis"] = json.loads(d["slm_analysis"])
        except (json.JSONDecodeError, TypeError):
            d["slm_analysis"] = None
    return d
