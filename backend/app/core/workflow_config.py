"""
Workflow configuration for the GeoResilience operational system.
Contains configurable thresholds, policies, and settings for
incident management, alert generation, and field report processing.
"""

# Geographic matching radius in meters for linking field reports
# to existing incidents. Adjustable based on terrain context.
INCIDENT_MATCHING_RADIUS_METERS = 500

# Risk level to incident creation policy
# Determines which risk levels trigger automatic incident creation
INCIDENT_CREATION_POLICY = {
    "GREEN": False,    # No incident
    "YELLOW": False,   # Optional monitoring, no incident by default
    "ORANGE": True,    # Create or update incident
    "RED": True,       # Create or update critical incident
}

# Risk level to alert generation policy
ALERT_POLICY = {
    "GREEN": {
        "generate": False,
        "severity": None,
        "title_template": None,
        "message_template": None,
    },
    "YELLOW": {
        "generate": True,
        "severity": "YELLOW",
        "title_template": "Monitoring Advisory: {location}",
        "message_template": "Elevated environmental indicators detected at {location}. Risk score: {score}%. Continue monitoring.",
    },
    "ORANGE": {
        "generate": True,
        "severity": "ORANGE",
        "title_template": "Elevated Risk Alert: {location}",
        "message_template": "Elevated landslide risk at {location}. Risk score: {score}%. Field inspection recommended. Evidence coverage: {coverage}%.",
    },
    "RED": {
        "generate": True,
        "severity": "RED",
        "title_template": "CRITICAL Risk Alert: {location}",
        "message_template": "Critical landslide risk at {location}. Risk score: {score}%. Immediate authority review and emergency response preparation recommended. Evidence coverage: {coverage}%.",
    },
}

# Browser notification policy - only for RED/critical events
BROWSER_NOTIFICATION_SEVERITY_THRESHOLD = "RED"

# Incident status values
INCIDENT_STATUSES = [
    "OPEN",
    "UNDER_REVIEW",
    "FIELD_VERIFIED",
    "ESCALATED",
    "RESOLVED",
    "DISMISSED",
]

# Valid review actions
REVIEW_ACTIONS = ["VERIFY", "ESCALATE", "DISMISS", "RESOLVE"]

# Review action to incident status mapping
REVIEW_ACTION_STATUS_MAP = {
    "VERIFY": "FIELD_VERIFIED",
    "ESCALATE": "ESCALATED",
    "DISMISS": "DISMISSED",
    "RESOLVE": "RESOLVED",
}

# Actions that require a note
ACTIONS_REQUIRING_NOTE = ["DISMISS"]

# Polling interval recommendation for frontend (seconds)
FRONTEND_POLL_INTERVAL_SECONDS = 15
