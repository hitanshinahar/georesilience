/**
 * GeoRaksha / GeoResilience-360 — API Client & Mode Switcher
 * Supports LIVE MODE (backend/external REST API) & DEMO MODE (bundled local fallback data).
 */
(function() {
  'use strict';

  const STORAGE_KEY = 'geo360_data_mode';
  
  window.GEO_API = {
    // Mode can be 'LIVE' or 'DEMO'
    getMode: function() {
      return localStorage.getItem(STORAGE_KEY) || 'DEMO'; // Default to DEMO mode for high reliability
    },

    setMode: function(mode) {
      if (mode !== 'LIVE' && mode !== 'DEMO') mode = 'DEMO';
      localStorage.setItem(STORAGE_KEY, mode);
      window.dispatchEvent(new CustomEvent('dataModeChanged', { detail: { mode: mode } }));
      this.showToast(`Data Mode switched to ${mode} ${mode === 'LIVE' ? '🟢' : '🟡'}`);
    },

    showToast: function(message) {
      let toast = document.getElementById('geo360-toast');
      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'geo360-toast';
        toast.style.cssText = 'position:fixed; bottom:24px; right:24px; z-index:9999; background:rgba(9,9,11,0.92); border:1px solid #d4af37; color:#fff; font-family:"JetBrains Mono",monospace; font-size:12px; padding:10px 16px; border-radius:8px; box-shadow:0 4px 20px rgba(0,0,0,0.5); transition:all 0.3s ease; opacity:0; pointer-events:none;';
        document.body.appendChild(toast);
      }
      toast.textContent = message;
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
      }, 3000);
    },

    // Predict risk (Calls POST /api/predict or falls back to client ML model simulation)
    predictRisk: async function(inputParams) {
      const mode = this.getMode();
      
      if (mode === 'LIVE') {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2500); // 2.5s timeout
          
          const response = await fetch('/api/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(inputParams),
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            return { source: 'LIVE', data: data };
          }
        } catch (err) {
          console.warn('Live API request failed or timed out. Falling back to DEMO simulation engine.', err);
          this.showToast('LIVE API unreachable — using DEMO Mode Cache 🟡');
        }
      }

      // Offline / DEMO mode simulation
      const rain = inputParams.rainfall_1h || inputParams.rainfall || 30;
      const slope = inputParams.slope || 42.6;
      
      let fos = 1.42 - (rain - 30) * 0.009;
      if (fos < 0.7) fos = 0.7;
      
      let score = 28 + Math.round((rain - 30) * 0.85);
      if (score > 98) score = 98;

      let riskLevel = 'LOW';
      if (score >= 50 && score < 80) riskLevel = 'AMBER';
      if (score >= 80) riskLevel = 'RED';

      const demoData = window.GEO_DEMO_DATA?.samplePrediction?.['104A'] || {};

      return {
        source: 'DEMO',
        data: {
          riskScore: score,
          factorOfSafety: parseFloat(fos.toFixed(2)),
          riskLevel: riskLevel,
          confidence: '94.2%',
          shapBreakdown: [
            { feature: 'Simulated Rainfall Intensity', weight: Math.min(65, Math.round(rain * 0.45)), icon: '🌧️' },
            { feature: `Slope Angle (${slope}°)`, weight: 28, icon: '⛰️' },
            { feature: 'Soil Moisture (VWC)', weight: 18, icon: '💧' },
            { feature: 'InSAR Displacement', weight: 12, icon: '🛰️' }
          ],
          models: {
            xgboostStatic: 68,
            lstmTemporalDelta: Math.max(0, Math.round((rain - 30) * 0.4)),
            fusedScore: score,
            confidence: '94.2%'
          }
        }
      };
    }
  };
})();
