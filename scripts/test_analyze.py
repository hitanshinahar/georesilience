import requests
import json

def test_analyze():
    url = "http://localhost:8000/api/assessment/analyze"
    
    payload = {
        "location": {
            "name": "Audit Test Site",
            "latitude": 27.0,
            "longitude": 88.0
        },
        "static_features": {
            "elevation_m": 1200.5,
            "slope_deg": 35.0,
            "aspect_deg": 180.0,
            "tri_ruggedness": 12.5,
            "plan_curvature": 0.5,
            "rainfall_3h_accum_mm": 50.0,
            "rainfall_72h_accum_mm": 150.0,
            "soil_moisture_saturation_pct": 85.0,
            "ground_deformation_proxy_mm_yr": 2.5,
            "anthropogenic_load_proxy_kpa": 10.0
        },
        "timeseries_sequence": [
            {
                "rainfall_mm": 10.0,
                "cumulative_rainfall_mm": 50.0,
                "soil_moisture": 0.8
            } for _ in range(72)
        ],
        "field_report": "Massive cracks on the road with huge boulders falling."
    }

    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        print(json.dumps(response.json(), indent=2))
    except Exception as e:
        print(f"Error: {e}")
        if hasattr(e, 'response') and e.response:
            print(e.response.text)

if __name__ == "__main__":
    test_analyze()
