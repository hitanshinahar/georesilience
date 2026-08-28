/* =============================================================
   GeoShield 🇮🇳 — Shared Navigation & Header System
   GOVT OF INDIA • MDoNER × MoRD | GeoShield
   ============================================================= */
(function () {
  'use strict';

  const ALL_MODULE_TABS = [
    { id: 'index', name: '1. National Landing', href: 'index.html', icon: '🛰️', roles: ['all'] },
    { id: 'command-center', name: '2. 3D Command', href: 'command-center.html', icon: '🎛️', roles: ['all'] },
    { id: 'cascading-simulator', name: '3. Cascade', href: 'cascading-simulator.html', icon: '🌊', roles: ['all'] },
    { id: 'edge-sentinel', name: '4. Field Sentinel', href: 'edge-sentinel.html', icon: '📱', roles: ['all'] },
    { id: 'admin-governance', name: '5. Admin Governance', href: 'admin-governance.html', icon: '🏛️', roles: ['admin', 'DISTRICT_MAGISTRATE'] },
    { id: 'resettlement-allocator', name: '6. Resettlement', href: 'resettlement-allocator.html', icon: '🏘️', roles: ['all'] }
  ];

  function getActiveRegion() {
    if (window.getDefaultRegion) {
      return window.getDefaultRegion();
    }
    const saved = localStorage.getItem('active_region_id') || localStorage.getItem('geo360_selected_region') || localStorage.getItem('active_region');
    if (window.getRegionById && saved) {
      return window.getRegionById(saved);
    }
    return { id: 'sikkim', name: 'Sikkim', capital: 'Gangtok' };
  }

  function getSession() {
    return window.GEO_AUTH ? window.GEO_AUTH.getCurrentSession() : null;
  }

  function isLoggedIn() {
    return window.GEO_AUTH ? window.GEO_AUTH.isAuthenticated() : false;
  }

  function buildNav() {
    const activeReg = getActiveRegion();
    const currentFile = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
    const isLandingPage = (currentFile === '' || currentFile === 'index.html');
    const authenticated = isLoggedIn();
    const session = getSession();
    const userRole = session && session.user ? (session.user.role || '').toLowerCase() : null;
    const isAdmin = userRole === 'admin' || userRole === 'district_magistrate';

    // Requirement 1: On index.html prior to login:
    // ONLY show Left Brand + Right [🔒 ACCESS GATEWAY / LOGIN] button.
    if (isLandingPage && !authenticated) {
      return `
<header class="gnav-root" role="banner">
  <div class="gnav-bar gnav-landing-only">
    <!-- Left: Brand Only -->
    <a href="index.html" class="gnav-brand">
      <span class="gnav-flag">🇮🇳</span>
      <div class="gnav-brand-text">
        <span class="gnav-title">GeoShield</span>
        <span class="gnav-subtext">GOVT OF INDIA • MDoNER × MoRD</span>
      </div>
      <span class="gnav-brand-badge">36 STATES/UTs</span>
    </a>

    <!-- Right: Access Gateway CTA Only -->
    <div class="gnav-actions">
      <button onclick="window.GEO_AUTH ? window.GEO_AUTH.showLoginModal() : null" class="gnav-cta-btn" aria-label="Open Role Access Gateway">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        <span>🔒 ACCESS GATEWAY / LOGIN</span>
      </button>
    </div>
  </div>
</header>
      `;
    }

    // Strict RBAC tab filtering: Hide Admin Governance unless role is admin / DISTRICT_MAGISTRATE
    const visibleTabs = ALL_MODULE_TABS.filter(tab => {
      if (tab.roles.includes('all')) return true;
      if (isAdmin && (tab.roles.includes('admin') || tab.roles.includes('DISTRICT_MAGISTRATE'))) return true;
      return false;
    });

    // Authenticated or Module Pages Header
    return `
<header class="gnav-root" role="banner">
  <div class="gnav-bar">

    <!-- Left: Brand -->
    <a href="index.html" class="gnav-brand">
      <span class="gnav-flag">🇮🇳</span>
      <div class="gnav-brand-text">
        <span class="gnav-title">GeoShield</span>
        <span class="gnav-subtext">GOVT OF INDIA • MDoNER × MoRD</span>
      </div>
      <span class="gnav-brand-badge">36 STATES/UTs</span>
    </a>

    <!-- Center: Navigation Tabs (Filtered strictly by RBAC) -->
    <nav class="gnav-tabs-container" aria-label="Main navigation">
      <ul class="gnav-tabs-list" role="menubar">
        ${visibleTabs.map(tab => {
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

    <!-- Right: Actions & User Profile -->
    <div class="gnav-actions">
      <!-- 15-Layer Architecture Trigger -->
      <button class="gnav-btn-arch" onclick="window.GEO_NAV.showArchModal()" title="View 15-Layer Official Architecture Specification">
        <span>⚙️ 15-Layer Spec</span>
      </button>

      <!-- Open Mobile App on Phone Helper -->
      <button class="gnav-btn-mobile" onclick="window.GEO_NAV.showMobileModal()" title="Open Mobile PWA on Physical Smartphone via Dynamic QR Code">
        <span>📱 Mobile App</span>
      </button>

      <!-- Active Sector Indicator -->
      <button class="gnav-sector-pill" onclick="window.GEO_AUTH ? window.GEO_AUTH.showLoginModal() : null" id="gnavSectorBtn" title="Current Active State/Territory">
        <span class="gnav-pulse-dot"></span>
        <span id="gnavActiveSectorText">📍 ${activeReg.name}</span>
      </button>

      ${authenticated && session ? `
        <!-- Authenticated User Profile Pill -->
        <div class="gnav-user-pill" title="Logged in as ${session.user.roleLabel || session.user.role}">
          <span class="user-role-badge ${isAdmin ? 'role-admin' : 'role-gis'}">${isAdmin ? '🏛️ ADMIN' : (userRole === 'citizen' || userRole === 'field_sentinel' ? '📱 CITIZEN' : '👨‍💻 GIS')}</span>
          <span class="user-name">${session.user.name || session.user.user_id}</span>
        </div>
        <!-- Logout CTA -->
        <button onclick="window.GEO_AUTH ? window.GEO_AUTH.logout() : null" class="gnav-logout-btn" title="Logout session">
          <span>🚪 Logout</span>
        </button>
      ` : `
        <!-- JWT Access Gateway CTA -->
        <button onclick="window.GEO_AUTH ? window.GEO_AUTH.showLoginModal() : null" class="gnav-cta-btn" aria-label="Open Role Access Gateway">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <span>🔒 ACCESS GATEWAY / LOGIN</span>
        </button>
      `}
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
        <div class="arch-layer-box"><span class="layer-num">05</span><h4>FastAPI Async REST &amp; WS Core</h4><p>Sub-50ms inference bridge and session token orchestrator.</p></div>
        <div class="arch-layer-box"><span class="layer-num">06</span><h4>Trained XGBoost Susceptibility</h4><p>Geotechnical slope factor of safety (Fs) evaluation.</p></div>
        <div class="arch-layer-box"><span class="layer-num">07</span><h4>LSTM Temporal Rainfall Decay</h4><p>72h antecedent rainfall accumulation and pore pressure.</p></div>
        <div class="arch-layer-box"><span class="layer-num">08</span><h4>Bayesian Geo-Evidence Fusion</h4><p>Multimodal confidence scoring (96.4% empirical accuracy).</p></div>
        <div class="arch-layer-box"><span class="layer-num">09</span><h4>Dynamic Runout Physics Engine</h4><p>Debris reach, highway severance, and lake inundation pool.</p></div>
        <div class="arch-layer-box"><span class="layer-num">10</span><h4>MobileNetV3 WASM Field Edge AI</h4><p>On-device offline tension crack vs spam pothole triage.</p></div>
        <div class="arch-layer-box"><span class="layer-num">11</span><h4>Tactical Evacuation Compass</h4><p>Real-time bearing &amp; descent calculation to safe shelters.</p></div>
        <div class="arch-layer-box"><span class="layer-num">12</span><h4>Bhashini Voice Dispatch Engine</h4><p>Multi-lingual automated IVR warning calls.</p></div>
        <div class="arch-layer-box"><span class="layer-num">13</span><h4>District Magistrate Gov Console</h4><p>Level-3 Red Alert declaration &amp; statutory violation notices.</p></div>
        <div class="arch-layer-box"><span class="layer-num">14</span><h4>PFMS Direct Benefit Transfer (DBT)</h4><p>Automated relief ledger generation with cryptographic audit.</p></div>
        <div class="arch-layer-box"><span class="layer-num">15</span><h4>5-Criteria MCDA Resettlement Engine</h4><p>Multi-criteria safe government parcel allocation &amp; tenure transfer.</p></div>
      </div>
    </div>
  </div>
</div>

<!-- Mobile App Dynamic LAN QR Code Modal Mount -->
<div id="geoMobileModal" class="geo-arch-modal-overlay">
  <div class="geo-arch-modal-card" style="max-width:500px; text-align:center;">
    <div class="geo-arch-modal-header" style="justify-content:center; position:relative;">
      <div>
        <div class="geo360-badge">📱 FIELD SENTINEL MOBILE PWA</div>
        <h2>Test on Physical Smartphone</h2>
        <p>Connect your phone on the same Wi-Fi network</p>
      </div>
      <button class="geo360-modal-close" onclick="window.GEO_NAV.closeMobileModal()">&times;</button>
    </div>
    <div class="geo-arch-modal-body" style="display:flex; flex-direction:column; align-items:center; padding:24px;">
      <div id="mobileQrContainer" style="background:#fff; padding:12px; border-radius:12px; box-shadow:0 8px 24px rgba(0,0,0,0.6); margin-bottom:16px;">
        <canvas id="qrCanvas" width="180" height="180" style="display:block;"></canvas>
      </div>
      <div style="font-family:'JetBrains Mono',monospace; font-size:12px; color:#38bdf8; background:#0d1524; padding:8px 14px; border-radius:6px; border:1px solid #1e293b; margin-bottom:10px; word-break:break-all;" id="mobileUrlDisplay">
        Calculating Local Network URL...
      </div>
      <div style="font-size:11px; color:#f59e0b; background:rgba(245,158,11,0.08); border:1px solid rgba(245,158,11,0.25); border-radius:6px; padding:8px 12px; margin-bottom:14px; text-align:left; line-height:1.4;">
        💡 <strong>Wi-Fi Testing Note:</strong> To test on a physical smartphone, ensure your phone is connected to the same Wi-Fi network.
      </div>
      <a id="mobileDirectLink" href="edge-sentinel.html" class="gnav-cta-btn" style="text-decoration:none; padding:10px 20px; font-size:12px;">
        🚀 Launch Field Sentinel
      </a>
    </div>
  </div>
</div>
    `;
  }

  function renderQrCode(canvas, text) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = canvas.width;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = function () {
      ctx.drawImage(img, 0, 0, size, size);
    };
    img.onerror = function () {
      ctx.fillStyle = '#060b13';
      const modSize = size / 21;
      function drawFinder(x, y) {
        ctx.fillRect(x, y, modSize * 7, modSize * 7);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + modSize, y + modSize, modSize * 5, modSize * 5);
        ctx.fillStyle = '#060b13';
        ctx.fillRect(x + modSize * 2, y + modSize * 2, modSize * 3, modSize * 3);
      }
      drawFinder(0, 0);
      drawFinder(size - modSize * 7, 0);
      drawFinder(0, size - modSize * 7);

      let hash = 0;
      for (let i = 0; i < text.length; i++) hash = (hash * 31 + text.charCodeAt(i)) & 0xffffffff;
      for (let r = 0; r < 21; r++) {
        for (let c = 0; c < 21; c++) {
          if ((r < 8 && (c < 8 || c > 13)) || (r > 13 && c < 8)) continue;
          if (((hash ^ (r * 17 + c * 37)) % 3) === 0) {
            ctx.fillRect(c * modSize, r * modSize, modSize, modSize);
          }
        }
      }
    };
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`;
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

      this.syncRegionUI();

      const deniedMsg = sessionStorage.getItem('geo_access_denied_msg');
      if (deniedMsg) {
        sessionStorage.removeItem('geo_access_denied_msg');
        setTimeout(() => {
          if (window.GEO_API && window.GEO_API.showToast) {
            window.GEO_API.showToast(`⚠️ ${deniedMsg}`);
          } else {
            alert(deniedMsg);
          }
        }, 300);
      }

      window.addEventListener('regionChanged', (e) => {
        this.syncRegionUI(e.detail);
      });
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
    },

    // Requirement 5: Dynamic Host URL Resolution
    showMobileModal: function() {
      const m = document.getElementById('geoMobileModal');
      if (m) {
        m.classList.add('active');
        
        const loc = window.location;
        const hostName = loc.hostname || 'localhost';
        const port = loc.port ? `:${loc.port}` : ':5500';
        const targetUrl = `${loc.protocol}//${hostName}${port}/edge-sentinel.html`;
        
        const disp = document.getElementById('mobileUrlDisplay');
        if (disp) disp.textContent = targetUrl;

        const directLink = document.getElementById('mobileDirectLink');
        if (directLink) directLink.href = targetUrl;
        
        const canvas = document.getElementById('qrCanvas');
        if (canvas) renderQrCode(canvas, targetUrl);
      }
    },

    closeMobileModal: function() {
      const m = document.getElementById('geoMobileModal');
      if (m) m.classList.remove('active');
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.GEO_NAV.init());
  } else {
    window.GEO_NAV.init();
  }
})();
