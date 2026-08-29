import React, { useState, useEffect } from 'react';
import { geoAPI } from '../api/client';
import { CheckCircle, AlertTriangle, XCircle, Activity, Database, Server, Settings } from 'lucide-react';
import './SystemHealth.css';

export function SystemHealth() {
  const [mode, setMode] = useState(geoAPI.getMode());
  const [apiStatus, setApiStatus] = useState('Checking...');

  useEffect(() => {
    const handleModeChange = (e) => setMode(e.detail.mode);
    window.addEventListener('dataModeChanged', handleModeChange);

    const checkApi = async () => {
      if (geoAPI.getMode() === 'LIVE') {
        try {
          const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
          const res = await fetch(`${baseUrl}/health`);
          if (res.ok) setApiStatus('Operational');
          else setApiStatus('Error');
        } catch (e) {
          setApiStatus('Unavailable');
        }
      } else {
        setApiStatus('Bypassed (DEMO)');
      }
    };
    checkApi();

    return () => window.removeEventListener('dataModeChanged', handleModeChange);
  }, [mode]);

  const isLive = mode === 'LIVE';

  return (
    <div className="system-health-page">
      <div className="page-header">
        <h1>System Health</h1>
        <p className="text-secondary">Production-readiness and observability metrics.</p>
      </div>

      <div className="health-grid">
        <div className="health-card glass-panel">
          <h2 className="card-title">SYSTEM STATUS</h2>
          
          <div className="health-list">
            <HealthRow name="API Gateway" status={isLive ? apiStatus : 'Bypassed (DEMO)'} />
            <HealthRow name="Risk Engine" status={isLive ? apiStatus : 'Local Fallback'} />
            <HealthRow name="Physics Engine" status={isLive ? 'Operational' : 'Active (Local)'} />
            <HealthRow name="Database" status={isLive ? apiStatus : 'SQLite (Local)'} />
            <HealthRow name="Field Sentinel" status={isLive ? apiStatus : 'Unavailable'} />
            <HealthRow name="Temporal Model" status="Unavailable" isWarning={true} />
          </div>
        </div>

        <div className="health-card glass-panel">
          <h2 className="card-title">DATA SOURCES</h2>
          
          <div className="data-source-list">
            <DataSourceRow 
              name="Rainfall" 
              provider={isLive ? 'LIVE BACKEND DATA' : 'DEMO STATIC DATA'} 
              active={true} 
            />
            <DataSourceRow 
              name="Satellite / Terrain" 
              provider="MODEL INPUT" 
              active={true} 
            />
            <DataSourceRow 
              name="Field Reports" 
              provider={isLive ? 'SQLITE / POSTGRES' : 'LOCAL CACHE'} 
              active={true} 
            />
            <DataSourceRow 
              name="SHAP" 
              provider={isLive ? 'LIVE MODEL OUTPUT' : 'LOCAL APPROXIMATION'} 
              active={true} 
            />
            <DataSourceRow 
              name="Temporal LSTM" 
              provider="NOT CONNECTED" 
              active={false} 
            />
          </div>
        </div>

        <div className="health-card glass-panel">
          <h2 className="card-title">MODEL STATUS</h2>
          
          <div className="model-list">
            <div className="model-item">
              <div className="flex-between">
                <span className="model-name">XGBoost</span>
                <span className="badge success">READY</span>
              </div>
            </div>
            <div className="model-item">
              <div className="flex-between">
                <span className="model-name">Physics Engine</span>
                <span className="badge success">READY</span>
              </div>
            </div>
            <div className="model-item">
              <div className="flex-between">
                <span className="model-name">Qwen SLM</span>
                <span className="badge warning">READY / FALLBACK ACTIVE</span>
              </div>
            </div>
            <div className="model-item">
              <div className="flex-between">
                <span className="model-name">LSTM</span>
                <span className="badge error">MODEL ARTIFACT UNAVAILABLE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HealthRow({ name, status, isWarning }) {
  const getIcon = () => {
    if (isWarning || status.includes('Unavailable') || status.includes('Error')) {
      return <span className="status-dot error"></span>;
    }
    if (status.includes('Bypassed') || status.includes('Local')) {
      return <span className="status-dot warning"></span>;
    }
    return <span className="status-dot success"></span>;
  };

  return (
    <div className="health-row">
      <div className="h-left">
        {getIcon()}
        <span>{name}</span>
      </div>
      <div className={`h-right ${isWarning || status.includes('Unavailable') ? 'text-secondary' : 'text-primary'}`}>
        {status}
      </div>
    </div>
  );
}

function DataSourceRow({ name, provider, active }) {
  return (
    <div className="ds-row">
      <div className="ds-name">{name}</div>
      <div className={`ds-provider ${active ? 'active' : 'inactive'}`}>
        {provider}
      </div>
    </div>
  );
}
