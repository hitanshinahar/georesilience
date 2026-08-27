"""
Assessment workflow service.
Separates the post-assessment incident/alert logic from the assessment router.
Called after the fusion engine produces a result.
Does not modify the assessment response schema.
"""

from typing import Dict, Any, Optional
from app.services import incident_service
from app.services import alert_service
from app.core.workflow_config import INCIDENT_CREATION_POLICY


def post_assessment_hook(
    assessment_result: Dict[str, Any],
    location: Optional[Dict[str, Any]] = None,
) -> Optional[Dict[str, Any]]:
    """
    After an assessment is computed, determine if an incident and/or alert
    should be created or updated. This runs as a side effect and does not
    modify the assessment response.

    Returns the incident dict if one was created/updated, or None.
    """
    if not assessment_result:
        return None

    risk_level = assessment_result.get("risk_level", "GREEN")

    # Check policy
    if not INCIDENT_CREATION_POLICY.get(risk_level, False):
        # For YELLOW: optionally generate a monitoring alert (no incident)
        if risk_level == "YELLOW" and location:
            _generate_monitoring_alert(assessment_result, location)
        return None

    if not location:
        return None

    latitude = location.get("latitude")
    longitude = location.get("longitude")
    if latitude is None or longitude is None:
        return None

    location_name = location.get("name")

    # Check for existing incident in this area
    existing = incident_service.find_existing_incident(latitude, longitude)

    if existing:
        # Update the existing incident with new assessment data
        _update_existing_incident(existing, assessment_result)
        incident = incident_service.get_incident(existing["incident_id"])
    else:
        # Create new incident
        incident = incident_service.create_incident({
            "latitude": latitude,
            "longitude": longitude,
            "location_name": location_name,
            "risk_level": risk_level,
            "risk_score": assessment_result.get("final_risk_score", 0.0),
            "evidence_coverage": assessment_result.get("evidence_coverage", 0.0),
            "model_agreement": assessment_result.get("model_agreement", "insufficient_data"),
            "requires_human_review": assessment_result.get("requires_human_review", False),
            "recommended_action": assessment_result.get("recommended_action", ""),
            "source": "assessment",
            "assessment_data": assessment_result,
        })

    # Generate alert
    if incident:
        alert_service.generate_alert_from_incident(incident)

    return incident


def _update_existing_incident(existing: Dict[str, Any], assessment: Dict[str, Any]):
    """Update an existing incident with fresh assessment data."""
    from app.core.database import get_connection
    from datetime import datetime, timezone
    import json

    now = datetime.now(timezone.utc).isoformat()
    conn = get_connection()
    cursor = conn.cursor()

    new_risk_level = assessment.get("risk_level", existing["risk_level"])
    new_risk_score = assessment.get("final_risk_score", existing["risk_score"])
    new_coverage = assessment.get("evidence_coverage", existing["evidence_coverage"])
    new_agreement = assessment.get("model_agreement", existing["model_agreement"])
    new_review = assessment.get("requires_human_review", existing["requires_human_review"])
    new_action = assessment.get("recommended_action", existing["recommended_action"])

    # If new assessment warrants review and incident is OPEN, move to UNDER_REVIEW
    new_status = existing["status"]
    if new_review and new_status == "OPEN":
        new_status = "UNDER_REVIEW"

    cursor.execute(
        """UPDATE incidents
           SET risk_level = ?, risk_score = ?, evidence_coverage = ?,
               model_agreement = ?, requires_human_review = ?, recommended_action = ?,
               assessment_data = ?, status = ?, updated_at = ?
           WHERE incident_id = ?""",
        (
            new_risk_level,
            new_risk_score,
            new_coverage,
            new_agreement,
            1 if new_review else 0,
            new_action,
            json.dumps(assessment),
            new_status,
            now,
            existing["incident_id"],
        ),
    )
    conn.commit()
    conn.close()


def _generate_monitoring_alert(assessment: Dict[str, Any], location: Dict[str, Any]):
    """Generate a YELLOW monitoring alert without creating an incident."""
    from app.core.workflow_config import ALERT_POLICY

    policy = ALERT_POLICY.get("YELLOW")
    if not policy or not policy["generate"]:
        return

    location_name = location.get("name") or f"{location.get('latitude', 0):.4f}, {location.get('longitude', 0):.4f}"
    score = round(assessment.get("final_risk_score", 0) * 100)
    coverage = round(assessment.get("evidence_coverage", 0) * 100)

    # Check for duplicate monitoring alerts (no incident_id, same area)
    from app.core.database import get_connection
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT COUNT(*) as cnt FROM alerts WHERE severity = 'YELLOW' AND target_area = ? AND status = 'ACTIVE'",
        (location_name,),
    )
    row = cursor.fetchone()
    if row["cnt"] > 0:
        conn.close()
        return

    import uuid
    from datetime import datetime, timezone

    alert_id = f"ALR-{uuid.uuid4().hex[:8].upper()}"
    now = datetime.now(timezone.utc).isoformat()
    title = policy["title_template"].format(location=location_name, score=score, coverage=coverage)
    message = policy["message_template"].format(location=location_name, score=score, coverage=coverage)

    cursor.execute(
        """INSERT INTO alerts (alert_id, incident_id, severity, title, message, target_area, status, created_at)
           VALUES (?, NULL, 'YELLOW', ?, ?, ?, 'ACTIVE', ?)""",
        (alert_id, title, message, location_name, now),
    )
    conn.commit()
    conn.close()
