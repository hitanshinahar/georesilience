/* =============================================================
   GeoResilience-360 — Shared Navigation JS
   - Reka-UI nav: viewport dropdown + indicator + directional animation
   - Particle canvas
   - Page transitions
   - Animated counters
   - Card tilt
   - Stagger observer
   ============================================================= */
(function () {
  'use strict';

  /* ============================================================
     NAV DATA
     ============================================================ */
  const MODULES = [
    { icon: '🧭', location: 'Guwahati',  name: 'Command Center Map',   desc: '3D digital twin & incident feed',     href: 'command-center.html' },
    { icon: '🏛️', location: 'National',  name: 'Admin & Governance',   desc: 'Evacuation auth & damage records',    href: 'admin-governance.html' },
    { icon: '🌊', location: 'Dehradun',  name: 'Cascading Simulator',  desc: 'Multi-hazard chain modelling',        href: 'cascading-simulator.html' },
    { icon: '🏔️', location: 'Gangtok',   name: 'Dynamic Risk Engine',  desc: 'Khasra-level AI risk scoring',        href: 'risk-engine.html' },
    { icon: '⚡', location: 'Mumbai',    name: 'Edge AI Sentinel',     desc: 'On-device MobileNetV3 triage',        href: 'edge-sentinel.html' },
    { icon: '🏠', location: 'Munnar',    name: 'Resettlement Allocator', desc: 'Safe land scoring & allocation',    href: 'resettlement-allocator.html' },
  ];

  const PLATFORM_LINKS = [
    { icon: '📋', name: 'Problem Statement', desc: 'SIH26001 · MDoNER', href: '#' },
    { icon: '⚙️', name: 'Tech Stack',        desc: '15-layer architecture', href: '#' },
    { icon: '🛡️', name: 'GeoShield AI',      desc: 'Evidence-fusion engine', href: '#' },
    { icon: '📡', name: 'Data Sources',       desc: 'IMD, Sentinel-1, Open-Meteo', href: '#' },
    { icon: '🔐', name: 'Security & RBAC',    desc: 'PyJWT + RS256 + roles', href: '#' },
    { icon: '📖', name: 'Documentation',      desc: 'API reference & guides', href: '#' },
  ];

  /* ============================================================
     BUILD NAV HTML
     ============================================================ */
  function buildNav(currentPage) {
    const currentHref = (currentPage || '').replace('.html', '');
    const isIndex = !currentPage || currentPage === 'index.html';

    return `
<header class="gnav-root" role="banner">
  <div class="gnav-bar">

    <!-- Brand -->
    <a href="index.html" class="gnav-brand">
      GeoResilience-<b>360</b>
      <span class="gnav-brand-badge" id="gnavBrandBadge">LIVE · Sikkim Sentinel</span>
    </a>

    <!-- Desktop nav menu -->
    <nav class="gnav-menu" aria-label="Main navigation">
      <ul class="gnav-list" role="menubar">

        <li class="gnav-item" data-gnav-id="platform" role="none">
          <button class="gnav-trigger" role="menuitem" aria-haspopup="true" aria-expanded="false">
            Platform
            <svg class="gnav-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
        </li>

        <li class="gnav-item" data-gnav-id="modules" role="none">
          <button class="gnav-trigger" role="menuitem" aria-haspopup="true" aria-expanded="false">
            Modules
            <svg class="gnav-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
        </li>

        <li class="gnav-item" role="none">
          <a href="index.html" class="gnav-link ${isIndex ? 'is-active' : ''}" role="menuitem">Overview</a>
        </li>

      </ul>

      <!-- Sliding indicator -->
      <div class="gnav-indicator" aria-hidden="true"></div>
    </nav>

    <!-- Right actions -->
    <div class="gnav-actions">
      <button class="gnav-live" style="background:rgba(212,175,55,.1); border:1px solid rgba(212,175,55,.3); color:#d4af37; cursor:pointer; padding:6px 12px; border-radius:6px; font-weight:600; display:flex; align-items:center; gap:6px;" onclick="window.GEO_AUTH ? window.GEO_AUTH.showLoginModal() : null" id="gnavRegionBtn">
        <span>📍</span>
        <span id="gnavActiveRegionText">Sikkim</span>
      </button>
      <a href="javascript:void(0)" onclick="window.GEO_AUTH ? window.GEO_AUTH.showLoginModal() : null" class="gnav-cta" aria-label="Open Workspace Login">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10"/></svg>
        Access Gateway
      </a>

      <!-- Hamburger -->
      <button class="gnav-hamburger" id="gnavHamburger" aria-label="Open menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </div>
  </div>

  <!-- Viewport (desktop dropdown) -->
  <div class="gnav-viewport-wrap" aria-live="polite">
    <div class="gnav-viewport" id="gnavViewport" role="region" aria-label="Navigation panel"></div>
  </div>
</header>

<!-- Mobile drawer -->
<div class="gnav-drawer" id="gnavDrawer" aria-hidden="true">
  <div class="gnd-section">
    <span class="gnd-label">Modules</span>
    ${MODULES.map(m => `
    <a href="${m.href}" class="gnd-link">
      <span class="gnd-link-icon">${m.icon}</span>
      <span>
        <span class="gnd-link-name">${m.name}</span>
        <span class="gnd-link-sub">${m.location} · ${m.desc}</span>
      </span>
    </a>`).join('')}
  </div>
  <div class="gnd-section">
    <span class="gnd-label">Platform</span>
    ${PLATFORM_LINKS.map(p => `
    <a href="${p.href}" class="gnd-link">
      <span class="gnd-link-icon">${p.icon}</span>
      <span>
        <span class="gnd-link-name">${p.name}</span>
        <span class="gnd-link-sub">${p.desc}</span>
      </span>
    </a>`).join('')}
  </div>
</div>

<!-- Page transition overlay -->
<div class="page-transition-overlay" id="pageTransition" aria-hidden="true"></div>
    `;
  }

  /* ============================================================
     PANEL CONTENT
     ============================================================ */
  function buildModulesPanel(currentPage) {
    return `
      <div class="gc-header">All Modules <span style="margin-left:auto;font-size:9px;letter-spacing:.12em;color:#52525b">05 ACTIVE</span></div>
      <div class="gc-modules">
        ${MODULES.map((m, i) => {
          const isCurrent = currentPage && currentPage.includes(m.href.replace('.html',''));
          return `
          <a href="${m.href}" class="gc-module-link ${isCurrent ? 'is-current' : ''}" data-nav-link>
            <div class="gcm-icon">${m.icon}</div>
            <div class="gcm-body">
              <span class="gcm-location">0${i+1} · ${m.location}</span>
              <span class="gcm-name">${m.name}</span>
              <span class="gcm-desc">${m.desc}</span>
            </div>
          </a>`;
        }).join('')}
      </div>
    `;
  }

  function buildPlatformPanel() {
    const half = Math.ceil(PLATFORM_LINKS.length / 2);
    const left = PLATFORM_LINKS.slice(0, half);
    const right = PLATFORM_LINKS.slice(half);
    return `
      <div class="gc-header">Platform Overview</div>
      <div class="gc-platform">
        <div class="gc-plat-group">
          ${left.map(p => `
          <a href="${p.href}" class="gc-plat-link" data-nav-link>
            <div class="gc-plat-link-icon">${p.icon}</div>
            <div>
              <span class="gc-plat-link-name">${p.name}</span>
              <span class="gc-plat-link-desc">${p.desc}</span>
            </div>
          </a>`).join('')}
        </div>
        <div class="gc-plat-group">
          <span class="gc-plat-label">Resources</span>
          ${right.map(p => `
          <a href="${p.href}" class="gc-plat-link" data-nav-link>
            <div class="gc-plat-link-icon">${p.icon}</div>
            <div>
              <span class="gc-plat-link-name">${p.name}</span>
              <span class="gc-plat-link-desc">${p.desc}</span>
            </div>
          </a>`).join('')}
        </div>
      </div>
    `;
  }

  /* ============================================================
     NAV LOGIC — Viewport + Indicator + Directional Animation
     ============================================================ */
  function initNav(currentPage) {
    const viewport  = document.getElementById('gnavViewport');
    const indicator = document.querySelector('.gnav-indicator');
    const items     = document.querySelectorAll('.gnav-item[data-gnav-id]');

    if (!viewport || !indicator) return;

    const PANELS = {
      platform: buildPlatformPanel(),
      modules:  buildModulesPanel(currentPage),
    };
    const HEIGHTS = { platform: 200, modules: 210 };

    let activeId  = null;
    let prevIndex = -1;

    // --- Indicator positioning ---
    function moveIndicator(trigger) {
      if (!trigger) { indicator.classList.remove('is-visible'); return; }
      const navRect   = trigger.closest('.gnav-menu').getBoundingClientRect();
      const trigRect  = trigger.getBoundingClientRect();
      indicator.style.left  = (trigRect.left - navRect.left) + 'px';
      indicator.style.width = trigRect.width + 'px';
      indicator.classList.add('is-visible');
    }

    // --- Open panel ---
    function openPanel(id, fromIndex, toIndex) {
      const content  = document.createElement('div');
      content.className = 'gnav-content';
      content.innerHTML = PANELS[id];

      const dir = fromIndex < toIndex ? 'from-end' : 'from-start';
      content.setAttribute('data-motion', dir);
      content.setAttribute('data-gnav-panel', id);

      // Exit old panel
      const old = viewport.querySelector('.gnav-content:not([data-motion^="to"])');
      if (old && old.getAttribute('data-gnav-panel') !== id) {
        const exitDir = fromIndex < toIndex ? 'to-start' : 'to-end';
        old.setAttribute('data-motion', exitDir);
        old.addEventListener('animationend', () => old.remove(), { once: true });
      } else if (old) {
        old.remove();
      }

      viewport.appendChild(content);
      viewport.style.height = HEIGHTS[id] + 'px';
      viewport.classList.add('is-open');

      // Add page-transition on any nav link click
      content.querySelectorAll('[data-nav-link]').forEach(el => {
        el.addEventListener('click', handleNavLinkClick);
      });
    }

    function closePanel() {
      viewport.style.height = '0';
      viewport.classList.remove('is-open');
      setTimeout(() => { viewport.innerHTML = ''; }, 320);
      indicator.classList.remove('is-visible');
      activeId = null;
      prevIndex = -1;
      items.forEach(i => {
        i.classList.remove('is-open');
        const btn = i.querySelector('.gnav-trigger');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });
    }

    // --- Item interaction ---
    items.forEach((item, toIndex) => {
      const id  = item.getAttribute('data-gnav-id');
      const btn = item.querySelector('.gnav-trigger');

      const activate = () => {
        if (activeId === id) { closePanel(); return; }
        const fromIndex = prevIndex === -1 ? toIndex : prevIndex;
        items.forEach((i, ii) => {
          i.classList.toggle('is-open', ii === toIndex);
          const b = i.querySelector('.gnav-trigger');
          if (b) b.setAttribute('aria-expanded', ii === toIndex ? 'true' : 'false');
        });
        openPanel(id, fromIndex, toIndex);
        moveIndicator(btn);
        activeId  = id;
        prevIndex = toIndex;
      };

      btn.addEventListener('click', (e) => { e.stopPropagation(); activate(); });
      btn.addEventListener('mouseenter', activate);
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.gnav-root')) closePanel();
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closePanel();
    });

    // Keep open while hovering viewport
    viewport.parentElement.addEventListener('mouseleave', closePanel);
    document.querySelector('.gnav-menu').addEventListener('mouseleave', (e) => {
      if (!e.relatedTarget?.closest('.gnav-viewport-wrap')) closePanel();
    });
  }

  /* ============================================================
     MOBILE HAMBURGER
     ============================================================ */
  function initMobile() {
    const btn    = document.getElementById('gnavHamburger');
    const drawer = document.getElementById('gnavDrawer');
    if (!btn || !drawer) return;

    btn.addEventListener('click', () => {
      const open = btn.classList.toggle('is-open');
      drawer.classList.toggle('is-open', open);
      drawer.setAttribute('aria-hidden', !open);
      btn.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });

    drawer.querySelectorAll('.gnd-link').forEach(link => {
      link.addEventListener('click', handleNavLinkClick);
    });
  }

  /* ============================================================
     PAGE TRANSITIONS
     ============================================================ */
  function handleNavLinkClick(e) {
    const href = e.currentTarget.href;
    if (!href || href === window.location.href || href.includes('#')) return;
    e.preventDefault();
    const overlay = document.getElementById('pageTransition');
    if (overlay) {
      overlay.classList.add('fade-out');
      setTimeout(() => { window.location.href = href; }, 340);
    } else {
      window.location.href = href;
    }
  }

  function initPageTransition() {
    // Fade in on load
    const overlay = document.getElementById('pageTransition');
    if (!overlay) return;
    overlay.style.opacity = '1';
    overlay.style.transition = 'none';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        overlay.style.transition = 'opacity .36s ease';
        overlay.style.opacity = '0';
      });
    });

    // Wire all internal links
    document.querySelectorAll('a[href]').forEach(el => {
      const href = el.getAttribute('href');
      if (href && !href.startsWith('#') && !href.startsWith('http') && !el.hasAttribute('data-no-transition')) {
        el.addEventListener('click', handleNavLinkClick);
      }
    });
  }

  /* ============================================================
     PARTICLE CANVAS
     ============================================================ */
  function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let W, H, particles = [], animId;

    const COLORS = ['rgba(212,175,55,', 'rgba(37,99,235,', 'rgba(255,255,255,'];

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    function createParticle() {
      const c = COLORS[Math.floor(Math.random() * COLORS.length)];
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - .5) * 0.3,
        vy: (Math.random() - .5) * 0.3,
        r: .8 + Math.random() * 1.2,
        alpha: .05 + Math.random() * .18,
        color: c,
        // label: random coordinate-like string shown rarely
        label: Math.random() < .08 ? `${(Math.random()*90+10).toFixed(2)}°${Math.random()<.5?'N':'E'}` : null,
        labelAlpha: 0,
        labelFade: Math.random() * .004 + .001,
        labelDir: 1,
        labelTimer: Math.random() * 200,
      };
    }

    function init() {
      resize();
      const count = Math.floor((W * H) / 18000);
      particles = Array.from({ length: count }, createParticle);
    }

    const MAX_DIST = 120;

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // Update & draw particles
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;

        // Draw dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + p.alpha + ')';
        ctx.fill();

        // Floating label
        if (p.label) {
          p.labelTimer--;
          if (p.labelTimer <= 0) {
            p.labelAlpha += p.labelFade * p.labelDir;
            if (p.labelAlpha >= .4) { p.labelDir = -1; }
            if (p.labelAlpha <= 0)  { p.labelDir = 1; p.labelTimer = 120 + Math.random() * 200; p.labelAlpha = 0; }
            ctx.fillStyle = p.color + Math.max(0, p.labelAlpha) + ')';
            ctx.font = '9px JetBrains Mono, monospace';
            ctx.textBaseline = 'middle';
            ctx.fillText(p.label, p.x + 6, p.y);
          }
        }
      });

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            const alpha = (1 - dist / MAX_DIST) * 0.055;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(212,175,55,${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    }

    window.addEventListener('resize', () => { resize(); });
    init();
    draw();

    // Pause when not visible
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelAnimationFrame(animId);
      else draw();
    });
  }

  /* ============================================================
     ANIMATED COUNTERS
     ============================================================ */
  function initCounters() {
    document.querySelectorAll('.anim-counter').forEach(el => {
      const target = parseFloat(el.getAttribute('data-target') || el.textContent);
      const decimals = el.getAttribute('data-decimals') || 0;
      const duration = parseInt(el.getAttribute('data-duration') || 1400);
      let started = false;

      const obs = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && !started) {
          started = true;
          const start = performance.now();
          const step = (now) => {
            const t = Math.min(1, (now - start) / duration);
            const ease = 1 - Math.pow(1 - t, 3);
            const val = (ease * target).toFixed(decimals);
            el.textContent = val;
            if (t < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      }, { threshold: .3 });
      obs.observe(el);
    });
  }

  /* ============================================================
     CARD TILT
     ============================================================ */
  function initTilt() {
    document.querySelectorAll('.tilt-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width  / 2;
        const cy = rect.height / 2;
        const rx = ((y - cy) / cy) * -4;
        const ry = ((x - cx) / cx) *  4;
        card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.01)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale(1)';
      });
    });
  }

  /* ============================================================
     STAGGER OBSERVER
     ============================================================ */
  function initStagger() {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-up, .stagger-parent').forEach(el => obs.observe(el));
  }

  /* ============================================================
     BOOT — detect current page & inject
     ============================================================ */
  function boot() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    // Inject nav into #gnavMount if present, else prepend to body
    const mount = document.getElementById('gnavMount') || document.body;
    if (document.getElementById('gnavMount')) {
      mount.innerHTML = buildNav(currentPage);
    } else {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = buildNav(currentPage);
      document.body.insertBefore(wrapper.firstElementChild, document.body.firstChild);
      // drawer
      document.body.insertBefore(wrapper.firstElementChild, document.body.children[1]);
      // overlay
      document.body.appendChild(wrapper.firstElementChild);
    }

    initNav(currentPage);
    initMobile();
    initPageTransition();
    initParticles();
    initCounters();
    initTilt();
    initStagger();

    // Sync Active Region Badge
    function syncNavRegion() {
      if (window.getDefaultRegion) {
        const reg = window.getDefaultRegion();
        const badgeEl = document.getElementById('gnavBrandBadge');
        const textEl = document.getElementById('gnavActiveRegionText');
        if (badgeEl) badgeEl.innerText = `LIVE · ${reg.name} Sentinel`;
        if (textEl) textEl.innerText = reg.name;
      }
    }
    syncNavRegion();
    window.addEventListener('regionChanged', syncNavRegion);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
