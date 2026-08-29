from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from app.services.routing.astar_router import astar_route
from app.services.routing.road_graph import get_nearest_node, NODES, EDGES, distance_to_segment_meters
from app.services.incident_service import get_incidents

router = APIRouter()

class Coordinate(BaseModel):
    lat: float
    lon: float
    khasra_id: Optional[str] = None

class RoutingRequest(BaseModel):
    origin: Coordinate
    destination: Coordinate
    risk_context: Dict[str, Any]

class RoutePoint(BaseModel):
    lat: float
    lon: float

class RoutingResponse(BaseModel):
    route: List[RoutePoint]
    distance_km: float
    estimated_cost: float
    avoided_hazard_segments: int
    status: str
    provenance: str
    reason: str = "OPTIMAL DISTANCE"

@router.post("/astar", response_model=RoutingResponse)
def get_safe_route(req: RoutingRequest):
    # Origin is fixed to "Emergency Control Centre" (origin node) as per specs
    origin_node = NODES["origin"]
    
    # Destination is the nearest node to the provided destination coordinates
    dest_node = get_nearest_node(req.destination.lat, req.destination.lon)
    if not dest_node:
        raise HTTPException(status_code=503, detail="ROUTING DATA UNAVAILABLE")
        
    # Check for active blocked road incidents
    active_incidents = get_incidents(status="OPEN") + get_incidents(status="UNDER_REVIEW")
    blocked_edges = set()
    
    for incident in active_incidents:
        assessment = incident.get("assessment_data") or {}
        if assessment.get("hazard_type") == "road_blockage":
            nearest_edge = None
            min_dist = float('inf')
            
            for edge in EDGES:
                from_node = NODES[edge.from_id]
                to_node = NODES[edge.to_id]
                dist = distance_to_segment_meters(
                    incident["latitude"], incident["longitude"],
                    from_node.lat, from_node.lon,
                    to_node.lat, to_node.lon
                )
                if dist < min_dist:
                    min_dist = dist
                    nearest_edge = edge
                    
            if nearest_edge and min_dist <= 500.0:
                blocked_edges.add((nearest_edge.from_id, nearest_edge.to_id))
                blocked_edges.add((nearest_edge.to_id, nearest_edge.from_id))
        
    path, cost, avoided = astar_route(origin_node.node_id, dest_node.node_id, req.risk_context, blocked_edges)
    
    if not path:
        return RoutingResponse(
            route=[],
            distance_km=0.0,
            estimated_cost=0.0,
            avoided_hazard_segments=0,
            status="NO SAFE ROUTE FOUND",
            provenance="ASTAR_PROTOTYPE_ROAD_GRAPH",
            reason="ALL ROUTES BLOCKED OR CRITICAL"
        )
        
    # Calculate physical distance
    distance = 0.0
    from app.services.routing.road_graph import haversine
    for i in range(len(path) - 1):
        distance += haversine(path[i].lat, path[i].lon, path[i+1].lat, path[i+1].lon)
        
    route_points = [RoutePoint(lat=n.lat, lon=n.lon) for n in path]
    
    reason = "OPTIMAL DISTANCE"
    if len(blocked_edges) > 0 and avoided > 0:
        reason = "ROAD BLOCKED — FIELD REPORT"
    elif avoided > 0:
        reason = "HIGH RISK — PHYSICS MODEL"
    
    return RoutingResponse(
        route=route_points,
        distance_km=round(distance, 1),
        estimated_cost=round(cost, 1),
        avoided_hazard_segments=avoided,
        status="ROUTE_FOUND",
        provenance="ASTAR_PROTOTYPE_ROAD_GRAPH",
        reason=reason
    )
