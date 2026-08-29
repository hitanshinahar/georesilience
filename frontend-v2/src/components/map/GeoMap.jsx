import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Polyline, CircleMarker, Tooltip, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './GeoMap.css';

const MAP_CENTER = [27.33, 88.60];
const ZOOM_LEVEL = 13;

// 5. PARCELS
const parcels = [
  { id: '104/A', name: 'Dag #104/A (Tashi Lepcha)', bounds: [[27.34, 88.58], [27.35, 88.61], [27.33, 88.62], [27.32, 88.59]] },
  { id: '104/B', name: 'Dag #104/B (Pem Bhutia)', bounds: [[27.35, 88.61], [27.36, 88.64], [27.34, 88.63], [27.33, 88.62]] },
  { id: '108', name: 'Dag #108 (Valley Terrace)', bounds: [[27.32, 88.59], [27.33, 88.62], [27.30, 88.61], [27.31, 88.57]] }
];

// 6. ROADS
const roads = [
  { id: 'nh10', name: 'NH-10 (Main)', type: 'normal', coords: [[27.38, 88.58], [27.34, 88.60], [27.30, 88.59], [27.28, 88.57]] },
  { id: 'nh10-threatened', name: 'NH-10 (Threatened Sector)', type: 'threatened', coords: [[27.34, 88.60], [27.32, 88.62], [27.30, 88.59]] },
  { id: 'alt-route', name: 'Emergency Alternate', type: 'alternate', coords: [[27.34, 88.60], [27.35, 88.65], [27.31, 88.63], [27.30, 88.59]] }
];

// Removed hardcoded incidents and reports

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);
  return null;
}

// 3. HEX GRID (Generated)
const generateHexGrid = (centerLat, centerLng, rings) => {
  const hexes = [];
  const rLat = 0.008; 
  const rLng = 0.009; // aspect ratio adj
  
  for (let q = -rings; q <= rings; q++) {
    let r1 = Math.max(-rings, -q - rings);
    let r2 = Math.min(rings, -q + rings);
    for (let r = r1; r <= r2; r++) {
      const lat = centerLat + (q * 1.5 * rLat);
      const lng = centerLng + ((Math.sqrt(3)/2 * q + Math.sqrt(3) * r) * rLng);
      
      const dist = Math.sqrt(q*q + r*r + (q+r)*(q+r));
      let riskVal = 'low';
      if (dist < 2) riskVal = 'critical';
      else if (dist < 4 && Math.random() > 0.3) riskVal = 'high';
      else if (dist < 6 && Math.random() > 0.4) riskVal = 'moderate';
      
      const points = [];
      for(let i = 0; i < 6; i++) {
        const angle = (Math.PI / 180) * (60 * i);
        points.push([
          lat + rLat * Math.cos(angle),
          lng + rLng * Math.sin(angle)
        ]);
      }
      hexes.push({ id: `hex-${q}-${r}`, bounds: points, risk: riskVal });
    }
  }
  return hexes;
};
const hexGrid = generateHexGrid(MAP_CENTER[0], MAP_CENTER[1], 8);


