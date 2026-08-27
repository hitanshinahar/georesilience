import sys
import os
sys.path.append(os.path.abspath("backend"))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# Valid full request
response = client.post("/api/risk/fuse", json={
  "xgboost": {
    "risk_score": 0.81,
    "confidence": 0.85,
    "available": True
  },
  "lstm": {
    "risk_score": 0.76,
    "confidence": 0.82,
    "available": True
  },
  "transformer": {
    "risk_score": 0.88,
    "confidence": 0.86,
    "available": True
  },
  "field_intelligence": {
    "hazard_type": "slope_crack",
    "hazard_confidence": 0.8,
    "severity": "high",
    "urgency": "inspect",
    "observations": [
      "new_ground_crack",
      "water_seepage"
    ],
    "temporal_change": "worsening",
    "recommended_action": "field_inspection"
  }
})
print("Valid FULL:", response.status_code)
# print(response.json())

# Missing optional source
response_missing = client.post("/api/risk/fuse", json={
  "xgboost": {
    "risk_score": 0.81,
    "confidence": 0.85,
    "available": True
  },
  "lstm": {
    "risk_score": 0.76,
    "confidence": 0.82,
    "available": True
  }
})
print("Valid MISSING SOURCES:", response_missing.status_code)
# print(response_missing.json())

# Malformed inputs
response_malformed = client.post("/api/risk/fuse", json={
  "xgboost": {
    "risk_score": "this_should_be_a_float",
    "confidence": 0.85,
    "available": True
  }
})
print("Malformed Input:", response_malformed.status_code)
# print(response_malformed.json())

# Unavailable source
response_unavail = client.post("/api/risk/fuse", json={
  "xgboost": {
    "risk_score": 0.81,
    "confidence": 0.85,
    "available": True
  },
  "lstm": {
    "risk_score": 0.76,
    "confidence": 0.82,
    "available": False
  },
  "transformer": {
    "risk_score": 0.88,
    "confidence": 0.86,
    "available": True
  }
})
print("Unavailable source:", response_unavail.status_code)
# print(response_unavail.json())
