"""
Incident management service.
Handles creation, updating, deduplication, review actions, and status transitions.
"""

import uuid
import json
import math
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any

from app.core.database import get_connection
from app.core.workflow_config import (
    INCIDENT_MATCHING_RADIUS_METERS,
    REVIEW_ACTIONS,
    REVIEW_ACTION_STATUS_MAP,
    ACTIONS_REQUIRING_NOTE,
)


def _haversine_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two lat/lng points in meters."""
    R = 6371000  # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlam = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlam / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def find_existing_incident(
    latitude: float,
    longitude: float,
    radius_meters: float = None,
) -> Optional[Dict[str, Any]]:
    """Find an active incident within the configured geographic radius."""
    if radius_meters is None:
        radius_meters = INCIDENT_MATCHING_RADIUS_METERS

    conn = get_connection()
    cursor = conn.cursor()
    # Only match against active (non-resolved, non-dismissed) incidents
    cursor.execute(
        "SELECT * FROM incidents WHERE status NOT IN ('RESOLVED', 'DISMISSED')"
    )
    rows = cursor.fetchall()
    conn.close()

    for row in rows:
        dist = _haversine_meters(latitude, longitude, row["latitude"], row["longitude"])
        if dist <= radius_meters:
            return _row_to_dict(row)
    return None


def create_incident(data: Dict[str, Any]) -> Dict[str, Any]:
    """Create a new incident. Sets status to UNDER_REVIEW if requires_human_review."""
    incident_id = f"INC-{uuid.uuid4().hex[:8].upper()}"
    now = datetime.now(timezone.utc).isoformat()

    status = "UNDER_REVIEW" if data.get("requires_human_review") else "OPEN"

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """INSERT INTO incidents
           (incident_id, latitude, longitude, location_name, status, risk_level,
            risk_score, evidence_coverage, model_agreement, requires_human_review,
            recommended_action, source, assessment_data, linked_report_ids, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (
            incident_id,
            data["latitude"],
            data["longitude"],
            data.get("location_name"),
            status,
            data["risk_level"],
            data.get("risk_score", 0.0),
            data.get("evidence_coverage", 0.0),
            data.get("model_agreement", "insufficient_data"),
            1 if data.get("requires_human_review") else 0,
            data.get("recommended_action"),
            data.get("source", "assessment"),
            json.dumps(data.get("assessment_data")) if data.get("assessment_data") else None,
            json.dumps(data.get("linked_report_ids", [])),
            now,
            now,
        ),
    )
    conn.commit()
    conn.close()

    return get_incident(incident_id)


def update_incident_from_report(
    incident_id: str, report_id: str, slm_analysis: Optional[Dict] = None
) -> Dict[str, Any]:
    """Link a field report to an incident and potentially escalate."""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM incidents WHERE incident_id = ?", (incident_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return None

    # Add report ID to linked list
    linked = json.loads(row["linked_report_ids"] or "[]")
    if report_id not in linked:
        linked.append(report_id)

    now = datetime.now(timezone.utc).isoformat()

    # Check if SLM analysis suggests escalation
    new_risk_level = row["risk_level"]
    new_requires_review = bool(row["requires_human_review"])
    if slm_analysis:
        severity = (slm_analysis.get("severity") or "low").lower()
        if severity == "critical":
            new_risk_level = "RED"
            new_requires_review = True
        elif severity == "high" and row["risk_level"] in ("GREEN", "YELLOW"):
            new_risk_level = "ORANGE"
            new_requires_review = True

    new_status = row["status"]
    if new_requires_review and new_status == "OPEN":
        new_status = "UNDER_REVIEW"

    cursor.execute(
        """UPDATE incidents
           SET linked_report_ids = ?, updated_at = ?, risk_level = ?,
               requires_human_review = ?, status = ?
           WHERE incident_id = ?""",
        (
            json.dumps(linked),
            now,
            new_risk_level,
            1 if new_requires_review else 0,
            new_status,
            incident_id,
        ),
    )
    conn.commit()
    conn.close()

    return get_incident(incident_id)


