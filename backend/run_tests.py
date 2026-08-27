from fastapi.testclient import TestClient
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from app.main import app

def run_tests():
    print("Testing /health...")
    with TestClient(app) as client:
        response = client.get("/health")
        print(f"Health response: {response.status_code} {response.json()}")
        assert response.status_code == 200
        
        print("Testing /api/risk/predict with valid payload...")
        payload = {
            "elevation_m": 1650.0,
            "slope_deg": 38.5,
            "aspect_deg": 210.0,
            "tri_ruggedness": 18.2,
            "plan_curvature": -0.02,
            "rainfall_3h_accum_mm": 45.0,
            "rainfall_72h_accum_mm": 120.0,
            "soil_moisture_saturation_pct": 82.0,
            "ground_deformation_proxy_mm_yr": -12.5,
            "anthropogenic_load_proxy_kpa": 30.0
        }
        response = client.post("/api/risk/predict", json=payload)
        print(f"Predict valid response: {response.status_code}")
        if response.status_code == 200:
            print(response.json())
        elif response.status_code == 503:
            print("Model missing.")
        else:
            print(f"Unexpected: {response.text}")

        print("Testing /api/risk/predict with invalid payload...")
        response = client.post("/api/risk/predict", json={"elevation_m": "foo"})
        print(f"Predict invalid response: {response.status_code}")
        assert response.status_code == 422
        
        print("Testing /api/risk/timeseries with valid payload...")
        seq = []
        for i in range(72):
            seq.append({
                "rainfall_mm": 5.0,
                "cumulative_rainfall_mm": 100.0,
                "soil_moisture": 0.8
            })
        response = client.post("/api/risk/timeseries", json={"sequence": seq})
        print(f"Timeseries valid response: {response.status_code}")
        if response.status_code == 200:
            print(response.json())
        elif response.status_code == 503:
            print("LSTM Model missing.")
        else:
            print(f"Unexpected: {response.text}")

        print("Testing /api/risk/timeseries with invalid short payload...")
        response = client.post("/api/risk/timeseries", json={"sequence": seq[:10]})
        print(f"Timeseries invalid response: {response.status_code}")
        assert response.status_code == 422
        
    print("All tests passed!")

if __name__ == "__main__":
    run_tests()
