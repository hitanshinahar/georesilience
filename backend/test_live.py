import requests
import json

payload = {
    "elevation_m": 1000.0,
    "slope_deg": 44.5,
    "aspect_deg": 180.0,
    "tri_ruggedness": 50.0,
    "plan_curvature": 0.1,
    "rainfall_3h_accum_mm": 30.0,
    "rainfall_72h_accum_mm": 90.0,
    "soil_moisture_saturation_pct": 65.0,
    "ground_deformation_proxy_mm_yr": -4.2,
    "anthropogenic_load_proxy_kpa": 10.0
}

try:
    response = requests.post("http://localhost:8000/api/risk/predict", json=payload)
    print(f"Status Code: {response.status_code}")
    print("Response JSON:")
    print(json.dumps(response.json(), indent=2))
except Exception as e:
    print(f"Error making request: {e}")
