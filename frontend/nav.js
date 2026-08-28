/* =============================================================
   GeoShield 🇮🇳 — Shared Navigation & Header System
   GOVT OF INDIA • MDoNER × MoRD | GeoShield
   ============================================================= */
(function () {
  'use strict';

  const NAV_TABS = [
    { id: 'index', name: '1. National Landing', href: 'index.html', icon: '🛰️' },
    { id: 'command-center', name: '2. 3D Command Center', href: 'command-center.html', icon: '🎛️' },
    { id: 'cascading-simulator', name: '3. Cascade Simulator', href: 'cascading-simulator.html', icon: '🌊' },
    { id: 'edge-sentinel', name: '4. Field Sentinel', href: 'edge-sentinel.html', icon: '📱' },
    { id: 'admin-governance', name: '5. Admin Governance', href: 'admin-governance.html', icon: '🏛️' },
    { id: 'resettlement-allocator', name: '6. Resettlement', href: 'resettlement-allocator.html', icon: '🏘️' }
  ];

  function getActiveRegion() {
    if (window.getDefaultRegion) {
      return window.getDefaultRegion();
    }
    const saved = localStorage.getItem('geo360_selected_region') || localStorage.getItem('active_region');
    if (window.getRegionById && saved) {
      return window.getRegionById(saved);
    }
    return { id: 'sikkim', name: 'Sikkim', capital: 'Gangtok' };
  }

  function buildNav(currentPage) {
    const activeReg = getActiveRegion();
    const currentFile = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();

    return `
<header class="gnav-root" role="banner">
  <div class="gnav-bar">

    <!-- Brand -->
    <a href="index.html" class="gnav-brand">
      <span class="gnav-flag">🇮🇳</span>
      <div class="gnav-brand-text">
        <span class="gnav-title">GeoShield</span>
        <span class="gnav-subtext">GOVT OF INDIA • MDoNER × MoRD</span>
      </div>
      <span class="gnav-brand-badge">36 STATES/UTs</span>
    </a>

    <!-- Center Navigation Tabs -->
    <nav class="gnav-tabs-container" aria-label="Main navigation">
      <ul class="gnav-tabs-list" role="menubar">
        ${NAV_TABS.map(tab => {
          const isActive = currentFile.includes(tab.href) || (currentFile === '' && tab.href === 'index.html');
          return `
            <li class="gnav-tab-item" role="none">
              <a href="${tab.href}" class="gnav-tab-link ${isActive ? 'is-active' : ''}" role="menuitem">
                <span class="gnav-tab-icon">${tab.icon}</span>
                <span class="gnav-tab-label">${tab.name}</span>
              </a>
            </li>
          `;
        }).join('')}
      </ul>
    </nav>

    <!-- Right Actions & Telemetry -->
    <div class="gnav-actions">
      <!-- 15-Layer Architecture Trigger -->
      <button class="gnav-btn-arch" onclick="window.GEO_NAV.showArchModal()" title="View 15-Layer Official Architecture Specification">
        <span>⚙️ 15-Layer Spec</span>
      </button>

      <!-- Active Sector Indicator -->
      <button class="gnav-sector-pill" onclick="window.GEO_AUTH ? window.GEO_AUTH.showLoginModal() : null" id="gnavSectorBtn" title="Current Active State/Territory">
        <span class="gnav-pulse-dot"></span>
        <span id="gnavActiveSectorText">📍 ${activeReg.name}</span>
      </button>

      <!-- Live / Demo Mode Toggle -->
      <button id="gnavDataModeBtn" class="gnav-mode-pill" onclick="window.GEO_API ? window.GEO_API.setMode(window.GEO_API.getMode() === 'LIVE' ? 'DEMO' : 'LIVE') : null" title="Toggle Live FastAPI vs Offline Demo Mode">
        <span id="gnavDataModeDot">🟢</span>
        <span id="gnavDataModeText">MODE: LIVE</span>
      </button>

      <!-- SAR Radar Badge -->
      <div class="gnav-sar-badge" title="Sentinel-1 C-Band Synthetic Aperture Radar Active">
        <span class="sar-icon">🛰️</span>
        <span>SAR: ACTIVE</span>
      </div>

      <!-- JWT Access Gateway CTA -->
      <button onclick="window.GEO_AUTH ? window.GEO_AUTH.showLoginModal() : null" class="gnav-cta-btn" aria-label="Open Role Access Gateway">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        <span>ACCESS GATEWAY</span>
      </button>
    </div>

  </div>
</header>

<!-- 15-Layer Official Architecture Modal Mount -->
<div id="geoArchModal" class="geo-arch-modal-overlay">
  <div class="geo-arch-modal-card">
    <div class="geo-arch-modal-header">
      <div>
        <div class="geo360-badge" style="background:rgba(245,158,11,0.15); color:#f59e0b; border:1px solid rgba(245,158,11,0.4);">
          GOVT OF INDIA • MDoNER × MoRD
        </div>
        <h2>GeoShield 15-Layer Official Architecture</h2>
        <p>End-to-End Mission Architecture from Spaceborne InSAR to Cadastral Resettlement</p>
      </div>
      <button class="geo360-modal-close" onclick="window.GEO_NAV.closeArchModal()">&times;</button>
    </div>
    <div class="geo-arch-modal-body">
      <div class="arch-layer-grid">
        <div class="arch-layer-box"><span class="layer-num">01</span><h4>Spaceborne InSAR (Sentinel-1 SAR)</h4><p>Interferometric phase delta detection for sub-cm hill creep.</p></div>
        <div class="arch-layer-box"><span class="layer-num">02</span><h4>IMD Doppler Radar Nowcasting</h4><p>High-resolution precipitation scanning (1 km² mesh grid).</p></div>
        <div class="arch-layer-box"><span class="layer-num">03</span><h4>30m ALOS PALSAR / CartoDEM</h4><p>Digital elevation gradient, aspect, and flow accumulation.</p></div>
        <div class="arch-layer-box"><span class="layer-num">04</span><h4>PostGIS 3.4 Cadastral Index</h4><p>Spatial polygon join for 74,320+ Khasra/Dag land parcels.</p></div>
        <div class="arch-layer-box"><span class="layer-num">05</span><h4>FastAPI Async REST & WS Core</h4><p>Sub-50ms inference bridge and session token orchestrator.</p></div>
        <div class="arch-layer-box"><span class="layer-num">06</span><h4>Trained XGBoost Susceptibility</h4><p>Geotechnical slope factor of safety (Fs) evaluation.</p></div>
        <div class="arch-layer-box"><span class="layer-num">07</span><h4>LSTM Temporal Rainfall Decay</h4><p>72h antecedent rainfall accumulation and pore pressure.</p></div>
        <div class="arch-layer-box"><span class="layer-num">08</span><h4>Bayesian Geo-Evidence Fusion</h4><p>Multimodal confidence scoring (96.4% empirical accuracy).</p></div>
        <div class="arch-layer-box"><span class="layer-num">09</span><h4>Dynamic Runout Physics Engine</h4><p>Debris reach, highway severance, and lake inundation pool.</p></div>
        <div class="arch-layer-box"><span class="layer-num">10</span><h4>MobileNetV3 WASM Field Edge AI</h4><p>On-device offline tension crack vs spam pothole triage.</p></div>
        <div class="arch-layer-box"><span class="layer-num">11</span><h4>Tactical Evacuation Compass</h4><p>Real-time bearing & descent calculation to safe shelters.</p></div>
        <div class="arch-layer-box"><span class="layer-num">12</span><h4>Bhashini Voice Dispatch Engine</h4><p>Multi-lingual automated IVR warning calls (12 languages).</p></div>
        <div class="arch-layer-box"><span class="layer-num">13</span><h4>District Magistrate Gov Console</h4><p>Level-3 Red Alert declaration & statutory violation notices.</p></div>
        <div class="arch-layer-box"><span class="layer-num">14</span><h4>PFMS Direct Benefit Transfer (DBT)</h4><p>Automated relief ledger generation with cryptographic audit.</p></div>
        <div class="arch-layer-box"><span class="layer-num">15</span><h4>5-Criteria MCDA Resettlement Engine</h4><p>Multi-criteria safe government parcel allocation & tenure transfer.</p></div>
      </div>
    </div>
  </div>
</div>
    `;
  }

  window.GEO_NAV = {
    init: function () {
      let mount = document.getElementById('gnavMount');
      if (!mount) {
        mount = document.createElement('div');
        mount.id = 'gnavMount';
        document.body.prepend(mount);
      }
      mount.innerHTML = buildNav();

      this.syncModeUI();
      this.syncRegionUI();

      window.addEventListener('dataModeChanged', (e) => {
        this.syncModeUI(e.detail.mode);
      });

      window.addEventListener('regionChanged', (e) => {
        this.syncRegionUI(e.detail);
      });
    },

    syncModeUI: function(mode) {
      mode = mode || (window.GEO_API ? window.GEO_API.getMode() : 'LIVE');
      const dot = document.getElementById('gnavDataModeDot');
      const text = document.getElementById('gnavDataModeText');
      const btn = document.getElementById('gnavDataModeBtn');
      if (dot && text && btn) {
        if (mode === 'LIVE') {
          dot.textContent = '🟢';
          text.textContent = 'MODE: LIVE';
          btn.style.borderColor = 'rgba(34, 197, 94, 0.4)';
          btn.style.color = '#22c55e';
          btn.style.background = 'rgba(34, 197, 94, 0.1)';
        } else {
          dot.textContent = '🟡';
          text.textContent = 'MODE: DEMO';
          btn.style.borderColor = 'rgba(245, 158, 11, 0.4)';
          btn.style.color = '#f59e0b';
          btn.style.background = 'rgba(245, 158, 11, 0.1)';
        }
      }
    },

    syncRegionUI: function(reg) {
      reg = reg || getActiveRegion();
      const el = document.getElementById('gnavActiveSectorText');
      if (el && reg) {
        el.textContent = `📍 ${reg.name}`;
      }
    },

    showArchModal: function() {
      const m = document.getElementById('geoArchModal');
      if (m) m.classList.add('active');
    },

    closeArchModal: function() {
      const m = document.getElementById('geoArchModal');
      if (m) m.classList.remove('active');
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.GEO_NAV.init());
  } else {
    window.GEO_NAV.init();
  }
})();
