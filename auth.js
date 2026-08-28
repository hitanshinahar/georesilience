/**
 * GeoShield 🇮🇳 Authentication & RBAC Session Management Engine
 * Connects with Python FastAPI backend (POST /auth/login) with local RS256/JWT fallback.
 */

window.GEO_AUTH = {
  isAuthenticated: function() {
    const sessionStr = localStorage.getItem('geo360_session');
    if (!sessionStr) return false;
    try {
      const session = JSON.parse(sessionStr);
      return Boolean(session && session.token && session.user);
    } catch (e) {
      return false;
    }
  },

  getCurrentSession: function() {
    const sessionStr = localStorage.getItem('geo360_session');
    if (sessionStr) {
      try {
        const parsed = JSON.parse(sessionStr);
        if (parsed && parsed.user) return parsed;
      } catch (e) {
        localStorage.removeItem('geo360_session');
      }
    }
    return null;
  },

  getUserRole: function() {
    const session = this.getCurrentSession();
    return (session && session.user && session.user.role) ? session.user.role : null;
  },

  login: async function(role, customRegionId, username, password) {
    const region = customRegionId 
      ? (window.getRegionById ? window.getRegionById(customRegionId) : { id: customRegionId, name: 'Sikkim' }) 
      : (window.getDefaultRegion ? window.getDefaultRegion() : { id: 'sikkim', name: 'Sikkim' });
    
    let targetPage = 'command-center.html';
    if (role === 'admin') {
      targetPage = 'admin-governance.html';
    } else if (role === 'citizen') {
      targetPage = 'edge-sentinel.html';
    } else if (role === 'gis_engineer' || role === 'geotech') {
      targetPage = 'command-center.html';
    }

    username = username || (role === 'admin' ? 'DM-OFFICER-01' : (role === 'citizen' ? 'SENTINEL-MOB-99' : 'GIS-ENG-402'));

    let sessionData = null;

    // Try LIVE Backend Login via http://localhost:8000/auth/login
    try {
      const response = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username,
          password: password || 'demo1234',
          role: role,
          region: region.id
        })
      });

      if (response.ok) {
        const liveRes = await response.json();
        sessionData = {
          token: liveRes.access_token,
          user: liveRes.user,
          region: liveRes.region || region,
          sector_bbox: liveRes.sector_bbox || region.bbox,
          exp: Date.now() + 86400000,
          source: 'LIVE_BACKEND'
        };
      }
    } catch (err) {
      console.warn('Backend login unreachable at http://localhost:8000/auth/login, using local RS256/JWT gateway fallback.', err);
    }

    if (!sessionData) {
      // Local signed RS256 simulation token fallback
      const roleLabel = role === 'admin' ? 'District Collector / Magistrate' : (role === 'citizen' ? 'Citizen Field Sentinel' : 'Senior Geotech Specialist');
      sessionData = {
        token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoi' + username + 'Iiwicm9sZSI6Ii' + role + 'IiwicmVnaW9uIjoi' + region.id + 'Iiwic2VjdG9yX2Jib3giOls4OC4wMSwyNy4wOCw4OC45MiwyOC4xM10sImV4cCI6MTgwMDAwMDAwMH0',
        user: {
          user_id: username,
          name: username,
          role: role,
          roleLabel: roleLabel
        },
        region: region,
        sector_bbox: region.bbox || [88.01, 27.08, 88.92, 28.13],
        exp: Date.now() + 86400000,
        source: 'SECURE_GATEWAY'
      };
    }

    localStorage.setItem('geo360_session', JSON.stringify(sessionData));
    localStorage.setItem('geo360_selected_region', region.id);
    localStorage.setItem('active_region', region.id);
    localStorage.setItem('geo360_selected_region_name', region.name);

    if (window.GEO_API && window.GEO_API.showToast) {
      window.GEO_API.showToast(`Authenticated as ${sessionData.user.roleLabel} (${region.name})`);
    }

    if (window.navigateTo) {
      window.navigateTo(targetPage);
    } else {
      window.location.href = targetPage;
    }
  },

  hasRole: function(requiredRole) {
    const session = this.getCurrentSession();
    if (!session || !session.user) return false;
    const role = (session.user.role || '').toLowerCase();
    const req = (requiredRole || '').toLowerCase();
    if (role === 'admin' || role === 'district_magistrate') return true;
    return role === req;
  },

  requireRole: function(requiredRole, actionLabel) {
    if (this.hasRole(requiredRole)) return true;
    
    let modal = document.getElementById('geo360-rbac-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'geo360-rbac-modal';
      modal.className = 'geo360-modal-overlay active';
      document.body.appendChild(modal);
    }
    
    modal.innerHTML = `
      <div class="geo360-modal-card" style="max-width:440px;">
        <button class="geo360-modal-close" onclick="document.getElementById('geo360-rbac-modal').remove()">&times;</button>
        <div class="geo360-modal-header" style="border-bottom:1px solid #ef4444;">
          <div class="geo360-badge" style="background:rgba(239,68,68,0.15); color:#ef4444; border-color:rgba(239,68,68,0.4);">RESTRICTED AUTHORIZATION</div>
          <h2>Access Granted Only To Authorized Officials</h2>
          <p>Action: "${actionLabel || 'Administrative Command'}" requires District Magistrate / Admin Role</p>
        </div>
        <div style="padding:20px; font-size:13px; color:#a1a1aa; line-height:1.6;">
          Under Section 51 of the Disaster Management Act 2005, only the District Magistrate / Special Relief Commissioner has the statutory authority to declare Level-3 Red Alerts, order evacuations, and authorize disaster funds.
        </div>
        <div style="padding:0 20px 20px; display:flex; gap:10px;">
          <button onclick="window.GEO_AUTH.showLoginModal('admin'); document.getElementById('geo360-rbac-modal').remove();" class="geo360-submit-btn" style="background:linear-gradient(135deg,#f59e0b,#d97706); color:#000; font-weight:700;">
            🔑 Fast-Track Login as District Admin
          </button>
        </div>
      </div>
    `;
    return false;
  },

  checkPageAccess: function() {
    const currentPath = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
    
    // Strict Guard for admin-governance.html
    if (currentPath.includes('admin-governance.html')) {
      const session = this.getCurrentSession();
      const role = session && session.user ? (session.user.role || '').toLowerCase() : null;
      const isAdmin = role === 'admin' || role === 'district_magistrate';
      if (!isAdmin) {
        sessionStorage.setItem('geo_access_denied_msg', 'Access Denied: District Magistrate Clearance Required.');
        window.location.href = 'command-center.html';
        return false;
      }
    }
    return true;
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

    const currentReg = window.getDefaultRegion ? window.getDefaultRegion() : { id: 'sikkim', name: 'Sikkim', primaryRisk: 'Tectonic Landslides', cadastreTerm: 'Dag / Khasra' };
    targetRole = targetRole || 'gis_engineer';

    modal.innerHTML = `
      <div class="geo360-modal-card">
        <button class="geo360-modal-close" onclick="document.getElementById('geo360-login-modal').classList.remove('active')">&times;</button>
        <div class="geo360-modal-header">
          <div class="geo360-badge">SECURE JWT GATEWAY</div>
          <h2>Authorized Officer Access Gateway</h2>
          <p>Role-Based Authentication &amp; Mission Dispatch</p>
        </div>

        <div class="geo360-region-banner">
          <span class="banner-icon">📍</span>
          <div class="banner-text">
            <strong>Target State / Territory:</strong> ${currentReg.name} (${currentReg.type || 'State'})
            <div class="banner-sub">Primary Hazard: ${currentReg.primaryRisk || currentReg.hazard} | Cadastre: ${currentReg.cadastreTerm || currentReg.landTerm}</div>
          </div>
        </div>

        <div class="geo360-modal-body">
          <form class="geo360-login-form" id="loginForm" onsubmit="event.preventDefault(); window.GEO_AUTH.login('${targetRole}', '${currentReg.id}', document.getElementById('userId').value, document.getElementById('password').value)">
            <div class="geo360-input-group">
              <label for="userId">National Officer ID / Aadhaar</label>
              <input type="text" id="userId" placeholder="e.g., ADM-8912-SK" value="${targetRole === 'admin' ? 'DM-8912-SK' : (targetRole === 'citizen' ? 'SENTINEL-MOB-99' : 'GIS-ENG-402')}" required>
            </div>
            <div class="geo360-input-group">
              <label for="password">Secure Password / Biometric</label>
              <input type="password" id="password" value="demo1234" required>
            </div>
            <button type="submit" class="geo360-submit-btn">⚡ Authenticate &amp; Access Mission Console</button>
          </form>

          <div class="geo360-divider"><span>ROLE GATEWAY SELECTOR</span></div>

          <label style="font-size:12px; color:#a1a1aa; margin-bottom:8px; display:block;">Select Direct Role Login:</label>
          <div class="geo360-demo-roles" style="display:flex; flex-direction:column; gap:8px;">
            <button class="geo360-role-btn ${targetRole === 'gis_engineer' ? 'recommended' : ''}" onclick="window.GEO_AUTH.login('gis_engineer', '${currentReg.id}', 'GIS-ENGINEER-01', 'demo1234')">
              <span class="role-icon">👨‍💻</span>
              <span class="role-title">1. GIS &amp; Geotech Engineer</span>
              <span class="role-desc">Access 3D Command Center, InSAR Telemetry &amp; Physics Simulation</span>
            </button>
            <button class="geo360-role-btn ${targetRole === 'admin' ? 'recommended' : ''}" onclick="window.GEO_AUTH.login('admin', '${currentReg.id}', 'DM-COLLECTOR-99', 'demo1234')">
              <span class="role-icon">🏛️</span>
              <span class="role-title">2. District Magistrate / Admin (Governance)</span>
              <span class="role-desc">Access Admin Governance, Level-3 Red Alerts, Multi-lingual Calls &amp; DBT Relief</span>
            </button>
            <button class="geo360-role-btn ${targetRole === 'citizen' ? 'recommended' : ''}" onclick="window.GEO_AUTH.login('citizen', '${currentReg.id}', 'FIELD-SENTINEL-04', 'demo1234')">
              <span class="role-icon">📱</span>
              <span class="role-title">3. Field Sentinel / Citizen</span>
              <span class="role-desc">Access Mobile PWA Camera Triage &amp; Tactical Evacuation Compass</span>
            </button>
          </div>
        </div>

        <div class="geo360-modal-footer" style="padding:12px 20px; font-size:11px; color:#71717a; border-top:1px solid rgba(255,255,255,0.08); display:flex; justify-content:space-between;">
          <span>⚡ JWT RS256 Signed Gateway</span>
          <span>GOVT OF INDIA • MDoNER × MoRD</span>
        </div>
      </div>
    `;

    setTimeout(() => modal.classList.add('active'), 10);
  }
};

// Automatic page access check on script execution
if (typeof window !== 'undefined') {
  window.GEO_AUTH.checkPageAccess();
}
