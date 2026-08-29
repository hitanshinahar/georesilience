export const STORAGE_KEY = 'geo360_data_mode';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class GeoAPIClient {
  getMode() {
    return localStorage.getItem(STORAGE_KEY) || 'LIVE';
  }

  setMode(mode) {
    if (mode !== 'LIVE' && mode !== 'DEMO') mode = 'LIVE';
    localStorage.setItem(STORAGE_KEY, mode);
    window.dispatchEvent(new CustomEvent('dataModeChanged', { detail: { mode } }));
  }

  async getLiveWeather(lat, lon) {
    const res = await fetch(`${API_BASE_URL}/api/weather/current?lat=${lat}&lon=${lon}`);
    if (!res.ok) throw new Error(`Weather API Error: ${res.status}`);
    return await res.json();
  }

  async getTerrain(lat, lon) {
    const res = await fetch(`${API_BASE_URL}/api/spatial/terrain?lat=${lat}&lon=${lon}`);
    if (!res.ok) {
        if (res.status === 503) throw new Error("TERRAIN DATA UNAVAILABLE");
        throw new Error(`Terrain API Error: ${res.status}`);
    }
    return await res.json();
  }

  async getRoute(origin, destination, riskContext) {
    const res = await fetch(`${API_BASE_URL}/api/routing/astar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin: origin,
        destination: destination,
        risk_context: riskContext
      })
    });
    if (!res.ok) {
        if (res.status === 503) throw new Error("ROUTING DATA UNAVAILABLE");
        throw new Error(`Routing API Error: ${res.status}`);
    }
    return await res.json();
  }

  getKhasraCoords(khasraId) {
    const coords = {
      '104/A': { lat: 27.335, lon: 88.60 },
      '104/B': { lat: 27.345, lon: 88.625 },
      '108': { lat: 27.315, lon: 88.595 }
    };
    return coords[khasraId] || { lat: 27.33, lon: 88.60 }; // default center
  }

  async simulateRainfall(khasraId, rainfallMm, slopeDeg, moistureVwc, insarDisp) {
    return await this.predictRisk({
      khasra_id: khasraId || '104/A',
      rainfall_mm: parseFloat(rainfallMm) || 30.0,
      slope: parseFloat(slopeDeg) || 44.5,
      moisture: parseFloat(moistureVwc) || 65.0,
      insar_disp: parseFloat(insarDisp) || -4.2
    });
  }

  async getIncidents() {
    const mode = this.getMode();
    if (mode === 'LIVE') {
      try {
        const res = await fetch(`${API_BASE_URL}/api/incidents`);
        if (!res.ok) throw new Error(`Incidents API Error: ${res.status}`);
        const data = await res.json();
        const incidents = Array.isArray(data) ? data : (data.value || []);
        return { source: 'LIVE', data: incidents };
      } catch (err) {
        console.error('Failed to fetch incidents', err);
        throw err;
      }
    }
    return { source: 'DEMO', data: [] }; 
  }

  async getAlerts() {
    const mode = this.getMode();
    if (mode === 'LIVE') {
      try {
        const res = await fetch(`${API_BASE_URL}/api/alerts`);
        if (!res.ok) throw new Error(`Alerts API Error: ${res.status}`);
        const data = await res.json();
        const alerts = Array.isArray(data) ? data : (data.value || []);
        return { source: 'LIVE', data: alerts };
      } catch (err) {
        console.error('Failed to fetch alerts', err);
        throw err;
      }
    }
    return { source: 'DEMO', data: [] };
  }

  async getReports() {
    const mode = this.getMode();
    if (mode === 'LIVE') {
      try {
        const res = await fetch(`${API_BASE_URL}/api/reports`);
        if (!res.ok) throw new Error(`Reports API Error: ${res.status}`);
        const data = await res.json();
        return { source: 'LIVE', data: Array.isArray(data) ? data : (data.value || []) };
      } catch (err) {
        console.error('Failed to fetch reports', err);
        throw err;
      }
    }
    return { source: 'DEMO', data: [] };
  }

  async submitReport(reportData) {
    const mode = this.getMode();
    if (mode === 'LIVE') {
      const res = await fetch(`${API_BASE_URL}/api/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
      });
      if (!res.ok) throw new Error(`Report Submit Error: ${res.status}`);
      return await res.json();
    }
    // Mock response for demo
    return { ...reportData, id: 'REP-DEMO-' + Math.floor(Math.random()*1000), status: 'RECEIVED', created_at: new Date().toISOString() };
  }

  async predictRisk(inputParams) {
    const mode = this.getMode();
    const khasraId = inputParams.khasra_id || inputParams.khasraId || '104/A';
    
    // For live weather data integration
    const isLiveWeather = inputParams.weatherData != null;
    const weatherData = inputParams.weatherData || {};
    
    // For live terrain data integration
    const isLiveTerrain = inputParams.terrainData != null;
    const terrainData = inputParams.terrainData || {};
    const usePrototypeTerrain = inputParams.usePrototypeTerrain || false;
    
    // Base features
    const slope = isLiveTerrain ? terrainData.slope_deg : (inputParams.slope || inputParams.slope_deg || 44.5);
    const elevation = isLiveTerrain ? terrainData.elevation_m : 1000.0;
    const aspect = isLiveTerrain ? terrainData.aspect_deg : 180.0;
    const tri = isLiveTerrain ? terrainData.tri_ruggedness : 50.0;
    const plan_curv = isLiveTerrain ? terrainData.plan_curvature : 0.1;
    
    let moisture = isLiveWeather ? weatherData.soil_moisture : (inputParams.moisture || 65.0);
    const insar = inputParams.insar_disp || -4.2;

    const rain_3h = isLiveWeather ? weatherData.rainfall_3h_accum_mm : (inputParams.rainfall_mm || inputParams.rainfall_1h || inputParams.rainfall || 30.0);
    const rain_72h = isLiveWeather ? weatherData.rainfall_72h_accum_mm : (inputParams.rainfall_72h_accum_mm !== undefined ? inputParams.rainfall_72h_accum_mm : (rain_3h * 3.0));

    if (mode === 'LIVE') {
      if (!isLiveTerrain && !usePrototypeTerrain) {
        throw new Error("TERRAIN DATA UNAVAILABLE: Risk prediction requires explicit terrain data.");
      }
      if (isLiveWeather && (moisture === null || moisture === undefined)) {
        if (!usePrototypeTerrain) {
          throw new Error("SOIL MOISTURE UNAVAILABLE: Risk prediction requires explicit soil moisture.");
        }
        moisture = 65.0; // Prototype fallback explicitly allowed
      }
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);
        
        const response = await fetch(`${API_BASE_URL}/api/risk/predict`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            elevation_m: elevation,
            slope_deg: slope,
            aspect_deg: aspect,
            tri_ruggedness: tri,
            plan_curvature: plan_curv,
            rainfall_3h_accum_mm: rain_3h,
            rainfall_72h_accum_mm: rain_72h,
            soil_moisture_saturation_pct: moisture,
            ground_deformation_proxy_mm_yr: insar,
            anthropogenic_load_proxy_kpa: 10.0
          }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const backendData = await response.json();

        let mappedRiskLevel = 'GREEN';
        if (backendData.risk_level === 'CRITICAL') mappedRiskLevel = 'RED';
        else if (backendData.risk_level === 'WARNING' || backendData.risk_level === 'ALERT') mappedRiskLevel = 'AMBER';

        const mappedData = {
          khasra_id: khasraId,
          risk_score: backendData.risk_score,
          factor_of_safety: backendData.factor_of_safety,
          risk_level: mappedRiskLevel,
          confidence: backendData.static_susceptibility_score ? (backendData.static_susceptibility_score * 100).toFixed(1) + '%' : 'N/A',
          pore_pressure_kpa: backendData.pore_pressure_kpa,
          shear_stress_kpa: backendData.shear_stress_kpa,
          runout: backendData.runout || {
            debris_reach_km: 0,
            inundation_area_km2: 0,
            impacted_khasras: 0,
            impacted_residents: 0
          },
          shap_breakdown: (backendData.top_contributing_factors || []).map(f => ({
            feature: f.feature,
            value: (f.feature === 'soil_moisture_saturation_pct' && isLiveWeather && weatherData.soil_moisture_is_proxy) 
                   ? 'PROTOTYPE PROXY' : 'ML Derived',
            percentage: Math.round(f.contribution * 100),
            icon: '🔸'
          })),
          model: backendData.provenance || 'FastAPI Backend (Live)',
          terrain_provenance: isLiveTerrain ? terrainData.source : (usePrototypeTerrain ? 'PROTOTYPE_STATIC' : 'DEMO')
        };

        return { source: 'LIVE_FASTAPI', data: mappedData };

      } catch (err) {
        console.error('FastAPI backend request failed.', err);
        throw err;
      }
    }

    // Geotechnical limit equilibrium calculations for offline fallback
    let u_pore = 0.098 * rain_3h * (moisture / 50.0);
    let eff_sigma_n = Math.max(0.1, (19.5 * 3.5 * Math.pow(Math.cos(slope * Math.PI / 180), 2)) - u_pore);
    let tau_res = 12.5 + eff_sigma_n * Math.tan(32.0 * Math.PI / 180);
    let tau_drive = 19.5 * 3.5 * Math.sin(slope * Math.PI / 180) * Math.cos(slope * Math.PI / 180);
    let fos = Math.max(0.40, Math.min(3.50, tau_res / Math.max(0.1, tau_drive)));
    
    if (insar < 0) fos -= Math.abs(insar) * 0.015;
    fos = parseFloat(fos.toFixed(2));

    let score = 28 + Math.round((rain_3h - 30) * 0.85);
    if (fos < 1.0) score = Math.max(82, score);
    score = Math.min(99, Math.max(5, score));

    let riskLevel = fos > 1.3 ? 'GREEN' : (fos >= 1.0 ? 'AMBER' : 'RED');

    const rainW = Math.min(65, Math.round(rain_3h * 0.48));
    const slopeW = Math.min(35, Math.round(slope * 0.60));
    const moistW = Math.min(25, Math.round(moisture * 0.25));
    const insarW = Math.min(20, Math.round(Math.abs(insar) * 3.0));
    const totalW = rainW + slopeW + moistW + insarW;

    return {
      source: 'DEMO_LOCAL',
      data: {
        khasra_id: khasraId,
        risk_score: score,
        factor_of_safety: fos,
        risk_level: riskLevel,
        confidence: '96.4%',
        pore_pressure_kpa: parseFloat(u_pore.toFixed(1)),
        shear_stress_kpa: parseFloat(tau_drive.toFixed(1)),
        runout: {
          debris_reach_km: parseFloat(((slope / 40.0) * (rain_3h / 35.0) * 1.8).toFixed(2)),
          inundation_area_km2: parseFloat((((slope / 40.0) * (rain_3h / 35.0) * 1.8) * 0.18).toFixed(2)),
          impacted_khasras: Math.max(5, Math.round(((slope / 40.0) * (rain_3h / 35.0) * 1.8) * 44)),
          impacted_residents: Math.max(35, Math.round(((slope / 40.0) * (rain_3h / 35.0) * 1.8) * 44) * 7)
        },
        shap_breakdown: [
          { feature: 'Rainfall Intensity (3h)', value: `${rain_3h} mm`, percentage: Math.round((rainW/totalW)*100), icon: '🌧️' },
          { feature: `Slope Angle (${slope}°)`, value: `${slope}°`, percentage: Math.round((slopeW/totalW)*100), icon: '⛰️' },
          { feature: 'Soil Moisture (VWC)', value: `${moisture}%`, percentage: Math.round((moistW/totalW)*100), icon: '💧' },
          { feature: 'InSAR Ground Displacement', value: `${insar} mm/yr`, percentage: Math.round((insarW/totalW)*100), icon: '🛰️' }
        ],
        model: 'XGBoost + Limit Equilibrium Physics Engine'
      }
    };
  }

  async updateIncident(incidentId, status, reviewerId = 'operator', note = '') {
    const mode = this.getMode();
    if (mode === 'LIVE') {
      const res = await fetch(`${API_BASE_URL}/api/incidents/${incidentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reviewer_id: reviewerId, note })
      });
      if (!res.ok) throw new Error(`Update Incident Error: ${res.status}`);
      return await res.json();
    }
    return { status, updated_at: new Date().toISOString() };
  }
}

export const geoAPI = new GeoAPIClient();
