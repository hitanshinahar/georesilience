import React, { useState, useEffect } from 'react';
import { geoAPI } from '../api/client';
import { MapPin, Camera, Send, CloudOff, RefreshCw, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { getPendingReports, savePendingReport, removePendingReport } from '../utils/offlineStorage';
import './FieldSentinel.css';

export function FieldSentinel() {
  const [formData, setFormData] = useState({
    hazardType: 'SLOPE_CRACK',
    description: '',
    latitude: '27.330',
    longitude: '88.610'
  });
  
  const [reports, setReports] = useState([]);
  const [offlineQueue, setOfflineQueue] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [online, setOnline] = useState(navigator.onLine);

  const loadQueue = async () => {
    try {
      const q = await getPendingReports();
      setOfflineQueue(q);
    } catch (e) {
      console.error("Failed to load queue:", e);
    }
  };

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    loadQueue();
    fetchReports();
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await geoAPI.getReports();
      setReports(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const syncOfflineQueue = async () => {
    if (!online) return;
    
    const pending = await getPendingReports();
    if (pending.length === 0) return;
    
    setIsSyncing(true);
    setSyncStatusMsg(`SYNCING ${pending.length} REPORT${pending.length > 1 ? 'S' : ''}...`);
    
    const newReports = [...reports];
    let syncError = false;
    let successCount = 0;
    
    for (const item of pending) {
      // Don't re-sync if it permanently failed unless user manually triggers again maybe? 
      // Actually we'll just try syncing them all. If it's a 422, it will fail again.
      try {
        const res = await geoAPI.submitReport(item);
        newReports.unshift(res);
        await removePendingReport(item.localId);
        successCount++;
      } catch (err) {
        if (err.message && err.message.includes("422")) {
          console.warn("Validation failed for queued report:", item);
          // Mark it as failed so UI shows it, keep in DB
          item.syncStatus = 'SYNC FAILED - VALIDATION ERROR';
          await savePendingReport(item);
        } else {
          console.warn("Network error during sync, will retry later.");
          item.syncStatus = 'PENDING SYNC';
          await savePendingReport(item);
          syncError = true;
          break; // Stop syncing on actual network/server error
        }
      }
    }
    
    await loadQueue();
    setReports(newReports);
    
    if (successCount > 0) {
      setSyncStatusMsg(`${successCount} REPORT${successCount > 1 ? 'S' : ''} SYNCED`);
      setTimeout(() => setSyncStatusMsg(''), 3000);
    } else if (syncError) {
      setSyncStatusMsg('SYNC FAILED');
      setTimeout(() => setSyncStatusMsg(''), 3000);
    } else {
      setSyncStatusMsg('');
    }
    
    setIsSyncing(false);
  };

  useEffect(() => {
    if (online) syncOfflineQueue();
  }, [online, offlineQueue.length]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSyncStatusMsg('');
    
    const payload = {
      report_text: `[${formData.hazardType}] ${formData.description}`,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      reporter_type: 'field_officer',
      image_url: 'base64:placeholder',
      syncStatus: 'PENDING SYNC'
    };

    if (!online) {
      await savePendingReport(payload);
      await loadQueue();
      setSyncStatusMsg('SAVED OFFLINE');
      setIsSubmitting(false);
      setFormData(f => ({ ...f, description: '' }));
      return;
    }

    try {
      const res = await geoAPI.submitReport(payload);
      setReports([res, ...reports]);
      setFormData(f => ({ ...f, description: '' }));
      setSyncStatusMsg('REPORT SYNCED');
      setTimeout(() => setSyncStatusMsg(''), 3000);
    } catch (err) {
      if (err.message && err.message.includes("422")) {
         setSyncStatusMsg('SYNC FAILED - VALIDATION ERROR');
         payload.syncStatus = 'SYNC FAILED - VALIDATION ERROR';
      } else {
         setSyncStatusMsg('SAVED OFFLINE');
         payload.syncStatus = 'PENDING SYNC';
      }
      await savePendingReport(payload);
      await loadQueue();
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSeverityPrediction = (type) => {
    if (type === 'ROCKFALL' || type === 'LANDSLIDE') return 'CRITICAL';
    if (type === 'DEBRIS_FLOW') return 'HIGH';
    if (type === 'SLOPE_CRACK') return 'AMBER';
    return 'LOW';
  };

  return (
    <div className="sentinel-page">
      <header className="page-header flex-between">
        <div>
          <h1>Field Sentinel</h1>
          <p className="text-secondary">Submit ground-truth geological intelligence.</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          <div className={`status-pill ${online ? 'online' : 'offline'}`}>
             {online ? 'System Connected' : <><CloudOff size={14}/> Offline Mode</>}
          </div>
          {syncStatusMsg && (
             <div style={{ fontSize: '11px', fontWeight: 600, color: syncStatusMsg.includes('FAILED') ? '#FF3B30' : '#34C759', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {syncStatusMsg.includes('FAILED') ? <XCircle size={12}/> : (syncStatusMsg.includes('SYNCING') ? <RefreshCw size={12} className="spin"/> : <CheckCircle size={12}/>)}
                {syncStatusMsg}
             </div>
          )}
        </div>
      </header>

      <div className="sentinel-layout">
        <form className="report-form glass-panel" onSubmit={handleSubmit}>
          <h2 className="panel-section-title">NEW FIELD REPORT</h2>
          
          <div className="form-group">
            <label>Hazard Classification</label>
            <select 
              value={formData.hazardType} 
              onChange={e => setFormData({...formData, hazardType: e.target.value})}
            >
              <option value="SLOPE_CRACK">Slope Crack / Fissure</option>
              <option value="ROCKFALL">Active Rockfall</option>
              <option value="LANDSLIDE">Major Landslide</option>
              <option value="DEBRIS_FLOW">Debris Flow / Mudslide</option>
              <option value="SEEPAGE">Unusual Groundwater Seepage</option>
            </select>
          </div>

          <div className="form-group">
            <label>Geolocation</label>
            <div className="location-inputs">
              <input type="text" value={formData.latitude} onChange={e => setFormData({...formData, latitude: e.target.value})} placeholder="Lat" required/>
              <input type="text" value={formData.longitude} onChange={e => setFormData({...formData, longitude: e.target.value})} placeholder="Lng" required/>
              <button type="button" className="icon-btn" title="Get Current Location"><MapPin size={16}/></button>
            </div>
          </div>

          <div className="form-group">
            <label>Intelligence Description</label>
            <textarea 
              rows="4" 
              placeholder="Describe crack dimensions, speed of movement, proximity to structures..."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              required
            ></textarea>
          </div>

          <div className="photo-upload-area">
             <Camera size={24} className="text-secondary"/>
             <span style={{fontSize: '13px', color: 'var(--text-secondary)'}}>Tap to attach geo-tagged evidence</span>
          </div>

          <div className="severity-preview">
            <span style={{fontSize: '11px', color: 'var(--text-secondary)'}}>AI SEVERITY PREDICTION</span>
            <span className={`badge ${getSeverityPrediction(formData.hazardType).toLowerCase()}`}>
              {getSeverityPrediction(formData.hazardType)}
            </span>
          </div>

          <button type="submit" className="submit-btn" disabled={isSubmitting || !formData.description}>
             {isSubmitting ? <RefreshCw size={16} className="spin"/> : <Send size={16}/>}
             {online ? 'Transmit Intelligence' : 'Queue for Sync'}
          </button>
        </form>

        <div className="recent-reports glass-panel">
          <div className="flex-between" style={{marginBottom: '16px'}}>
            <h2 className="panel-section-title" style={{marginBottom: 0}}>RECENT REPORTS</h2>
            {offlineQueue.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="queue-badge"><CloudOff size={10}/> {offlineQueue.length} Queued</span>
                {online && (
                  <button 
                    onClick={syncOfflineQueue} 
                    disabled={isSyncing}
                    style={{
                      background: 'rgba(10, 132, 255, 0.2)', border: '1px solid rgba(10, 132, 255, 0.4)', 
                      color: '#0A84FF', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', 
                      fontWeight: 600, cursor: isSyncing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                    }}
                  >
                    <RefreshCw size={10} className={isSyncing ? "spin" : ""} /> SYNC NOW
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="report-feed">
             {offlineQueue.map((q, idx) => (
                <div key={`q-${q.localId || idx}`} className="report-card queued" style={{ borderColor: q.syncStatus?.includes('FAILED') ? 'rgba(255, 59, 48, 0.4)' : 'rgba(255,255,255,0.1)' }}>
                  <div className="flex-between">
                    <span className="badge" style={{ background: q.syncStatus?.includes('FAILED') ? 'rgba(255,59,48,0.2)' : 'rgba(255,255,255,0.1)', color: q.syncStatus?.includes('FAILED') ? '#FF3B30' : '#fff' }}>
                      {q.syncStatus || 'PENDING SYNC'}
                    </span>
                    <span className="text-secondary" style={{fontSize: '11px'}}>Waiting for Sync</span>
                  </div>
                  <h4 style={{ marginTop: '8px' }}>FIELD REPORT</h4>
                  <p>{q.report_text}</p>
                </div>
             ))}

             {loading && <div style={{padding: '16px'}}>Loading network reports...</div>}
             
             {!loading && reports.map((r, idx) => (
                <div key={r.report_id || idx} className="report-card">
                  <div className="flex-between">
                    <span className="text-mono" style={{fontSize: '10px', color: 'var(--text-secondary)'}}>{r.report_id}</span>
                    <span className="text-secondary" style={{fontSize: '11px'}}>{new Date(r.created_at).toLocaleTimeString()}</span>
                  </div>
                  <h4>{r.slm_analysis?.hazard_type ? r.slm_analysis.hazard_type.toUpperCase().replace('_', ' ') : 'FIELD REPORT'}</h4>
                  <p>{r.report_text}</p>
                  {r.linked_incident_id && (
                    <div className="linked-incident">
                       <AlertTriangle size={12}/> Linked to Incident {r.linked_incident_id}
                    </div>
                  )}
                </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
