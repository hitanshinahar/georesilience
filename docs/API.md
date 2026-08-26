# API Specifications

The GeoShield AI backend exposes the following endpoints for the frontend and external clients. 

## GET /zones
Status: [Planned]
Purpose: Retrieve a list of all monitored zones and their top-level risk metrics.

## GET /risk/{zone_id}
Status: [Planned]
Purpose: Fetch detailed risk assessment for a specific zone.

## GET /risk/{zone_id}/explanation
Status: [Planned]
Purpose: Get SHAP-based feature importance explaining the static risk score.

## GET /map/risk
Status: [Planned]
Purpose: Retrieve the full risk grid as a GeoJSON FeatureCollection for rendering on the frontend map.

## POST /reports
Status: [Planned]
Purpose: Submit a field report containing text and optional media.

## GET /reports
Status: [Planned]
Purpose: Fetch recent field reports.

## POST /route/road
Status: [Planned]
Purpose: Request a safe road route between two points, avoiding active landslide zones.

## POST /route/terrain
Status: [Planned]
Purpose: Request an emergency off-road corridor calculation using the terrain cost surface.

## GET /dashboard/summary
Status: [Planned]
Purpose: Retrieve high-level aggregates for the main dashboard view.
