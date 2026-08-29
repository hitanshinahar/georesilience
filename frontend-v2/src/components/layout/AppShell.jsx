import React, { useEffect, useRef, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { EarthLoader } from './EarthLoader';
import { geoAPI } from '../../api/client';
import './AppShell.css';

export function AppShell() {
  const notifiedAlerts = useRef(new Set());
  const [showLoader, setShowLoader] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLoaderComplete = () => {
    setShowLoader(false);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  useEffect(() => {
    const handleReplay = () => setShowLoader(true);
    window.addEventListener('replayEarthLoader', handleReplay);

    const checkAlerts = async () => {
      try {
        const res = await geoAPI.getAlerts();
        const activeAlerts = res.data.filter(a => 
          a.status === 'ACTIVE' && 
          (a.severity === 'CRITICAL' || a.severity === 'HIGH')
        );

        for (const alert of activeAlerts) {
          if (!notifiedAlerts.current.has(alert.alert_id || alert.id)) {
            notifiedAlerts.current.add(alert.alert_id || alert.id);
            
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification("GeoShield Critical Alert", {
                body: `⚠️ ${alert.title || 'Hazard Detected'}\nSeverity: ${alert.severity}`,
                icon: '/vite.svg'
              });
            }
          }
        }
      } catch (e) {
        // Silently fail polling on error
      }
    };

    const interval = setInterval(() => {
      checkAlerts();
      window.dispatchEvent(new CustomEvent('dataModeChanged', { detail: { mode: geoAPI.getMode() } }));
    }, 10000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('replayEarthLoader', handleReplay);
    };
  }, []);

  return (
    <div className={`app-shell ${isSidebarOpen ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
      {showLoader && <EarthLoader onComplete={handleLoaderComplete} />}

      <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
      
      <div className="main-content">
        <Topbar onReplayIntro={() => setShowLoader(true)} />
        <main className="page-container">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
