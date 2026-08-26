# API Specifications

The GeoShield AI backend exposes the following endpoints for the frontend and external clients. 
Endpoints marked as **[Implemented]** exist in the repository; those marked as **[Planned]** are pending development.

## GET /zones
**Status:** [Planned]
**Purpose:** Retrieve a list of all monitored zones and their top-level risk metrics.
**Response Example:**
```json
{
  "zones": [
    {
      "zone_id": "z-101",
      "name": "Guwahati Hills",
      "risk_classification": "High",
      "final_risk_score": 0.82
    }
  ]
}
```

## GET /risk/{zone_id}
**Status:** [Planned]
**Purpose:** Fetch detailed risk assessment for a specific zone.
**Response Example:**
```json
{
  "zone_id": "z-101",
  "final_risk": 0.82,
  "trend": "Escalating",
  "confidence": 0.88,
  "components": {
    "static_risk": 0.75,
    "temporal_risk": 0.90,
    "field_evidence": 0.60
  }
}
```

## GET /risk/{zone_id}/explanation
**Status:** [Planned]
**Purpose:** Get SHAP-based feature importance explaining the static risk score.
**Response Example:**
```json
{
  "zone_id": "z-101",
  "top_factors": [
    { "feature": "slope_angle", "impact": "+0.45" },
    { "feature": "soil_saturation", "impact": "+0.32" }
  ]
}
```

## GET /map/risk
**Status:** [Planned]
**Purpose:** Retrieve the full risk grid as a GeoJSON FeatureCollection for rendering on the frontend map.
**Response Example:**
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": { "type": "Polygon", "coordinates": [...] },
      "properties": { "risk_score": 0.82, "classification": "High" }
    }
  ]
}
```

## POST /reports
**Status:** [Planned]
**Purpose:** Submit a field report containing text and optional media.
**Request Body:**
```json
{
  "location": { "lat": 26.14, "lng": 91.73 },
  "description": "Heavy waterlogging and minor rockfall on the main access road.",
  "severity_estimate": "Medium"
}
```

## GET /reports
**Status:** [Planned]
**Purpose:** Fetch recent field reports.

## POST /route/road
**Status:** [Planned]
**Purpose:** Request a safe road route between two points, avoiding active landslide zones.
**Request Body:**
```json
{
  "origin": { "lat": 26.10, "lng": 91.70 },
  "destination": { "lat": 26.20, "lng": 91.80 }
}
```

## POST /route/terrain
**Status:** [Planned]
**Purpose:** Request an emergency off-road corridor calculation using the terrain cost surface.

## GET /dashboard/summary
**Status:** [Planned]
**Purpose:** Retrieve high-level aggregates (total high-risk zones, active alerts, recent reports) for the main dashboard view.
