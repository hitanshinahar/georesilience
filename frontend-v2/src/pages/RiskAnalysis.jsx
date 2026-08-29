import React, { useState, useEffect } from 'react';
import { geoAPI } from '../api/client';
import { RefreshCw, TrendingUp, AlertTriangle } from 'lucide-react';
import './RiskAnalysis.css';

export function RiskAnalysis() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const mode = geoAPI.getMode();
        let weatherData = null;
        let terrainData = null;

        if (mode === 'LIVE') {
          const coords = geoAPI.getKhasraCoords('104/A');
          try { weatherData = await geoAPI.getLiveWeather(coords.lat, coords.lon); } catch (e) {}
          try { terrainData = await geoAPI.getTerrain(coords.lat, coords.lon); } catch (e) {}
        }

        const result = await geoAPI.predictRisk({ 
          khasra_id: '104/A',
          weatherData,
          terrainData,
          usePrototypeTerrain: true
        });
        setData(result);
      } catch (err) {
        setError(err.message || 'Failed to analyze risk data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    const handleModeChange = () => fetchData();
    window.addEventListener('dataModeChanged', handleModeChange);
    return () => window.removeEventListener('dataModeChanged', handleModeChange);
  }, []);

  return (
    <div className="risk-analysis-page">
      <header className="page-header flex-between">
        <div>
          <h1>Risk Analysis</h1>
          <p className="text-secondary">Deep analytical workspace for geological instability.</p>
        </div>
        <div className="flex-gap">
          <button className="select-btn">Dag #104/A ▾</button>
          <button className="select-btn">Last 24 Hours ▾</button>
          <button className="action-btn"><RefreshCw size={14}/> Compare</button>
        </div>
      </header>

      {loading && (
        <div className="loading-state glass-panel">
          <div className="skeleton-line lg"></div>
          <div className="skeleton-line md"></div>
          <div className="skeleton-line sm"></div>
        </div>
      )}

      {error && !loading && (
        <div className="error-state glass-panel">
          <AlertTriangle className="text-critical" size={32}/>
          <h3>Analysis Unavailable</h3>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && data && (
        <div className="risk-analysis-grid">
          
          <div className="left-panel glass-panel">
            <div className="flex-between">
              <span className="panel-section-title">RISK SCORE</span>
              {data.source === 'DEMO_LOCAL' && <span className="provenance-badge demo">DEMO DATA</span>}
              {data.source === 'LIVE_FASTAPI' && <span className="provenance-badge live">LIVE BACKEND DATA</span>}
            </div>
            
            <div className="massive-score">
              <div className={`m-score-val ${data.data.risk_level.toLowerCase()}`}>{data.data.risk_score}</div>
              <div className={`m-score-label ${data.data.risk_level.toLowerCase()}`}>{data.data.risk_level}</div>
            </div>

            <div className="trend-chart-container">
               <svg viewBox="0 0 100 30" width="100%" height="100%" preserveAspectRatio="none">
                 <path d="M0,25 Q20,25 40,20 T80,15 T100,5" fill="none" stroke="var(--risk-critical)" strokeWidth="2"/>
               </svg>
               <div className="chart-x-axis">
                 <span>-24h</span><span>-12h</span><span>Now</span>
               </div>
            </div>
          </div>

          <div className="right-panel glass-panel">
            <span className="panel-section-title">TOP CONTRIBUTING FACTORS</span>
            <div className="shap-list-large">
              {data.data.shap_breakdown?.map((factor, idx) => {
                const isPositive = factor.percentage > 0;
                return (
                  <div className="shap-item-large" key={idx}>
                    <span className="shap-label">{factor.feature}</span>
                    <div className="shap-bar-container">
                      <div className={`shap-bar ${isPositive ? 'red' : 'green'}`} 
                           style={{width: `${Math.abs(factor.percentage)}%`, float: isPositive ? 'left' : 'right'}}>
                      </div>
                    </div>
                    <span className="shap-value">{isPositive ? '+' : '-'}{(Math.abs(factor.percentage) / 100).toFixed(2)}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bottom-panel glass-panel">
            <div className="analytical-grid">
              <div className="a-card">
                <span className="a-label">Factor of Safety</span>
                <span className="a-val">{data.data.factor_of_safety.toFixed(2)}</span>
                <span className="a-meta text-critical">CRITICAL</span>
              </div>
              <div className="a-card">
                <span className="a-label">Pore Pressure</span>
                <span className="a-val">{data.data.pore_pressure_kpa} kPa</span>
                <span className="a-meta text-high">ELEVATED</span>
              </div>
              <div className="a-card">
                <span className="a-label">Ground Deformation</span>
                <span className="a-val">-14.2 mm/yr</span>
                <span className="a-meta text-critical">SUBSIDING</span>
              </div>
              <div className="a-card">
                <span className="a-label">Rainfall (3h)</span>
                <span className="a-val">30 mm/hr</span>
                <span className="a-meta text-medium">RISING</span>
              </div>
            </div>
            <div className="model-provenance">
              Model: {data.data.model}
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
}
