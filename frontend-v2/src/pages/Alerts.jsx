import React, { useState, useEffect } from 'react';
import { geoAPI } from '../api/client';
import { Bell, Radio, CheckCircle, AlertTriangle } from 'lucide-react';
import './Alerts.css';

export function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await geoAPI.getAlerts();
        // Fallback demo data if backend is empty in demo mode
        if (res.source === 'DEMO' && res.data.length === 0) {
           setAlerts([
             { id: 'ALT-923', severity: 'CRITICAL', title: 'Evacuation Warning', description: 'Immediate evacuation required for residents below Dag #104/A. Debris flow imminent.', status: 'Active', target: 'SMS: 124 Contacts', created_at: new Date(Date.now() - 5*60000).toISOString() },
             { id: 'ALT-922', severity: 'HIGH', title: 'Road Closure Alert', description: 'NH-10 blocked at km 42 due to minor landslide.', status: 'Active', target: 'App Push', created_at: new Date(Date.now() - 45*60000).toISOString() },
             { id: 'ALT-921', severity: 'WARNING', title: 'Heavy Rainfall Advisory', description: 'Rainfall exceeding 30mm/hr detected. Increased landslide susceptibility.', status: 'Acknowledged', target: 'Email: District Admin', created_at: new Date(Date.now() - 180*60000).toISOString() }
           ]);
        } else {
           setAlerts(res.data);
        }
      } catch (err) {
        setError('Failed to fetch alerts. API unavailable.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAlerts();
    const handleModeChange = () => fetchAlerts();
    window.addEventListener('dataModeChanged', handleModeChange);
    return () => window.removeEventListener('dataModeChanged', handleModeChange);
  }, []);

  return (
    <div className="alerts-page">
      <header className="page-header flex-between">
        <div>
          <h1>Alerts & Communications</h1>
          <p className="text-secondary">System-generated warnings and notifications.</p>
        </div>
        <button className="btn-primary" style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
          <Bell size={16}/> New Broadcast
        </button>
      </header>

      <div className="alerts-layout">
        <div className="alerts-feed glass-panel">
          <h2 className="panel-section-title" style={{padding: '16px 16px 0'}}>ACTIVE ALERTS</h2>
          
          {loading && <div style={{padding: '16px'}}>Loading alerts...</div>}
          {error && <div className="text-critical" style={{padding: '16px'}}>{error}</div>}
          
          <div className="alerts-list">
            {!loading && !error && alerts.map(alert => (
              <div key={alert.id} className="alert-card">
                <div className="flex-between" style={{marginBottom: '12px'}}>
                  <span className={`badge ${alert.severity.toLowerCase()}`}>{alert.severity}</span>
                  <span className="text-secondary text-mono">{alert.id}</span>
                </div>
                <h3 className="alert-title">{alert.title}</h3>
                <p className="alert-desc">{alert.description}</p>
                <div className="alert-meta">
                   <div style={{display:'flex', alignItems:'center', gap:'4px'}}><Radio size={12}/> {alert.target}</div>
                   <div>{formatTimeAgo(alert.created_at)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="alerts-config glass-panel">
          <h2 className="panel-section-title">NOTIFICATION CHANNELS</h2>
          
          <div className="channel-row">
             <div className="channel-info">
               <span className="channel-name">SMS Gateway (Twilio)</span>
               <span className="channel-status prototype">PROTOTYPE</span>
             </div>
             <p className="channel-desc">Integration architecture prepared. Waiting for API credentials.</p>
          </div>

          <div className="channel-row">
             <div className="channel-info">
               <span className="channel-name">Push Notifications (FCM)</span>
               <span className="channel-status prototype">PROTOTYPE</span>
             </div>
             <p className="channel-desc">Firebase Cloud Messaging integration prepared.</p>
          </div>

          <div className="channel-row">
             <div className="channel-info">
               <span className="channel-name">Email Relays</span>
               <span className="channel-status active">ACTIVE</span>
             </div>
             <p className="channel-desc">Currently routing to mock inbox for demo mode.</p>
          </div>

          <div className="integration-note">
             <AlertTriangle size={16} className="text-high" style={{flexShrink: 0}}/>
             <p>This is a prototype interface. Do not claim SMS or voice notifications are sent unless actual provider integration is enabled in production.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatTimeAgo(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