export function GeoMap({ children, activeKhasra, onKhasraSelect, predictionData, incidents = [], reports = [], routeResult = null }) {
  
  const getParcelStyle = (parcelId) => {
    const isActive = parcelId === activeKhasra;
    if (isActive) {
      const riskColor = predictionData?.risk_level === 'RED' ? '#FF3B30' : 
                        predictionData?.risk_level === 'AMBER' ? '#FF9500' : '#FF3B30';
      return {
        color: riskColor,
        fillColor: riskColor,
        fillOpacity: 0.2,
        weight: 2,
        className: 'active-parcel-glow'
      };
    }
    return {
      color: '#ffffff',
      fillColor: '#ffffff',
      fillOpacity: 0.03,
      weight: 1,
      dashArray: '4'
    };
  };

  const getHexStyle = (risk) => {
    const colors = {
      low: '#34C759',
      moderate: '#FFCC00',
      high: '#FF9500',
      critical: '#FF3B30'
    };
    return {
      color: 'transparent',
      fillColor: colors[risk],
      fillOpacity: risk === 'low' ? 0.05 : 0.15,
      weight: 0
    };
  };

  const getRoadStyle = (type) => {
    if (type === 'normal') return { color: '#8E8E93', weight: 2, opacity: 0.6 };
    if (type === 'threatened') return { color: '#FF9500', weight: 3, opacity: 0.9 };
    if (type === 'blocked') return { color: '#FF3B30', weight: 4, opacity: 1 };
    if (type === 'alternate') return { color: '#32ADE6', weight: 3, opacity: 0.8, dashArray: '6, 6' };
  };

  const getMarkerColor = (severity) => {
    if (!severity) return '#34C759';
    const s = severity.toLowerCase();
    if (s.includes('crit') || s.includes('high') || s.includes('red')) return '#FF3B30';
    if (s.includes('warn') || s.includes('amber') || s.includes('med')) return '#FF9500';
    return '#34C759';
  };

  const getKhasraCoords = (khasraId) => {
    const coords = {
      '104/A': [27.335, 88.60],
      '104/B': [27.345, 88.625],
      '108': [27.315, 88.595]
    };
    return coords[khasraId] || MAP_CENTER;
  };

  const currentCenter = getKhasraCoords(activeKhasra);

  return (
    <div className="geomap-container">
      <MapContainer 
        center={MAP_CENTER} 
        zoom={ZOOM_LEVEL} 
        zoomControl={false}
        className="leaflet-fullbleed map-premium"
      >
        {/* 1. Base Terrain: Darkened Esri World Imagery for depth */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          className="base-satellite-layer"
        />
        
        {/* 2. Topographic Context: Stamen Terrain Labels/Lines if needed (Carto Dark matter as overlay) */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_only/{z}/{x}/{y}{r}.png"
          opacity={0.6}
          className="topo-overlay-layer"
        />

        {/* Map Updater for centering */}
        <MapUpdater center={currentCenter} />

        {/* 4. Hazard Heatmap (Blurred Glows) */}
        <CircleMarker center={[27.33, 88.61]} radius={80} pathOptions={{ color: 'transparent', fillColor: '#FF3B30', fillOpacity: 0.1, className: 'hazard-glow-critical' }}>
           <Tooltip sticky className="custom-tooltip">
              <span style={{fontSize: '9px', color: '#8E8E93', fontWeight: 600}}>DEMONSTRATION SPATIAL FIELD</span>
           </Tooltip>
        </CircleMarker>
        <CircleMarker center={[27.35, 88.63]} radius={120} pathOptions={{ color: 'transparent', fillColor: '#FF9500', fillOpacity: 0.08, className: 'hazard-glow-high' }}>
           <Tooltip sticky className="custom-tooltip">
              <span style={{fontSize: '9px', color: '#8E8E93', fontWeight: 600}}>DEMONSTRATION SPATIAL FIELD</span>
           </Tooltip>
        </CircleMarker>

        {/* 3. Regional Risk Field (Hexagons) */}
        {hexGrid.map(hex => (
          <Polygon 
            key={hex.id} 
            positions={hex.bounds} 
            pathOptions={getHexStyle(hex.risk)}
          >
            <Tooltip sticky className="custom-tooltip">
              <span style={{fontSize: '9px', color: '#8E8E93', fontWeight: 600}}>DEMONSTRATION SPATIAL FIELD</span>
            </Tooltip>
          </Polygon>
        ))}

        {/* 9. Cascading Hazard Visualization */}
        {predictionData && predictionData.runout && predictionData.runout.inundation_area_km2 > 0 && (
          <Circle 
            center={currentCenter}
            radius={Math.sqrt(predictionData.runout.inundation_area_km2 / Math.PI) * 1000}
            pathOptions={{ color: 'transparent', fillColor: '#0A84FF', fillOpacity: 0.15, className: 'inundation-zone' }}
          >
            <Tooltip sticky className="custom-tooltip">
              <strong>Estimated Impact Radius</strong><br/>
              <span className="text-secondary">Derived from model-reported inundation area</span><br/>
              <span style={{fontSize: '9px', color: '#8E8E93', marginTop: '4px', display: 'block'}}>MODEL OUTPUT - PHYSICS</span>
            </Tooltip>
          </Circle>
        )}

        {/* 6. Roads */}
        {roads.map(r => (
          <Polyline key={r.id} positions={r.coords} pathOptions={getRoadStyle(r.type)}>
             <Tooltip sticky className="custom-tooltip">{r.name}</Tooltip>
          </Polyline>
        ))}

        {/* 10. Selected Route */}
        {routeResult && routeResult.route && routeResult.route.length > 0 && (
          <Polyline 
            positions={routeResult.route.map(p => [p.lat, p.lon])} 
            pathOptions={{ color: '#0A84FF', weight: 6, opacity: 0.9 }}
          >
             <Tooltip sticky className="custom-tooltip">
               <strong>A* SAFE ROUTE</strong>
             </Tooltip>
          </Polyline>
        )}
        
        {/* 11. Origin Marker */}
        {routeResult && routeResult.route && routeResult.route.length > 0 && (
          <CircleMarker 
            center={[routeResult.route[0].lat, routeResult.route[0].lon]}
            radius={7}
            pathOptions={{ color: '#fff', fillColor: '#0A84FF', fillOpacity: 1, weight: 2 }}
          >
            <Tooltip permanent direction="right">
              <span style={{fontWeight: 600}}>Emergency Control Centre</span>
            </Tooltip>
          </CircleMarker>
        )}

        {/* 5. Parcels */}
        {parcels.map(p => (
          <Polygon 
            key={p.id}
            positions={p.bounds}
            pathOptions={getParcelStyle(p.id)}
            eventHandlers={{ click: () => onKhasraSelect(p.id, p.name) }}
          >
            <Tooltip sticky className="custom-tooltip">
              <strong>{p.name}</strong><br/>
              <span className="text-secondary">Click to analyze</span>
            </Tooltip>
          </Polygon>
        ))}

        {/* 7. Field Reports */}
        {reports.filter(r => r.latitude && r.longitude).map(r => (
          <CircleMarker 
            key={r.report_id || r.id} 
            center={[r.latitude, r.longitude]} 
            radius={6}
            pathOptions={{ color: '#000', weight: 1.5, fillColor: getMarkerColor(r.hazard_type), fillOpacity: 1 }}
          >
            <Popup className="premium-popup">
              <div className="popup-content">
                <span className="popup-meta" style={{fontSize: '9px', color: '#34C759', fontWeight: 600}}>LIVE - FIELD API</span>
                <strong style={{color: getMarkerColor(r.hazard_type), display: 'block'}}>{r.hazard_type || 'Report'}</strong>
                <span className="popup-time">{r.created_at ? new Date(r.created_at).toLocaleTimeString() : 'Recent'}</span>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* 8. Incident Markers */}
        {incidents.filter(i => i.latitude && i.longitude).map(i => (
          <CircleMarker 
            key={i.incident_id || i.id} 
            center={[i.latitude, i.longitude]} 
            radius={8}
            pathOptions={{ color: '#fff', weight: 2, fillColor: getMarkerColor(i.risk_level), fillOpacity: 1, className: 'incident-pulse' }}
          >
            <Tooltip permanent direction="right" className="incident-tooltip">
              <div style={{fontWeight: 600}}>{i.location_name || i.incident_id}</div>
              <div style={{fontSize: '9px', color: '#34C759', marginTop: '2px'}}>LIVE - INCIDENT API</div>
            </Tooltip>
          </CircleMarker>
        ))}

      </MapContainer>
      {children}
    </div>
  );
}
