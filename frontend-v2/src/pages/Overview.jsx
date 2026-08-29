import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import { Activity, AlertTriangle, MapPin, CloudRain, Clock } from 'lucide-react';
import './Overview.css';
import 'leaflet/dist/leaflet.css';

const MAP_CENTER = [27.33, 88.60];
const ZOOM_LEVEL = 8;

const activeZones = [
  { id: 1, name: 'Sikkim NH-10', pos: [27.33, 88.62], risk: 'CRITICAL' },
  { id: 2, name: 'Gangtok East', pos: [27.35, 88.64], risk: 'HIGH' },
  { id: 3, name: 'Tawang Pass', pos: [27.58, 91.86], risk: 'ELEVATED' }
];

export function Overview() {
  return (
    <div className="overview-page">
      <header className="overview-header">
        <div>
          <h1 className="greeting">Good afternoon, Ananya</h1>
          <p className="status-text">
            North East Region is currently under <span className="text-critical">elevated landslide risk</span>.
          </p>
        </div>
        
        <div className="system-status-summary glass-panel">
          <div className="status-label">LIVE SYSTEM STATUS</div>
          <div className="status-stats">
            <div className="stat-item">
              <span className="stat-value">12</span>
              <span className="stat-desc">monitored districts</span>
            </div>
            <div className="stat-item">
              <span className="stat-value text-critical">3</span>
              <span className="stat-desc">critical zones</span>
            </div>
            <div className="stat-item">
              <span className="stat-value text-high">2</span>
              <span className="stat-desc">active incidents</span>
            </div>
          </div>
        </div>
      </header>

      <div className="overview-grid">
        <div className="main-col">
          <div className="map-card glass-panel">
            <h2 className="card-title">Regional Risk Map</h2>
            <div className="overview-map-container">
              <MapContainer center={MAP_CENTER} zoom={ZOOM_LEVEL} zoomControl={false} className="leaflet-fullbleed">
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                {activeZones.map(z => (
                  <CircleMarker 
                    key={z.id} 
                    center={z.pos}
                    radius={z.risk === 'CRITICAL' ? 12 : 8}
                    pathOptions={{
                      color: z.risk === 'CRITICAL' ? '#FF3B30' : (z.risk === 'HIGH' ? '#FF9500' : '#FFCC00'),
                      fillColor: z.risk === 'CRITICAL' ? '#FF3B30' : (z.risk === 'HIGH' ? '#FF9500' : '#FFCC00'),
                      fillOpacity: 0.6,
                      weight: 2
                    }}
                  >
                    <Tooltip sticky className="custom-tooltip">
                      <strong>{z.name}</strong><br/>
                      {z.risk} Risk
                    </Tooltip>
                  </CircleMarker>
                ))}
              </MapContainer>
            </div>
          </div>

          <div className="summary-cards">
            <div className="summary-card glass-panel">
              <AlertTriangle className="text-critical" size={20} />
              <div className="s-val">82</div>
              <div className="s-lbl">Overall Regional Risk</div>
            </div>
            <div className="summary-card glass-panel">
              <MapPin className="text-critical" size={20} />
              <div className="s-val">3</div>
              <div className="s-lbl">Critical Zones</div>
            </div>
            <div className="summary-card glass-panel">
              <Activity className="text-high" size={20} />
              <div className="s-val">2</div>
              <div className="s-lbl">Active Incidents</div>
            </div>
            <div className="summary-card glass-panel">
              <CloudRain className="text-info" size={20} />
              <div className="s-val">4</div>
              <div className="s-lbl">Roads Affected</div>
            </div>
          </div>
          
          <div className="forecast-card glass-panel">
            <h2 className="card-title">Weather Risk Forecast</h2>
            <div className="forecast-chart-container">
              <svg viewBox="0 0 400 100" width="100%" height="100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--risk-critical)" stopOpacity="0.5"/>
                    <stop offset="100%" stopColor="transparent" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                <path d="M0,80 Q100,80 200,20 T400,60 L400,100 L0,100 Z" fill="url(#riskGrad)" />
                <path d="M0,80 Q100,80 200,20 T400,60" fill="none" stroke="var(--risk-critical)" strokeWidth="2"/>
                {/* Risk escalation window */}
                <rect x="150" y="0" width="100" height="100" fill="rgba(255, 59, 48, 0.1)" />
                <line x1="200" y1="0" x2="200" y2="100" stroke="rgba(255, 59, 48, 0.5)" strokeDasharray="4" />
                <text x="205" y="15" fill="var(--risk-critical)" fontSize="10">Expected Peak</text>
              </svg>
              <div className="chart-x-axis">
                <span>Now</span><span>+24h</span><span>+48h</span><span>+72h</span>
              </div>
            </div>
          </div>
        </div>

        <div className="side-col">
          <div className="glass-panel side-card">
            <h2 className="card-title">Priority Locations</h2>
            <div className="priority-list">
              <div className="priority-item">
                <div className="p-rank">01</div>
                <div className="p-content">
                  <div className="p-name">Dag #104/A</div>
                  <div className="p-meta"><span className="text-critical">CRITICAL</span> · FoS 0.87</div>
                </div>
              </div>
              <div className="priority-item">
                <div className="p-rank">02</div>
                <div className="p-content">
                  <div className="p-name">NH-10 Corridor</div>
                  <div className="p-meta"><span className="text-high">HIGH</span> · Road disruption risk</div>
                </div>
              </div>
              <div className="priority-item">
                <div className="p-rank">03</div>
                <div className="p-content">
                  <div className="p-name">Gangtok East</div>
                  <div className="p-meta"><span className="text-medium">ELEVATED</span> · Rainfall escalation</div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel side-card flex-1">
            <h2 className="card-title">Recent Activity</h2>
            <div className="activity-timeline">
              <div className="timeline-item">
                <div className="timeline-icon"><Clock size={12}/></div>
                <div className="timeline-content">
                  <div className="t-title">New field report received</div>
                  <div className="t-meta">NH-10 Sector · 12 min ago</div>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-icon red"><AlertTriangle size={12}/></div>
                <div className="timeline-content">
                  <div className="t-title">Alert issued for Dag #104/A</div>
                  <div className="t-meta">Authority Notified · 25 min ago</div>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-icon orange"><Activity size={12}/></div>
                <div className="timeline-content">
                  <div className="t-title">Risk escalation detected</div>
                  <div className="t-meta">Gangtok East · 1h ago</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
