import React from 'react';
import { Search, Bell, Cloud, Sun, Globe } from 'lucide-react';
import './Topbar.css';
import { geoAPI } from '../../api/client';

export function Topbar({ onReplayIntro }) {
  const [mode, setMode] = React.useState(geoAPI.getMode());

  React.useEffect(() => {
    const handleModeChange = (e) => setMode(e.detail.mode);
    window.addEventListener('dataModeChanged', handleModeChange);
    return () => window.removeEventListener('dataModeChanged', handleModeChange);
  }, []);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="search-bar">
          <Search size={16} className="text-secondary" />
          <input type="text" placeholder="Search locations, districts, incidents..." />
          <div className="shortcut">⌘K</div>
        </div>
      </div>
      
      <div className="topbar-right">
        <div className="top-status">
          <span className={`live-dot-small ${mode === 'LIVE' ? 'live' : 'demo'}`}></span>
          <span style={{color: mode === 'LIVE' ? 'var(--risk-low)' : '#fff', fontWeight: 600}}>{mode}</span>
        </div>
        
        <div className="divider"></div>
        
        {onReplayIntro && (
          <button className="icon-btn" onClick={onReplayIntro} title="Replay 3D Earth Loader Intro">
            <Globe size={18} />
          </button>
        )}

        <button className="icon-btn" title="Weather Radar">
          <Cloud size={18} />
        </button>

        <button className="icon-btn" title="Light / Dark Mode">
          <Sun size={18} />
        </button>
        
        <button className="icon-btn" title="Alerts & Notifications">
          <Bell size={18} />
          <span className="notification-badge"></span>
        </button>
        
        <div className="user-profile">
          <img src="https://i.pravatar.cc/100?img=47" alt="VisionHackers" className="avatar-img" />
          <div className="user-info">
            <span className="user-name">VisionHackers</span>
            <span className="user-role">Team ▾</span>
          </div>
        </div>
      </div>
    </header>
  );
}
