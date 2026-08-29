import React, { useState, useEffect, useCallback, useRef } from 'react';
import { geoAPI } from '../api/client';
import { GeoMap } from '../components/map/GeoMap';
import { RotateCcw, Play, AlertTriangle } from 'lucide-react';
import './CascadingSimulation.css';

export function CascadingSimulation() {
  const [params, setParams] = useState({
    rainfall: 30,
    rainfall_72h: 90,
    slope: 44.5,
    saturation: 65,
    insar: -4.2
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const initialMount = useRef(true);
  const timeoutRef = useRef(null);

  const fetchSimulation = useCallback(async (currentParams) => {
    setLoading(true);
    setError(null);
    try {
      const res = await geoAPI.predictRisk({
        khasra_id: '104/A',
        rainfall_mm: currentParams.rainfall,
        rainfall_72h_accum_mm: currentParams.rainfall_72h,
        slope: currentParams.slope,
        moisture: currentParams.saturation,
        insar_disp: currentParams.insar,
        usePrototypeTerrain: true
      });
      setResult(res);
    } catch (err) {
      setError('Unable to run simulation. The prediction service is currently unavailable.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce API calls on param change
  useEffect(() => {
    if (initialMount.current) {
      initialMount.current = false;
      fetchSimulation(params);
      return;
    }
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      fetchSimulation(params);
    }, 800);
    
    return () => clearTimeout(timeoutRef.current);
  }, [params, fetchSimulation]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setParams(prev => ({ ...prev, [name]: parseFloat(value) }));
  };

  const handleReset = () => {
    setParams({ rainfall: 30, rainfall_72h: 90, slope: 44.5, saturation: 65, insar: -4.2 });
  };

  return (
    <div className="simulation-page">
      <header className="page-header">
        <h1>Cascading Simulation</h1>
        <p className="text-secondary">Explore hypothetical scenarios and secondary hazards.</p>
      </header>

      <div className="sim-layout">
        <div className="sim-left-panel glass-panel">
          <h2 className="panel-section-title">SCENARIO INPUTS</h2>
          
          <div className="slider-group">
            <div className="flex-between">
              <label>Rainfall Intensity</label>
              <span className="slider-val">{params.rainfall} mm/hr</span>
            </div>
            <input type="range" name="rainfall" min="0" max="150" value={params.rainfall} onChange={handleChange} />
          </div>

          <div className="slider-group">
            <div className="flex-between">
              <label>72h Antecedent Rainfall</label>
              <span className="slider-val">{params.rainfall_72h} mm</span>
            </div>
            <input type="range" name="rainfall_72h" min="0" max="500" value={params.rainfall_72h} onChange={handleChange} />
          </div>

          <div className="slider-group">
            <div className="flex-between">
              <label>Slope Angle</label>
              <span className="slider-val">{params.slope}°</span>
            </div>
            <input type="range" name="slope" min="15" max="85" step="0.5" value={params.slope} onChange={handleChange} />
          </div>

          <div className="slider-group">
            <div className="flex-between">
              <label>Soil Saturation</label>
              <span className="slider-val">{params.saturation}%</span>
            </div>
            <input type="range" name="saturation" min="0" max="100" value={params.saturation} onChange={handleChange} />
          </div>

          <div className="sim-actions">
            <button className="reset-btn" onClick={handleReset}><RotateCcw size={14}/> Reset Scenario</button>
            <button className="run-btn" onClick={() => fetchSimulation(params)}><Play size={14}/> Run Simulation</button>
          </div>
        </div>

        <div className="sim-center-panel">
          <div className="sim-map-wrapper">
             <GeoMap activeKhasra="104/A" onKhasraSelect={() => {}} predictionData={result?.data} />
          </div>
        </div>

        <div className="sim-right-panel glass-panel">
          <div className="flex-between">
            <h2 className="panel-section-title">SCENARIO RESULT</h2>
            {result?.source === 'DEMO_LOCAL' && <span className="provenance-badge demo">DEMO DATA</span>}
            {result?.source === 'LIVE_FASTAPI' && <span className="provenance-badge live">LIVE BACKEND DATA</span>}
          </div>
          
          {loading && (
             <div className="recalculating-overlay">
                Recalculating scenario...
             </div>
          )}

          {error && !loading && (
            <div className="error-state">
              <AlertTriangle className="text-critical" size={24}/>
              <div style={{fontWeight: 600, marginTop: '8px'}}>Unable to run simulation</div>
              <div style={{fontSize: '11px', color: 'var(--text-secondary)'}}>{error}</div>
            </div>
          )}

          {!error && result && (
            <div className={`sim-results ${loading ? 'loading-blur' : ''}`}>
               <div className={`m-score-label ${result.data.risk_level.toLowerCase()}`} style={{fontSize: '24px', marginBottom: '24px'}}>
                 {result.data.risk_level}
               </div>

               <div className="res-grid">
                 <div className="res-item">
                   <span className="res-lbl">Factor of Safety</span>
                   <span className="res-val">{result.data.factor_of_safety.toFixed(2)}</span>
                 </div>
                 <div className="res-item">
                   <span className="res-lbl">Debris Reach</span>
                   <span className="res-val">{result.data.runout.debris_reach_km} km</span>
                 </div>
                 <div className="res-item">
                   <span className="res-lbl">Inundation Area</span>
                   <span className="res-val">{result.data.runout.inundation_area_km2} km²</span>
                 </div>
                 <div className="res-item">
                   <span className="res-lbl">Impacted Khasras</span>
                   <span className="res-val">{result.data.runout.impacted_khasras}</span>
                 </div>
                 <div className="res-item" style={{gridColumn: '1 / 3'}}>
                   <span className="res-lbl">Exposed Residents</span>
                   <span className="res-val text-critical">{result.data.runout.impacted_residents}</span>
                 </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
