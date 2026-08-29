from fastapi.testclient import TestClient
from unittest.mock import patch
from app.main import app
from app.services.routing.road_graph import NODES

client = TestClient(app)

def mock_get_incidents(status):
    if status == "OPEN":
        return [
            {
                "incident_id": "INC-123",
                "latitude": 27.33, # On the j1 -> threat_mid segment
                "longitude": 88.61,
                "status": "OPEN",
                "assessment_data": {
                    "hazard_type": "road_blockage"
                }
            }
        ]
    return []

def mock_get_incidents_far(status):
    if status == "OPEN":
        return [
            {
                "incident_id": "INC-456",
                "latitude": 27.00, # Far away
                "longitude": 88.00,
                "status": "OPEN",
                "assessment_data": {
                    "hazard_type": "road_blockage"
                }
            }
        ]
    return []

@patch("app.routers.routing_router.get_incidents", side_effect=mock_get_incidents)
def test_routing_with_blocked_incident(mock_get):
    req = {
        "origin": {"lat": 27.38, "lon": 88.58},
        "destination": {"lat": 27.30, "lon": 88.59, "khasra_id": "104/A"}, # Nearest to j2
        "risk_context": {
            "risk_score": 10.0,  # GREEN risk level
            "risk_level": "GREEN",
            "factor_of_safety": 1.5,
            "inundation_area_km2": 0.0
        }
    }
    
    response = client.post("/api/routing/astar", json=req)
    assert response.status_code == 200
    data = response.json()
    
    # Should avoid the blocked segment even though risk is GREEN
    assert data["status"] == "ROUTE_FOUND"
    assert data["reason"] == "ROAD BLOCKED — FIELD REPORT"
    assert len(data["route"]) > 0
    # The route should take the alternate path, which means it shouldn't contain the threatened sector
    route_lats = [pt["lat"] for pt in data["route"]]
    assert 27.32 not in route_lats

@patch("app.routers.routing_router.get_incidents", side_effect=mock_get_incidents_far)
def test_routing_with_distant_incident(mock_get):
    req = {
        "origin": {"lat": 27.38, "lon": 88.58},
        "destination": {"lat": 27.30, "lon": 88.59, "khasra_id": "104/A"}, # Nearest to j2
        "risk_context": {
            "risk_score": 10.0,
            "risk_level": "GREEN",
            "factor_of_safety": 1.5,
            "inundation_area_km2": 0.0
        }
    }
    
    response = client.post("/api/routing/astar", json=req)
    assert response.status_code == 200
    data = response.json()
    
    # Should not avoid anything, take the shortest path
    assert data["status"] == "ROUTE_FOUND"
    assert data["reason"] == "OPTIMAL DISTANCE"
    assert data["avoided_hazard_segments"] == 0
    # Should contain the threatened sector because it's the shortest path
    route_lats = [pt["lat"] for pt in data["route"]]
    assert 27.32 in route_lats
