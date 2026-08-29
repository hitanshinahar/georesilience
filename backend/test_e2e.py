import requests
import time

BASE_URL = "http://localhost:8000"

def run_tests():
    print("==================================================")
    print("TEST 1 — LIVE WEATHER → RISK")
    print("==================================================")
    
    # 1. Weather
    try:
        w_res = requests.get(f"{BASE_URL}/api/weather/current?lat=27.33&lon=88.61")
        w_res.raise_for_status()
        w_data = w_res.json()
        print(f"[WEATHER] STATUS: {w_res.status_code}")
        print(f"[WEATHER] rainfall_72h_accum_mm: {w_data.get('rainfall_72h_accum_mm')}")
        print(f"[WEATHER] soil_moisture_saturation_pct: {w_data.get('soil_moisture_saturation_pct')}")
    except Exception as e:
        print(f"[WEATHER] FAILED: {e}")
        w_data = None

    # 2. Risk Predict
    if w_data:
        soil_m = w_data.get('soil_moisture')
        if soil_m is None:
            soil_m = 65.0  # Prototype fallback if real unavailable
            
        risk_payload = {
            "elevation_m": 1000.0,
            "aspect_deg": 180.0,
            "slope_deg": 35.0,
            "tri_ruggedness": 50.0,
            "plan_curvature": 0.1,
            "soil_moisture_saturation_pct": float(soil_m),
            "rainfall_3h_accum_mm": float(w_data.get('rainfall_3h_accum_mm', 15.0)),
            "rainfall_72h_accum_mm": float(w_data.get('rainfall_72h_accum_mm', 45.0)),
            "ground_deformation_proxy_mm_yr": -4.2,
            "anthropogenic_load_proxy_kpa": 10.0
        }
        try:
            r_res = requests.post(f"{BASE_URL}/api/risk/predict", json=risk_payload)
            r_res.raise_for_status()
            r_data = r_res.json()
            print(f"[RISK] STATUS: {r_res.status_code}")
            print(f"[RISK] Score: {r_data.get('risk_score')}, FoS: {r_data.get('factor_of_safety')}")
            print(f"[RISK] Provenance: {r_data.get('provenance')}")
            
            print("==================================================")
            print("TEST 2 - REAL SHAP")
            print("==================================================")
            print(f"[SHAP] Top Factors: {r_data.get('top_contributing_factors')}")
            
            # Change inputs to verify SHAP changes
            risk_payload["rainfall_72h_accum_mm"] = 5.0
            r_res2 = requests.post(f"{BASE_URL}/api/risk/predict", json=risk_payload)
            r_data2 = r_res2.json()
            print(f"[SHAP ALTERED] Top Factors: {r_data2.get('top_contributing_factors')}")
        except Exception as e:
            print(f"[RISK] FAILED: {e}")
            r_data = None

    print("==================================================")
    print("TEST 3 — FIELD SENTINEL ONLINE")
    print("==================================================")
    report_payload = {
        "report_text": "[SLOPE_CRACK] Massive mudslide near NH-10. Road completely blocked. Vehicles stranded and houses at risk.",
        "latitude": 27.32,
        "longitude": 88.62, # NH-10 threatened midpoint
        "reporter_type": "field_officer",
        "image_url": "base64:placeholder"
    }
    
    try:
        rep_res = requests.post(f"{BASE_URL}/api/reports/", json=report_payload)
        rep_res.raise_for_status()
        rep_data = rep_res.json()
        print(f"[REPORT] STATUS: {rep_res.status_code}")
        print(f"[REPORT] ID: {rep_data.get('report_id')}")
        print(f"[REPORT] Incident ID: {rep_data.get('linked_incident_id')}")
        print(f"[REPORT] SLM Hazard: {rep_data.get('slm_analysis', {}).get('hazard_type')}")
        inc_id = rep_data.get('linked_incident_id')
    except Exception as e:
        print(f"[REPORT] FAILED: {e}")
        inc_id = None
        
    print("==================================================")
    print("TEST 4 — INCIDENT-AWARE A*")
    print("==================================================")
    route_payload = {
        "origin": {"lat": 27.38, "lon": 88.58},
        "destination": {"lat": 27.30, "lon": 88.59, "khasra_id": "104/A"}, # nearest to j2
        "risk_context": {
            "risk_score": 10.0,
            "risk_level": "GREEN",
            "factor_of_safety": 1.5,
            "inundation_area_km2": 0.0
        }
    }
    try:
        rt_res = requests.post(f"{BASE_URL}/api/routing/astar", json=route_payload)
        rt_res.raise_for_status()
        rt_data = rt_res.json()
        print(f"[ROUTING] STATUS: {rt_res.status_code}")
        print(f"[ROUTING] Reason: {rt_data.get('reason')}")
        lats = [n['lat'] for n in rt_data.get('route', [])]
        print(f"[ROUTING] Lats (should not contain 27.32 if blocked): {lats}")
    except Exception as e:
        print(f"[ROUTING] FAILED: {e}")

    print("==================================================")
    print("TEST 5 — INCIDENT RESOLUTION")
    print("==================================================")
    if inc_id:
        try:
            update_payload = {"status": "RESOLVED"}
            up_res = requests.patch(f"{BASE_URL}/api/incidents/{inc_id}", json=update_payload)
            up_res.raise_for_status()
            print(f"[RESOLUTION] STATUS: {up_res.status_code}")
            
            # Re-route
            rt_res2 = requests.post(f"{BASE_URL}/api/routing/astar", json=route_payload)
            rt_data2 = rt_res2.json()
            lats2 = [n['lat'] for n in rt_data2.get('route', [])]
            print(f"[ROUTING RECALC] Reason: {rt_data2.get('reason')}")
            print(f"[ROUTING RECALC] Lats (should contain 27.32 since it's shortest and now green): {lats2}")
        except Exception as e:
            print(f"[RESOLUTION] FAILED: {e}")

if __name__ == "__main__":
    run_tests()
