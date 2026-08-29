import React, { useState, useEffect } from 'react';
import { geoAPI } from '../api/client';
import { AlertTriangle, Clock, MapPin, RefreshCw } from 'lucide-react';
import './Incidents.css';

export function Incidents() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter] = useState('OPEN');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchIncidents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await geoAPI.getIncidents();
      // Fallback demo data if backend is empty in demo mode
      if (res.source === 'DEMO' && res.data.length === 0) {
         setIncidents([
           { incident_id: 'INC-0EC9EFF4', risk_level: 'RED', title: 'Landslide risk detected', description: 'Landslide risk detected near NH-10 corridor.', location_name: 'Dag #104/A', status: 'OPEN', created_at: new Date(Date.now() - 14*60000).toISOString(), source: 'Model' },
           { incident_id: 'INC-1FA8D221', risk_level: 'ORANGE', title: 'Road Blocked', description: 'Minor rockfall activity blocking partial lane.', location_name: 'Gangtok East', status: 'ACKNOWLEDGED', created_at: new Date(Date.now() - 120*60000).toISOString(), source: 'Field Sentinel' }
         ]);
      } else {
         setIncidents(res.data);
      }
    } catch (err) {
      setError('Failed to fetch incidents. API unavailable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
    const handleModeChange = () => fetchIncidents();
    window.addEventListener('dataModeChanged', handleModeChange);
    return () => window.removeEventListener('dataModeChanged', handleModeChange);
  }, []);

  const handleUpdateStatus = async (incidentId, newStatus) => {
    setActionLoading(true);
    try {
      await geoAPI.updateIncident(incidentId, newStatus);
      await fetchIncidents();
    } catch (err) {
      alert("Failed to update incident: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = incidents.filter(i => {
    if (filter === 'All') return true;
    if (filter === 'OPEN' && (i.status === 'OPEN' || i.status === 'UNDER_REVIEW')) return true;
    return i.status === filter;
  });

  const selected = incidents.find(i => i.incident_id === selectedId) || filtered[0];

  const getSeverityLabel = (risk_level) => {
    if (risk_level === 'RED') return 'CRITICAL';
    if (risk_level === 'ORANGE') return 'HIGH';
    if (risk_level === 'YELLOW') return 'MEDIUM';
    return 'LOW';
  };

  return (
    <div className="incidents-page">
      <header className="page-header flex-between">
        <div>
          <h1>Incidents</h1>
          <p className="text-secondary">Track and manage active hazard events.</p>
        </div>
      </header>

      <div className="incidents-layout">
        <div className="inc-list-panel glass-panel">
          <div className="inc-filters">
            {['All', 'OPEN', 'ACKNOWLEDGED', 'RESOLVED'].map(f => (
              <button 
                key={f} 
                className={`filter-tab ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
          
          <div className="inc-search">
            <input type="text" placeholder="Search incidents..." />
          </div>

          <div className="inc-list">
            {loading && <div style={{padding: '16px'}}>Loading incidents...</div>}
            {error && <div className="text-critical" style={{padding: '16px'}}>{error}</div>}
            {!loading && !error && filtered.length === 0 && (
              <div className="empty-state">
                <AlertTriangle size={24} className="text-secondary"/>
                <div style={{marginTop: '8px', color: '#fff'}}>No {filter.toLowerCase()} incidents</div>
                <div style={{fontSize: '11px', color: 'var(--text-secondary)'}}>The monitoring system has not detected any.</div>
              </div>
            )}
            {!loading && !error && filtered.map(inc => {
              const sev = getSeverityLabel(inc.risk_level);
              return (
                <div 
                  key={inc.incident_id} 
                  className={`inc-row ${selected?.incident_id === inc.incident_id ? 'selected' : ''}`}
                  onClick={() => setSelectedId(inc.incident_id)}
                >
                  <div className={`inc-severity-dot ${sev.toLowerCase()}`}></div>
                  <div className="inc-row-content">
                    <div className="flex-between">
                      <span className="inc-title">{inc.title || `Hazard detected at ${inc.location_name || inc.latitude.toFixed(2)}`}</span>
                      <span className="inc-time">{formatTimeAgo(inc.created_at || inc.updated_at)}</span>
                    </div>
                    <div className="inc-meta">
                      {inc.location_name || `${inc.latitude.toFixed(4)}, ${inc.longitude.toFixed(4)}`} • {sev}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="inc-detail-panel glass-panel">
          {!selected && !loading && (
             <div className="empty-state" style={{height: '100%'}}>
               Select an incident to view details
             </div>
          )}
          {selected && (
            <div className="inc-detail-content">
              <div className="flex-between" style={{marginBottom: '24px'}}>
                <span className={`badge ${getSeverityLabel(selected.risk_level).toLowerCase()}`}>{getSeverityLabel(selected.risk_level)}</span>
                <span className="text-secondary text-mono">{selected.incident_id}</span>
              </div>
              
              <h2 style={{fontSize: '20px', color: '#fff', marginBottom: '8px'}}>
                {selected.title || `Hazard detected at ${selected.location_name || selected.latitude.toFixed(2)}`}
              </h2>
              <div className="flex-gap text-secondary" style={{fontSize: '12px', marginBottom: '24px'}}>
                <span style={{display:'flex', alignItems:'center', gap:'4px'}}><MapPin size={12}/> {selected.location_name || `${selected.latitude.toFixed(4)}, ${selected.longitude.toFixed(4)}`}</span>
                <span style={{display:'flex', alignItems:'center', gap:'4px'}}><Clock size={12}/> {formatTimeAgo(selected.created_at || selected.updated_at)}</span>
              </div>
              
              <div className="detail-section">
                <h3 className="panel-section-title">DESCRIPTION</h3>
                <p style={{fontSize: '14px', lineHeight: '1.5', color: 'var(--text-primary)'}}>
                  {selected.description || (selected.assessment_data?.observations ? selected.assessment_data.observations.join(', ') : 'No detailed description provided.')}
                </p>
              </div>

              <div className="detail-section">
                <h3 className="panel-section-title">METADATA</h3>
                <div className="metadata-grid">
                  <div className="md-item">
                    <span className="md-lbl">Status</span>
                    <span className="md-val">{selected.status}</span>
                  </div>
                  <div className="md-item">
                    <span className="md-lbl">Source</span>
                    <span className="md-val">{selected.source}</span>
                  </div>
                  <div className="md-item">
                    <span className="md-lbl">Provenance</span>
                    <span className="md-val text-mono" style={{fontSize: '10px'}}>{selected.assessment_data?.provenance || 'Unknown'}</span>
                  </div>
                </div>
              </div>

              <div className="detail-actions">
                {(selected.status === 'OPEN' || selected.status === 'UNDER_REVIEW') && (
                  <button className="btn-primary" disabled={actionLoading} onClick={() => handleUpdateStatus(selected.incident_id, 'ACKNOWLEDGED')}>
                    {actionLoading ? <RefreshCw size={16} className="spin" /> : 'Acknowledge'}
                  </button>
                )}
                {selected.status !== 'RESOLVED' && (
                  <button className="btn-secondary" disabled={actionLoading} onClick={() => handleUpdateStatus(selected.incident_id, 'RESOLVED')}>
                    {actionLoading ? <RefreshCw size={16} className="spin" /> : 'Resolve Incident'}
                  </button>
                )}
                <button className="btn-danger" disabled={actionLoading} onClick={() => handleUpdateStatus(selected.incident_id, 'ESCALATED')}>Escalate</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatTimeAgo(isoString) {
  if (!isoString) return '';
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)} days ago`;
}
