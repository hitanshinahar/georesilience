import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Map as MapIcon, 
  BarChart2, 
  Layers, 
  Camera, 
  AlertTriangle, 
  Bell, 
  Settings,
  CheckCircle,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import './Sidebar.css';
import { geoAPI } from '../../api/client';

const navItems = [
  { path: '/command-center', label: 'Command Center', icon: MapIcon },
  { path: '/risk-analysis', label: 'Risk Analysis', icon: BarChart2 },
  { path: '/simulator', label: 'Cascading Simulation', icon: Layers },
  { path: '/sentinel', label: 'Field Sentinel', icon: Camera },
  { path: '/incidents', label: 'Incidents', icon: AlertTriangle },
  { path: '/alerts', label: 'Alerts', icon: Bell },
  { path: '/system', label: 'System', icon: Settings },
];

export function Sidebar({ isOpen, onToggle }) {
  const [mode, setMode] = React.useState(geoAPI.getMode());

  React.useEffect(() => {
    const handleModeChange = (e) => setMode(e.detail.mode);
    window.addEventListener('dataModeChanged', handleModeChange);
    return () => window.removeEventListener('dataModeChanged', handleModeChange);
  }, []);

  const setLiveMode = () => geoAPI.setMode('LIVE');
  const setDemoMode = () => geoAPI.setMode('DEMO');

  return (
    <aside className={`sidebar ${isOpen ? 'expanded' : 'collapsed'}`}>
      <div className="sidebar-header">
        <div className="logo-group">
          <div className="logo-icon">🛡️</div>
          {isOpen && (
            <div className="logo-text">
              <div className="brand">GeoShield</div>
            </div>
          )}
        </div>

        <button 
          className="sidebar-toggle-btn" 
          onClick={onToggle} 
          title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          aria-label={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          {isOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
        </button>
      </div>
      
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink 
              key={item.path} 
              to={item.path} 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              title={!isOpen ? item.label : undefined}
            >
              <Icon size={18} className="nav-icon" />
              {isOpen && <span className="nav-label">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>
      
      <div className="sidebar-mode-toggle">
        {isOpen ? (
          <>
            <button 
              className={`mode-btn ${mode === 'LIVE' ? 'active live' : ''}`}
              onClick={setLiveMode}
            >
              {mode === 'LIVE' && <span className="live-dot-small"></span>} LIVE
            </button>
            <button 
              className={`mode-btn ${mode === 'DEMO' ? 'active demo' : ''}`}
              onClick={setDemoMode}
            >
              DEMO
            </button>
          </>
        ) : (
          <button 
            className={`mode-btn compact ${mode === 'LIVE' ? 'active live' : 'active demo'}`}
            onClick={() => geoAPI.setMode(mode === 'LIVE' ? 'DEMO' : 'LIVE')}
            title={`Mode: ${mode} (Click to toggle)`}
          >
            {mode === 'LIVE' ? <span className="live-dot-small"></span> : 'D'}
          </button>
        )}
      </div>

      {isOpen && (
        <>
          <div className="data-provenance">
            <div className="prov-title">DATA PROVENANCE</div>
            <div className="prov-item"><span className="prov-dot live-dot-small"></span> <span>LIVE Backend Data</span></div>
            <div className="prov-item"><span className="prov-dot" style={{backgroundColor: '#34C759'}}></span> <span>Simulated Input</span></div>
            <div className="prov-item"><span className="prov-dot" style={{backgroundColor: '#FF9500'}}></span> <span>Prototype Assumption</span></div>
            <div className="prov-item"><span className="prov-dot" style={{backgroundColor: '#AF52DE'}}></span> <span>Demo / Local Data</span></div>
          </div>

          <div className="system-status">
            <div className="status-header">
              <CheckCircle size={16} className="text-low" />
              <span>System Status</span>
            </div>
            <div className="status-desc">All core systems operational</div>
          </div>

          <div className="last-updated">
            <div className="updated-label">Last updated</div>
            <div className="updated-time">30 sec ago</div>
          </div>
        </>
      )}
    </aside>
  );
}