def apply_review_action(
    incident_id: str, action: str, reviewer_id: str = "operator", note: Optional[str] = None
) -> Optional[Dict[str, Any]]:
    """Apply a review action (VERIFY/ESCALATE/DISMISS/RESOLVE) to an incident."""
    if action not in REVIEW_ACTIONS:
        raise ValueError(f"Invalid action: {action}. Must be one of {REVIEW_ACTIONS}")

    if action in ACTIONS_REQUIRING_NOTE and not note:
        raise ValueError(f"Action '{action}' requires a note.")

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM incidents WHERE incident_id = ?", (incident_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return None

    new_status = REVIEW_ACTION_STATUS_MAP[action]
    review_id = f"REV-{uuid.uuid4().hex[:8].upper()}"
    now = datetime.now(timezone.utc).isoformat()

    # Insert review action record
    cursor.execute(
        """INSERT INTO review_actions (review_id, incident_id, action, reviewer_id, note, timestamp)
           VALUES (?, ?, ?, ?, ?, ?)""",
        (review_id, incident_id, action, reviewer_id, note, now),
    )

    # Update incident status
    cursor.execute(
        "UPDATE incidents SET status = ?, updated_at = ? WHERE incident_id = ?",
        (new_status, now, incident_id),
    )

    conn.commit()
    conn.close()

    return {
        "review_id": review_id,
        "incident_id": incident_id,
        "action": action,
        "reviewer_id": reviewer_id,
        "note": note,
        "timestamp": now,
        "new_status": new_status,
    }


def update_status(
    incident_id: str, status: str, reviewer_id: str = "operator", note: Optional[str] = None
) -> Optional[Dict[str, Any]]:
    """Directly update incident status with audit trail."""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM incidents WHERE incident_id = ?", (incident_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return None

    now = datetime.now(timezone.utc).isoformat()

    # Record as review action
    review_id = f"REV-{uuid.uuid4().hex[:8].upper()}"
    cursor.execute(
        """INSERT INTO review_actions (review_id, incident_id, action, reviewer_id, note, timestamp)
           VALUES (?, ?, ?, ?, ?, ?)""",
        (review_id, incident_id, f"STATUS_CHANGE:{status}", reviewer_id, note, now),
    )

    cursor.execute(
        "UPDATE incidents SET status = ?, updated_at = ? WHERE incident_id = ?",
        (status, now, incident_id),
    )

    conn.commit()
    conn.close()

    return get_incident(incident_id)


def get_incidents(
    risk_level: Optional[str] = None,
    status: Optional[str] = None,
    requires_human_review: Optional[bool] = None,
) -> List[Dict[str, Any]]:
    """List incidents with optional filters."""
    conn = get_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM incidents WHERE 1=1"
    params = []

    if risk_level:
        query += " AND risk_level = ?"
        params.append(risk_level)
    if status:
        query += " AND status = ?"
        params.append(status)
    if requires_human_review is not None:
        query += " AND requires_human_review = ?"
        params.append(1 if requires_human_review else 0)

    query += " ORDER BY updated_at DESC"

    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    return [_row_to_dict(row) for row in rows]


def get_incident(incident_id: str) -> Optional[Dict[str, Any]]:
    """Get single incident with review history."""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM incidents WHERE incident_id = ?", (incident_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return None

    result = _row_to_dict(row)

    # Fetch review history
    cursor.execute(
        "SELECT * FROM review_actions WHERE incident_id = ? ORDER BY timestamp DESC",
        (incident_id,),
    )
    reviews = cursor.fetchall()
    result["review_history"] = [dict(r) for r in reviews]
    conn.close()

    return result


def _row_to_dict(row) -> Dict[str, Any]:
    """Convert a sqlite3.Row to a dict with JSON field parsing."""
    d = dict(row)
    d["requires_human_review"] = bool(d.get("requires_human_review", 0))
    if d.get("linked_report_ids"):
        try:
            d["linked_report_ids"] = json.loads(d["linked_report_ids"])
        except (json.JSONDecodeError, TypeError):
            d["linked_report_ids"] = []
    else:
        d["linked_report_ids"] = []
    if d.get("assessment_data"):
        try:
            d["assessment_data"] = json.loads(d["assessment_data"])
        except (json.JSONDecodeError, TypeError):
            d["assessment_data"] = None
    d.setdefault("review_history", [])
    return d
