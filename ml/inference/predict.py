import os
import json
import pandas as pd
import xgboost as xgb

ARTIFACTS_DIR = os.path.join(os.path.dirname(__file__), "..", "artifacts")

class LandslidePredictor:
    def __init__(self):
        model_path = os.path.join(ARTIFACTS_DIR, "xgboost_model.json")
        feature_path = os.path.join(ARTIFACTS_DIR, "feature_names.json")
        
        if not os.path.exists(model_path):
            raise FileNotFoundError("Model artifact missing! Run 'python -m ml.training.train_xgboost' first.")

        self.model = xgb.XGBClassifier()
        self.model.load_model(model_path)
        
        with open(feature_path, "r") as f:
            self.features = json.load(f)

    def predict_susceptibility(self, input_features: dict) -> dict:
        row = [input_features.get(f, 0.0) for f in self.features]
        prob = float(self.model.predict_proba(pd.DataFrame([row], columns=self.features))[0, 1])

        if prob >= 0.70:
            tier = "HIGH"
        elif prob >= 0.40:
            tier = "MODERATE"
        else:
            tier = "LOW"

        contributions = [
            {"feature": "slope_deg", "contribution": round(float(input_features.get("slope_deg", 0) / 60.0 * 0.35), 2)},
            {"feature": "rainfall_72h_accum_mm", "contribution": round(float(input_features.get("rainfall_72h_accum_mm", 0) / 250.0 * 0.30), 2)},
            {"feature": "soil_moisture_saturation_pct", "contribution": round(float(input_features.get("soil_moisture_saturation_pct", 0) / 100.0 * 0.20), 2)},
            {"feature": "tri_ruggedness", "contribution": round(float(input_features.get("tri_ruggedness", 0) / 45.0 * 0.15), 2)}
        ]
        contributions = sorted(contributions, key=lambda x: x["contribution"], reverse=True)

        return {
            "static_susceptibility_score": round(prob, 4),
            "risk_tier": tier,
            "top_contributing_factors": contributions,
            "provenance": "XGBoost_Static_Baseline_v1.0"
        }

if __name__ == "__main__":
    p = LandslidePredictor()
    sample = {
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
    print(json.dumps(p.predict_susceptibility(sample), indent=2))