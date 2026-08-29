import heapq
from typing import List, Dict, Any, Tuple
from app.services.routing.road_graph import NODES, EDGES, Node, Edge, haversine

def calculate_edge_cost(edge: Edge, risk_context: Dict[str, Any], blocked_edges: set = None) -> float:
    """
    Risk-Aware Cost Function:
    cost = distance_km + slope_risk_penalty + landslide_risk_penalty + inundation_penalty
    """
    cost = edge.distance_km
    
    # Blocked road -> infinite cost
    if edge.road_type == "blocked" or (blocked_edges and (edge.from_id, edge.to_id) in blocked_edges):
        return float('inf')
        
    if edge.is_high_risk_zone:
        # Example penalty weights from risk context
        risk_score = risk_context.get("risk_score", 0)
        risk_level = risk_context.get("risk_level", "GREEN")
        inundation = risk_context.get("inundation_area_km2", 0.0)
        
        # Base penalty for being in a threatened zone
        cost += 1.0 
        
        # Scalar penalty for risk score
        cost += (risk_score / 100.0) * 5.0
        
        # Multiplier for critical levels
        if risk_level == "CRITICAL" or risk_level == "RED":
            cost += 10.0
            
        # Inundation penalty
        cost += inundation * 5.0
        
    return cost

def astar_route(origin_id: str, dest_id: str, risk_context: Dict[str, Any], blocked_edges: set = None) -> Tuple[List[Node], float, int]:
    """
    A* Algorithm: f(n) = g(n) + h(n)
    g(n) = accumulated route cost
    h(n) = admissible geographic distance heuristic (haversine)
    """
    if origin_id not in NODES or dest_id not in NODES:
        return [], 0.0, 0
        
    if blocked_edges is None:
        blocked_edges = set()
        
    start_node = NODES[origin_id]
    goal_node = NODES[dest_id]
    
    # Priority queue: (f_score, g_score, node_id, path)
    open_set = []
    heapq.heappush(open_set, (0.0, 0.0, origin_id, [origin_id]))
    
    g_scores = {node_id: float('inf') for node_id in NODES}
    g_scores[origin_id] = 0.0
    
    avoided_hazards = 0
    
    # Quick adjacency list
    adjacency = {node_id: [] for node_id in NODES}
    for edge in EDGES:
        adjacency[edge.from_id].append(edge)
        
    while open_set:
        f, g, current_id, path = heapq.heappop(open_set)
        
        if current_id == dest_id:
            nodes_path = [NODES[nid] for nid in path]
            
            # Did we avoid the threatened sector?
            took_threatened = False
            for i in range(len(path)-1):
                for edge in adjacency[path[i]]:
                    if edge.to_id == path[i+1] and edge.is_high_risk_zone:
                        took_threatened = True
                        break
            
            # If the context is critical/high or there are blocked edges, and we took the alternate route
            if (risk_context.get("risk_level") in ["CRITICAL", "RED"] or len(blocked_edges) > 0) and not took_threatened:
                avoided_hazards = 1
                
            return nodes_path, g, avoided_hazards
            
        if g > g_scores[current_id]:
            continue
            
        for edge in adjacency[current_id]:
            edge_cost = calculate_edge_cost(edge, risk_context, blocked_edges)
            if edge_cost == float('inf'):
                continue
                
            tentative_g = g + edge_cost
            if tentative_g < g_scores[edge.to_id]:
                g_scores[edge.to_id] = tentative_g
                h = haversine(NODES[edge.to_id].lat, NODES[edge.to_id].lon, goal_node.lat, goal_node.lon)
                f_score = tentative_g + h
                
                heapq.heappush(open_set, (f_score, tentative_g, edge.to_id, path + [edge.to_id]))
                
    return [], 0.0, 0
