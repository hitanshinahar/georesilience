/**
 * GeoResilience-360 Authentication & Session Management Module
 * Provides JWT simulation, Region-Aware Context, and 1-Click Demo Login Flow
 */

window.GEO_AUTH = {
  getCurrentSession: function() {
    const sessionStr = localStorage.getItem('geo360_session');
    if (sessionStr) {
      try {
        return JSON.parse(sessionStr);
      } catch (e) {
        localStorage.removeItem('geo360_session');
      }
    }
    // Default guest session
    const defaultReg = window.getDefaultRegion ? window.getDefaultRegion() : { id: 'SK', name: 'Sikkim' };
    return {
      token: 'guest-token-360',
      user: {
        name: 'Demo Operator',
        role: 'gis_engineer',
        roleLabel: 'GIS & Geotech Specialist'
      },
      region: defaultReg
    };
  },

  login: function(role, customRegionId) {
    const region = customRegionId 
      ? window.getRegionById(customRegionId) 
      : (window.getDefaultRegion ? window.getDefaultRegion() : { id: 'SK', name: 'Sikkim' });
    
    let roleLabel = 'GIS Specialist';
    let targetPage = 'cascading-simulator.html';
    
    if (role === 'admin') {
      roleLabel = 'State Disaster Authority Admin';
      targetPage = 'admin-governance.html';
    } else if (role === 'citizen') {
      roleLabel = 'Citizen / Field Sentinel';
      targetPage = 'edge-sentinel.html';
    } else if (role === 'geotech' || role === 'gis_engineer') {
      roleLabel = 'Senior Geotech Engineer';
      targetPage = 'risk-engine.html';
    }

    const session = {
      token: 'jwt-sim-' + Date.now() + '-' + role,
      user: {
        name: role === 'admin' ? 'District Collector / Magistrate' : (role === 'citizen' ? 'Field Sentinel User' : 'Senior Geotech Specialist'),
        role: role,
        roleLabel: roleLabel
      },
      region: region,
      timestamp: new Date().toISOString()
    };

    localStorage.setItem('geo360_session', JSON.stringify(session));
    localStorage.setItem('geo360_selected_region', region.id);
    localStorage.setItem('geo360_selected_region_name', region.name);

    if (window.navigateTo) {
      window.navigateTo(targetPage);
    } else {
      window.location.href = targetPage;
    }
  },

  logout: function() {
    localStorage.removeItem('geo360_session');
    if (window.navigateTo) {
      window.navigateTo('index.html');
    } else {
      window.location.href = 'index.html';
    }
  },

  showLoginModal: function(targetRole) {
    let modal = document.getElementById('geo360-login-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'geo360-login-modal';
      modal.className = 'geo360-modal-overlay';
      document.body.appendChild(modal);
    }

    const currentReg = window.getDefaultRegion();
    modal.innerHTML = `
      <div class="geo360-modal-card">
        <button class="geo360-modal-close" onclick="document.getElementById('geo360-login-modal').classList.remove('active')">&times;</button>
        <div class="geo360-modal-header">
          <div class="geo360-badge">SECURE PLATFORM GATEWAY</div>
          <h2>GeoResilience-360 Region Center</h2>
          <p>Accessing Workspace for Active Sentinel Zone</p>
        </div>

        <div class="geo360-region-banner">
          <span class="banner-icon">📍</span>
          <div class="banner-text">
            <strong>Active Target Region:</strong> ${currentReg.name} (${currentReg.type})
            <div class="banner-sub">Primary Hazard: ${currentReg.hazard} | Record Type: ${currentReg.landTerm}</div>
          </div>
        </div>

        <div class="geo360-modal-body">
          <form class="geo360-login-form" id="loginForm" onsubmit="event.preventDefault(); window.GEO_AUTH.login('gis_engineer', '${currentReg.id}')">
            <div class="geo360-input-group">
              <label for="userId">National ID / Username</label>
              <input type="text" id="userId" placeholder="Enter ID (e.g., ADM-8912)" required>
            </div>
            <div class="geo360-input-group">
              <label for="password">Secure Password</label>
              <input type="password" id="password" placeholder="••••••••" required>
            </div>
            <button type="submit" class="geo360-submit-btn">Secure Login</button>
          </form>

          <div class="geo360-divider"><span>OR FAST-TRACK DEMO ACCESS</span></div>

          <label>Select Authorization Role & Access Portal:</label>
          <div class="geo360-demo-roles">
            <button class="geo360-role-btn ${targetRole === 'gis_engineer' ? 'recommended' : ''}" onclick="window.GEO_AUTH.login('gis_engineer', '${currentReg.id}')">
              <span class="role-icon">👨‍💻</span>
              <span class="role-title">GIS & Geotech Engineer</span>
              <span class="role-desc">Full 3D InSAR, Slope Stability (FoS) & Land Selection</span>
            </button>
            <button class="geo360-role-btn ${targetRole === 'admin' ? 'recommended' : ''}" onclick="window.GEO_AUTH.login('admin', '${currentReg.id}')">
              <span class="role-icon">🏛️</span>
              <span class="role-title">Admin / Governance</span>
              <span class="role-desc">Authorize Evacuations, Damage Recon & Resettlement Matrix</span>
            </button>
            <button class="geo360-role-btn ${targetRole === 'citizen' ? 'recommended' : ''}" onclick="window.GEO_AUTH.login('citizen', '${currentReg.id}')">
              <span class="role-icon">📱</span>
              <span class="role-title">Field Sentinel / Citizen</span>
              <span class="role-desc">Submit Crack Verification, PWA Offline Queue Sync</span>
            </button>
          </div>
        </div>

        <div class="geo360-modal-footer">
          <span>⚡ Platform Access Gateway Secured</span>
        </div>
      </div>
    `;

    setTimeout(() => modal.classList.add('active'), 10);
  }
};
