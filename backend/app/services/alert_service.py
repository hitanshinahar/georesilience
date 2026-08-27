"""
Alert generation service.
Generates alerts from incidents based on risk policy, with deduplication.
"""

import uuid
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any

from app.core.database import get_connection
from app.core.workflow_config import ALERT_POLICY


def generate_alert_from_incident(incident: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Generate an alert based on incident risk level and alert policy.
    Returns None if no alert should be generated, or if a duplicate exists.
    """
    risk_level = incident.get("risk_level", "GREEN")
    policy = ALERT_POLICY.get(risk_level)

    if not policy or not policy["generate"]:
        return None

    incident_id = incident.get("incident_id")

    # Deduplication: check for existing active alert for this incident
    if incident_id and _has_active_alert(incident_id):
        return None

    location = incident.get("location_name") or f"{incident.get('latitude', 0):.4f}, {incident.get('longitude', 0):.4f}"
    score = round(incident.get("risk_score", 0) * 100)
    coverage = round(incident.get("evidence_coverage", 0) * 100)

    title = policy["title_template"].format(location=location, score=score, coverage=coverage)
    message = policy["message_template"].format(location=location, score=score, coverage=coverage)

    alert_id = f"ALR-{uuid.uuid4().hex[:8].upper()}"
    now = datetime.now(timezone.utc).isoformat()

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """INSERT INTO alerts (alert_id, incident_id, severity, title, message, target_area, status, created_at)
           VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE', ?)""",
        (alert_id, incident_id, policy["severity"], title, message, location, now),
    )
    conn.commit()
    conn.close()

    return get_alert(alert_id)


def _has_active_alert(incident_id: str) -> bool:
    """Check if an active alert already exists for a given incident."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT COUNT(*) as cnt FROM alerts WHERE incident_id = ? AND status = 'ACTIVE'",
        (incident_id,),
    )
    row = cursor.fetchone()
    conn.close()
    return row["cnt"] > 0


def acknowledge_alert(alert_id: str) -> Optional[Dict[str, Any]]:
    """Mark an alert as acknowledged."""
    return _update_alert_status(alert_id, "ACKNOWLEDGED")


def resolve_alert(alert_id: str) -> Optional[Dict[str, Any]]:
    """Mark an alert as resolved."""
    return _update_alert_status(alert_id, "RESOLVED")


def _update_alert_status(alert_id: str, status: str) -> Optional[Dict[str, Any]]:
    """Update alert status."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM alerts WHERE alert_id = ?", (alert_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return None

    cursor.execute("UPDATE alerts SET status = ? WHERE alert_id = ?", (status, alert_id))
    conn.commit()
    conn.close()
    return get_alert(alert_id)


def get_alerts(
    severity: Optional[str] = None,
    status: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """List alerts with optional filters."""
    conn = get_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM alerts WHERE 1=1"
    params = []

    if severity:
        query += " AND severity = ?"
        params.append(severity)
    if status:
        query += " AND status = ?"
        params.append(status)

    query += " ORDER BY created_at DESC"
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    return [dict(row) for row in rows]


def get_alert(alert_id: str) -> Optional[Dict[str, Any]]:
    """Get single alert by ID."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM alerts WHERE alert_id = ?", (alert_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None
