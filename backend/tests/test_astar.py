import pytest
from app.services.routing.astar_router import astar_route, calculate_edge_cost
from app.services.routing.road_graph import Edge

def test_astar_finds_route():
    # Green context: Should take the shortest route (threatened sector which is physically shorter)
    context = {"risk_level": "GREEN", "risk_score": 10, "inundation_area_km2": 0}
    path, cost, avoided = astar_route("origin", "end", context)
    assert len(path) > 0
    assert path[0].node_id == "origin"
    assert path[-1].node_id == "end"
    
    # Path should include the threat_mid since it's the shortest path under low risk
    node_ids = [n.node_id for n in path]
    assert "threat_mid" in node_ids
    assert "alt_mid1" not in node_ids
    assert avoided == 0

def test_astar_prefers_lower_risk_route():
    # Critical context: Should penalize threatened sector and take alternate route
    context = {"risk_level": "CRITICAL", "risk_score": 85, "inundation_area_km2": 0.5}
    path, cost, avoided = astar_route("origin", "end", context)
    assert len(path) > 0
    
    # Path should take the alternate route to avoid high penalty
    node_ids = [n.node_id for n in path]
    assert "threat_mid" not in node_ids
    assert "alt_mid1" in node_ids
    assert avoided == 1

def test_astar_avoids_blocked_segment():
    # If we artificially mark an edge as blocked, cost is infinite
    edge = Edge("a", "b", 1.0, "Test", "blocked", False)
    cost = calculate_edge_cost(edge, {})
    assert cost == float('inf')

def test_astar_unreachable_destination():
    # Destination node not in graph
    path, cost, avoided = astar_route("origin", "nonexistent", {})
    assert len(path) == 0

def test_routing_response_contract():
    from fastapi.testclient import TestClient
    from app.main import app
    client = TestClient(app)
    
    req_data = {
        "origin": {"lat": 27.38, "lon": 88.58},
        "destination": {"lat": 27.30, "lon": 88.59, "khasra_id": "108"},
        "risk_context": {
            "risk_score": 82,
            "risk_level": "CRITICAL",
            "factor_of_safety": 0.87,
            "inundation_area_km2": 0.31
        }
    }
    
    response = client.post("/api/routing/astar", json=req_data)
    assert response.status_code == 200
    data = response.json()
    assert "route" in data
    assert "distance_km" in data
    assert "estimated_cost" in data
    assert "avoided_hazard_segments" in data
    assert data["status"] == "ROUTE_FOUND"
    assert data["provenance"] == "ASTAR_PROTOTYPE_ROAD_GRAPH"
    
    # Critical risk -> it should have avoided 1 segment
    assert data["avoided_hazard_segments"] == 1
