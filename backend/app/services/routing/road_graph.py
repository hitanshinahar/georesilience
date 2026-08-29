import math
from typing import List, Dict, Optional

class Node:
    def __init__(self, node_id: str, lat: float, lon: float, name: str = ""):
        self.node_id = node_id
        self.lat = lat
        self.lon = lon
        self.name = name

class Edge:
    def __init__(self, from_id: str, to_id: str, distance_km: float, road_name: str, road_type: str, is_high_risk_zone: bool = False):
        self.from_id = from_id
        self.to_id = to_id
        self.distance_km = distance_km
        self.road_name = road_name
        self.road_type = road_type
        self.is_high_risk_zone = is_high_risk_zone

def haversine(lat1, lon1, lat2, lon2):
    R = 6371.0 # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def distance_to_segment_meters(p_lat: float, p_lon: float, a_lat: float, a_lon: float, b_lat: float, b_lon: float) -> float:
    """Calculate the shortest distance in meters from point P to line segment AB."""
    lat_mid = math.radians((a_lat + b_lat) / 2.0)
    m_per_deg_lat = 111320.0
    m_per_deg_lon = 111320.0 * math.cos(lat_mid)
    
    px = (p_lon - a_lon) * m_per_deg_lon
    py = (p_lat - a_lat) * m_per_deg_lat
    
    bx = (b_lon - a_lon) * m_per_deg_lon
    by = (b_lat - a_lat) * m_per_deg_lat
    
    line_mag_sq = bx * bx + by * by
    
    if line_mag_sq == 0:
        return math.sqrt(px * px + py * py)
        
    u = (px * bx + py * by) / line_mag_sq
    
    if u < 0:
        closest_x, closest_y = 0.0, 0.0
    elif u > 1:
        closest_x, closest_y = bx, by
    else:
        closest_x, closest_y = bx * u, by * u
        
    dx = px - closest_x
    dy = py - closest_y
    return math.sqrt(dx * dx + dy * dy)

# PROTOTYPE — STATIC ROAD NETWORK
NODES = {
    "origin": Node("origin", 27.38, 88.58, "Emergency Control Centre"),
    "j1": Node("j1", 27.34, 88.60, "North Junction"),
    "j2": Node("j2", 27.30, 88.59, "South Junction"),
    "end": Node("end", 27.28, 88.57, "South Exit"),
    "threat_mid": Node("threat_mid", 27.32, 88.62, "NH-10 Threatened Midpoint"),
    "alt_mid1": Node("alt_mid1", 27.35, 88.65, "Alt Route North Midpoint"),
    "alt_mid2": Node("alt_mid2", 27.31, 88.63, "Alt Route South Midpoint")
}

def create_edges() -> List[Edge]:
    edges = []
    def add_bidirectional(n1, n2, name, rtype, high_risk=False):
        dist = haversine(NODES[n1].lat, NODES[n1].lon, NODES[n2].lat, NODES[n2].lon)
        edges.append(Edge(n1, n2, dist, name, rtype, high_risk))
        edges.append(Edge(n2, n1, dist, name, rtype, high_risk))

    # NH-10 Main (Normal)
    add_bidirectional("origin", "j1", "NH-10 (Main)", "normal")
    add_bidirectional("j2", "end", "NH-10 (Main)", "normal")
    
    # NH-10 Threatened Sector
    # This route is physically shorter between j1 and j2 than the alternate route.
    add_bidirectional("j1", "threat_mid", "NH-10 (Threatened Sector)", "threatened", high_risk=True)
    add_bidirectional("threat_mid", "j2", "NH-10 (Threatened Sector)", "threatened", high_risk=True)
    
    # Emergency Alternate (longer route)
    add_bidirectional("j1", "alt_mid1", "Emergency Alternate", "alternate")
    add_bidirectional("alt_mid1", "alt_mid2", "Emergency Alternate", "alternate")
    add_bidirectional("alt_mid2", "j2", "Emergency Alternate", "alternate")
    
    return edges

EDGES = create_edges()

def get_nearest_node(lat: float, lon: float) -> Node:
    """Finds the nearest graph node to the given coordinates."""
    best_node = None
    min_dist = float('inf')
    for node in NODES.values():
        dist = haversine(lat, lon, node.lat, node.lon)
        if dist < min_dist:
            min_dist = dist
            best_node = node
    return best_node
