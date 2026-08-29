import React, { useState, useEffect, useCallback } from 'react';
import { GeoMap } from '../components/map/GeoMap';
import { geoAPI } from '../api/client';
import { ChevronDown, CloudRain, Layers, Camera, AlertCircle, Info, ChevronRight } from 'lucide-react';
import './CommandCenter.css';

export function CommandCenter() {
  const [activeKhasra, setActiveKhasra] = useState('104/A');
  const [khasraName, setKhasraName] = useState('Dag #104/A');
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [weatherError, setWeatherError] = useState(false);
  const [incidents, setIncidents] = useState([]);
  const [reports, setReports] = useState([]);
  
  const [terrainData, setTerrainData] = useState(null);
  const [terrainError, setTerrainError] = useState(false);
  const [usePrototypeTerrain, setUsePrototypeTerrain] = useState(true);
  
  const [routeResult, setRouteResult] = useState(null);
  const [isRouting, setIsRouting] = useState(false);
  const [routeError, setRouteError] = useState(null);
  
  const lastWeatherRef = React.useRef(null);
  const lastTerrainRef = React.useRef(null);

  const fetchPrediction = useCallback(async (khasraId, forcePrototype = false) => {
    setIsLoading(true);
    try {
      const mode = geoAPI.getMode();
      if (mode === 'LIVE') {
        const coords = geoAPI.getKhasraCoords(khasraId);
        
        // 1. Fetch live weather (independent of terrain API)
        try {
          const liveWeather = await geoAPI.getLiveWeather(coords.lat, coords.lon);
          setWeatherData(liveWeather);
          lastWeatherRef.current = liveWeather;
          setWeatherError(false);
        } catch (wErr) {
          console.error("Weather API Error:", wErr);
          setWeatherError(true);
        }
        
        // 2. Fetch live terrain data
        let currentTerrain = null;
        try {
          currentTerrain = await geoAPI.getTerrain(coords.lat, coords.lon);
          setTerrainData(currentTerrain);
          lastTerrainRef.current = currentTerrain;
          setTerrainError(false);
        } catch (tErr) {
          console.error("Terrain API Error:", tErr);
          setTerrainError(true);
          setTerrainData(null);
          lastTerrainRef.current = null;
          if (!usePrototypeTerrain && !forcePrototype) {
             setPrediction(null);
             setIsLoading(false);
             return;
          }
        }
        
        const res = await geoAPI.predictRisk({
           khasra_id: khasraId,
           weatherData: lastWeatherRef.current,
           terrainData: lastTerrainRef.current,
           usePrototypeTerrain: usePrototypeTerrain || forcePrototype
        });
        setPrediction(res.data);
      } else {
        const res = await geoAPI.simulateRainfall(khasraId, 30, 44.5, 65.0, -4.2);
        setPrediction(res.data);
      }
      
      // Fetch incidents and reports dynamically
      try {
        const incRes = await geoAPI.getIncidents();
        setIncidents(incRes.data || []);
      } catch (e) { console.error("Error fetching incidents", e); }
      
      try {
        const repRes = await geoAPI.getReports();
        setReports(repRes.data || []);
      } catch (e) { console.error("Error fetching reports", e); }
      
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setRouteResult(null); // Clear route when Khasra changes
    fetchPrediction(activeKhasra);
    
    const intervalId = setInterval(() => {
      fetchPrediction(activeKhasra);
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(intervalId);
  }, [activeKhasra, fetchPrediction]);

  const handleFindRoute = async () => {
    if (!prediction) return;
    setIsRouting(true);
    setRouteError(null);
    try {
      const mode = geoAPI.getMode();
      const origin = { lat: 27.38, lon: 88.58 }; // Emergency Control Centre
      const destCoords = geoAPI.getKhasraCoords(activeKhasra);
      const destination = { lat: destCoords.lat, lon: destCoords.lon, khasra_id: activeKhasra };
      
      const riskContext = {
         risk_score: prediction.risk_score,
         risk_level: prediction.risk_level,
         factor_of_safety: prediction.factor_of_safety,
         inundation_area_km2: prediction.runout?.inundation_area_km2 || 0
      };

      if (mode === 'LIVE') {
        const routeData = await geoAPI.getRoute(origin, destination, riskContext);
        setRouteResult(routeData);
      } else {
        setRouteResult({
          route: [origin, {lat: 27.34, lon: 88.60}, {lat: 27.30, lon: 88.59}, destCoords],
          distance_km: 3.2,
          estimated_cost: 3.2,
          avoided_hazard_segments: 0,
          status: "ROUTE_FOUND",
          provenance: "ASTAR_PROTOTYPE_ROAD_GRAPH"
        });
      }
    } catch (err) {
      console.error(err);
      setRouteError(err.message);
      setRouteResult(null);
    } finally {
      setIsRouting(false);
    }
  };

  const handleKhasraSelect = (id, name) => {
    setActiveKhasra(id);
    setKhasraName(name);
  };

  return (
    <div className="command-center">
      
      <GeoMap 
        activeKhasra={activeKhasra} 
        onKhasraSelect={handleKhasraSelect}
        predictionData={prediction}
        incidents={incidents}
        reports={reports}
        routeResult={routeResult}
      >
        {/* Top Left Floating Selectors over Map */}
        <div className="map-controls-topleft">
          <div className="map-dropdown">
            North East Region <ChevronDown size={14} />
          </div>
          <div className="map-dropdown">
            Now <ChevronDown size={14} />
          </div>
          <div className="map-weather" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            {geoAPI.getMode() === 'LIVE' ? (
               weatherError ? (
                 <>
                   <span className="text-critical" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                     <AlertCircle size={12}/> DATA UNAVAILABLE
                   </span>
                   {lastWeatherRef.current && (
                     <div style={{fontSize: '9px', color: '#8E8E93', marginTop: '2px'}}>STALE DATA: {lastWeatherRef.current.source}</div>
                   )}
                 </>
               ) : weatherData ? (
                 <>
                   <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                     <SunIcon /> {weatherData.temperature}°C • {weatherData.rainfall_3h_accum_mm.toFixed(1)}mm/3h
                   </span>
                   <div style={{fontSize: '9px', color: '#34C759', marginTop: '2px', fontWeight: 600}}>LIVE: {weatherData.source.toUpperCase()}</div>
                 </>
               ) : <span>Loading...</span>
            ) : (
              <>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><SunIcon /> 28°C Haze</span>
                <div style={{fontSize: '9px', color: '#8E8E93', marginTop: '2px'}}>DEMO DATA</div>
              </>
            )}
          </div>
          <div className="map-weather" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginLeft: '10px' }}>
            {geoAPI.getMode() === 'LIVE' ? (
               terrainData ? (
                 <>
                   <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                     <Layers size={12}/> {terrainData.elevation_m}m • {terrainData.slope_deg}°
                   </span>
                   <div style={{fontSize: '9px', color: '#34C759', marginTop: '2px', fontWeight: 600}}>
                     {terrainData.source ? terrainData.source.toUpperCase() : 'PROTOTYPE DEM'}
                   </div>
                 </>
               ) : (
                 <>
                   <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Layers size={12}/> 1000m • 44.5°</span>
                   <div style={{fontSize: '9px', color: '#FF9500', marginTop: '2px', fontWeight: 600}}>PROTOTYPE DEM</div>
                 </>
               )
            ) : (
              <>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Layers size={12}/> 1000m • 44.5°</span>
                <div style={{fontSize: '9px', color: '#8E8E93', marginTop: '2px'}}>DEMO DATA</div>
              </>
            )}
          </div>
        </div>
        
        {/* Top Right Floating Layers over Map */}
        <div className="map-controls-topright">
          <div className="map-dropdown layers-btn">
            <Layers size={14} /> Layers
          </div>
        </div>

        {/* Bottom Left Floating Legend over Map */}
        <div className="map-legend-bottomleft glass-panel">
          <div className="legend-title">Risk Score</div>
          <div className="gradient-bar"></div>
          <div className="legend-labels">
            <span>0</span>
            <span>20</span>
            <span>40</span>
            <span>60</span>
            <span>80</span>
            <span>100</span>
          </div>
        </div>

        {/* Bottom Right Floating Selected Hotspot over Map */}
        <div className="map-hotspot-bottomright glass-panel">
          <div className="text-secondary" style={{fontSize: '11px', marginBottom: '4px'}}>Selected Hotspot</div>
          <div style={{fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '8px'}}>{khasraName}</div>
          <div className="flex-between">
            <span className="text-secondary" style={{fontSize: '12px'}}>Risk Score</span>
            <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
              <span style={{fontSize: '18px', fontWeight: 600}}>{prediction ? prediction.risk_score : '--'}</span>
              <span className={`risk-badge ${prediction?.risk_level?.toLowerCase()}`}>{prediction?.risk_level}</span>
            </div>
          </div>
        </div>
      </GeoMap>
      
      {/* Right Sidebar Panel */}
      <div className="right-sidebar">
        <div className="glass-panel risk-overview-panel">
          <div className="panel-section-title">REGIONAL RISK OVERVIEW</div>
          
          <div className="main-score-row">
            <div className="score-value text-critical">82</div>
            <div className="score-meta">
              <div className="text-critical" style={{fontSize: '12px', fontWeight: 600, letterSpacing: '0.5px'}}>CRITICAL</div>
              <div className="text-secondary" style={{fontSize: '11px'}}>Fused Risk Score</div>
            </div>
            <div className="trend text-critical">
              ↑ 14 <span className="text-secondary">vs 1h ago</span>
            </div>
          </div>

          <div className="sparkline-chart">
            <svg viewBox="0 0 100 30" width="100%" height="40" preserveAspectRatio="none">
              <path d="M0,25 Q10,25 20,20 T40,15 T60,18 T80,10 T100,5" fill="none" stroke="var(--risk-critical)" strokeWidth="2"/>
            </svg>
            <div className="sparkline-labels">
              <span>-6h</span>
              <span>-3h</span>
              <span>Now</span>
            </div>
          </div>

          <div className="metrics-grid">
            <div className="metric-card">
              <div className="text-secondary" style={{fontSize: '11px', marginBottom: '8px'}}>Factor of Safety</div>
              <div style={{fontSize: '20px', fontWeight: 600, color: '#fff', marginBottom: '4px'}}>{prediction ? prediction.factor_of_safety.toFixed(2) : '--'}</div>
              <div className="text-critical" style={{fontSize: '10px', fontWeight: 600, letterSpacing: '0.5px'}}>FAILURE RISK</div>
            </div>
            <div className="metric-card">
              <div className="text-secondary" style={{fontSize: '11px', marginBottom: '8px'}}>Pore Pressure</div>
              <div style={{fontSize: '20px', fontWeight: 600, color: '#fff', marginBottom: '4px'}}>{prediction ? prediction.pore_pressure_kpa : '--'} kPa</div>
              <div className="text-critical" style={{fontSize: '10px', fontWeight: 600, letterSpacing: '0.5px'}}>HIGH</div>
            </div>
          </div>

          <div className="shap-section">
            <div className="flex-between" style={{marginBottom: '16px'}}>
              <span className="text-secondary" style={{fontSize: '12px'}}>Top Contributing Factors</span>
              <span style={{fontSize: '11px', color: '#0A84FF', cursor: 'pointer'}}>View all</span>
            </div>
            
            <div className="shap-list">
              <div className="shap-item">
                <span className="shap-label">Rainfall (3h)</span>
                <div className="shap-bar-container"><div className="shap-bar red" style={{width: '77%'}}></div></div>
                <span className="shap-value">+0.77</span>
              </div>
              <div className="shap-item">
                <span className="shap-label">Slope Angle</span>
                <div className="shap-bar-container"><div className="shap-bar red" style={{width: '41%'}}></div></div>
                <span className="shap-value">+0.41</span>
              </div>
              <div className="shap-item">
                <span className="shap-label">Soil Saturation</span>
                <div className="shap-bar-container"><div className="shap-bar red" style={{width: '28%'}}></div></div>
                <span className="shap-value">+0.28</span>
              </div>
              <div className="shap-item">
                <span className="shap-label">Elevation</span>
                <div className="shap-bar-container"><div className="shap-bar green" style={{width: '31%', float: 'right'}}></div></div>
                <span className="shap-value">-0.31</span>
              </div>
              <div className="shap-item">
                <span className="shap-label">Lithology</span>
                <div className="shap-bar-container"><div className="shap-bar green" style={{width: '18%', float: 'right'}}></div></div>
                <span className="shap-value">-0.18</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* NEW ROUTING PANEL */}
        <div className="glass-panel routing-panel" style={{ marginTop: '16px' }}>
          <div className="panel-section-title">EMERGENCY ROUTING</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
              <span className="text-secondary" style={{ flexShrink: 0, marginRight: '12px' }}>ORIGIN</span>
              <span style={{ fontWeight: 600, color: '#fff', textAlign: 'right', fontSize: '11px', lineHeight: '1.3' }}>
                Emergency Control Centre
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
              <span className="text-secondary" style={{ flexShrink: 0, marginRight: '12px' }}>DESTINATION</span>
              <span style={{ fontWeight: 600, color: '#fff', textAlign: 'right', fontSize: '11px' }}>
                Dag {activeKhasra}
              </span>
            </div>
            
            {!routeResult ? (
              <button 
                onClick={handleFindRoute}
                disabled={isRouting || !prediction}
                style={{
                  width: '100%', padding: '8px', background: '#0A84FF', color: 'white', 
                  border: 'none', borderRadius: '4px', cursor: (isRouting || !prediction) ? 'not-allowed' : 'pointer', 
                  fontWeight: 600, marginTop: '4px'
                }}
              >
                {isRouting ? 'Calculating...' : 'Find Safe Route'}
              </button>
            ) : (
              <div style={{ background: 'rgba(10, 132, 255, 0.1)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(10, 132, 255, 0.2)' }}>
                {routeResult.status === 'ROUTE_FOUND' ? (
                  <>
                    <div style={{ color: '#0A84FF', fontWeight: 600, fontSize: '12px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Layers size={14}/> SAFE ROUTE FOUND
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span className="text-secondary" style={{ fontSize: '11px' }}>Distance</span>
                      <span style={{ fontSize: '11px', color: '#fff', fontWeight: 600 }}>{routeResult.distance_km} km</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span className="text-secondary" style={{ fontSize: '11px' }}>Risk Avoided</span>
                      <span style={{ fontSize: '11px', color: '#34C759', fontWeight: 600 }}>{routeResult.avoided_hazard_segments} critical segment(s)</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span className="text-secondary" style={{ fontSize: '11px' }}>Reason</span>
                      <span style={{ fontSize: '11px', color: '#FF9F0A', fontWeight: 600 }}>{routeResult.reason || 'OPTIMAL DISTANCE'}</span>
                    </div>
                    <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                       <div style={{ fontSize: '9px', color: '#0A84FF', fontWeight: 600 }}>A* RISK-AWARE ROUTING</div>
                       <div style={{ fontSize: '9px', color: '#8E8E93', marginTop: '2px' }}>Risk Context: {geoAPI.getMode() === 'LIVE' ? 'LIVE MODEL' : 'DEMO'}</div>
                       <div style={{ fontSize: '9px', color: '#8E8E93', marginTop: '2px' }}>Incident Status: LIVE</div>
                       <div style={{ fontSize: '9px', color: '#8E8E93', marginTop: '2px' }}>Road Data: PROTOTYPE STATIC</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ color: '#FF3B30', fontWeight: 600, fontSize: '12px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <AlertCircle size={14}/> {routeResult.status}
                    </div>
                    <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                       <div style={{ fontSize: '9px', color: '#8E8E93', marginTop: '2px' }}>Road Data: PROTOTYPE STATIC</div>
                    </div>
                  </>
                )}
                
                <button 
                  onClick={() => setRouteResult(null)}
                  style={{
                    width: '100%', padding: '6px', background: 'transparent', color: '#fff', 
                    border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', cursor: 'pointer', 
                    fontSize: '11px', marginTop: '12px'
                  }}
                >
                  Clear Route
                </button>
              </div>
            )}
            {routeError && (
              <div style={{ fontSize: '11px', color: '#FF3B30', marginTop: '4px' }}>{routeError}</div>
            )}
          </div>
        </div>

        <div className="glass-panel feeds-panel" style={{ marginTop: '16px' }}>
          <div className="feed-tabs">
            <div className="feed-tab active">Active Incidents</div>
            <div className="feed-tab">Active Alerts</div>
          </div>
          
          <div className="feed-list">
            {incidents.slice(0, 3).map(incident => (
              <div className="feed-item" key={incident.incident_id || incident.id}>
                <div className={`feed-dot ${incident.risk_level === 'CRITICAL' ? 'red' : 'yellow'}`}></div>
                <div className="feed-content">
                  <div className="flex-between">
                    <span className="feed-title">{incident.location_name || incident.incident_id}</span>
                    <span className={`feed-severity ${incident.risk_level === 'CRITICAL' ? 'text-critical' : 'text-medium'}`}>
                      {incident.risk_level}
                    </span>
                  </div>
                  <div className="feed-meta">From: {incident.source}</div>
                </div>
              </div>
            ))}
            {incidents.length === 0 && (
               <div className="feed-meta" style={{padding: '12px', textAlign: 'center'}}>No active incidents</div>
            )}
          </div>
          
          <div className="view-all-link">View all incidents →</div>
        </div>
      </div>

      {/* Bottom Footer Panels */}
      <div className="bottom-panels">
        <div className="glass-panel b-panel">
          <div className="flex-between" style={{marginBottom: '8px'}}>
            <div className="b-panel-header" style={{margin: 0}}>Rainfall Forecast</div>
            {weatherData && <span style={{fontSize: '10px', color: '#34C759', fontWeight: 600}}>LIVE: {weatherData.rainfall_3h_accum_mm.toFixed(1)} mm/3h</span>}
          </div>
          <div className="chart-placeholder">
             {/* Dynamic weather-responsive curve representation */}
             <svg viewBox="0 0 200 100" width="100%" height="100" preserveAspectRatio="none">
              <path 
                d={`M0,80 Q50,${Math.max(10, 80 - (weatherData ? weatherData.rainfall_3h_accum_mm * 2.5 : 40))} 100,${Math.max(15, 60 - (weatherData ? weatherData.rainfall_72h_accum_mm * 0.3 : 30))} T200,65`} 
                fill="none" 
                stroke="#0A84FF" 
                strokeWidth="2"
              />
            </svg>
            <div className="chart-x-axis">
              <span>Now</span><span>+6h</span><span>+12h</span><span>+18h</span><span>+24h</span>
            </div>
          </div>
        </div>

        <div className="glass-panel b-panel">
          <div className="b-panel-header">Cascading Impact ({khasraName})</div>
          <div className="impact-grid">
            <div className="impact-stats">
              <div className="impact-item">
                <div className="impact-icon orange"><Layers size={14}/></div>
                <div>
                  <div className="text-secondary" style={{fontSize: '11px'}}>Debris Reach</div>
                  <div style={{fontSize: '14px', fontWeight: 600, color: '#fff'}}>{prediction ? prediction.runout.debris_reach_km : '--'} km</div>
                </div>
              </div>
              <div className="impact-item">
                <div className="impact-icon blue"><CloudRain size={14}/></div>
                <div>
                  <div className="text-secondary" style={{fontSize: '11px'}}>Inundation Area</div>
                  <div style={{fontSize: '14px', fontWeight: 600, color: '#fff'}}>{prediction ? prediction.runout.inundation_area_km2 : '--'} km²</div>
                </div>
              </div>
              <div className="impact-item">
                <div className="impact-icon red"><AlertCircle size={14}/></div>
                <div>
                  <div className="text-secondary" style={{fontSize: '11px'}}>Impacted Khasras</div>
                  <div style={{fontSize: '14px', fontWeight: 600, color: '#fff'}}>{prediction ? prediction.runout.impacted_khasras : '--'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel b-panel">
          <div className="flex-between" style={{marginBottom: '16px'}}>
            <div className="b-panel-header" style={{margin: 0}}>Latest Field Reports</div>
            <span style={{fontSize: '11px', color: '#0A84FF', cursor: 'pointer'}}>View all</span>
          </div>
          
          <div className="report-list">
            {reports.slice(0, 2).map(report => (
              <div className="report-item" key={report.report_id || report.id}>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Camera size={14} className="text-secondary" />
                </div>
                <div className="report-content">
                  <div className="report-title">{report.report_text || report.notes || report.hazard_type}</div>
                  <div className="report-meta">{report.location_name || 'NE Region'} • {report.reporter_type || 'citizen'}</div>
                </div>
              </div>
            ))}
            {reports.length === 0 && (
               <div className="report-meta" style={{padding: '12px', textAlign: 'center'}}>No recent reports</div>
            )}
          </div>
        </div>
      </div>
      
      {/* Global Footer (Data Sources) */}
      <div className="global-footer">
        <div className="footer-left">
          <span className="text-secondary">Data Sources</span>
          <span><span className="footer-dot"></span> XGBoost</span>
          <span><span className="footer-dot"></span> SHAP</span>
          <span><span className="footer-dot"></span> Physics Engine</span>
          <span><span className="footer-dot"></span> Field Sentinel</span>
          {geoAPI.getMode() === 'LIVE' && weatherData ? (
             <span><span className="footer-dot" style={{backgroundColor: '#34C759'}}></span> {weatherData.source}</span>
          ) : (
             <span><span className="footer-dot"></span> IMD (Rainfall)</span>
          )}
          {geoAPI.getMode() === 'LIVE' && terrainData ? (
             <span><span className="footer-dot" style={{backgroundColor: '#34C759'}}></span> {terrainData.source}</span>
          ) : geoAPI.getMode() === 'LIVE' && usePrototypeTerrain ? (
             <span><span className="footer-dot" style={{backgroundColor: '#FF9500'}}></span> STATIC PROTOTYPE (Terrain)</span>
          ) : (
             <span><span className="footer-dot"></span> SRTM (Terrain)</span>
          )}
        </div>
      </div>
      
    </div>
  );
}

function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--risk-medium)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
  );
}
