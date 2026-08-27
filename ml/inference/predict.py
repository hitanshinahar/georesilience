import os
import json
import pandas as pd
import xgboost as xgb
import shap

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
            
        self.explainer = shap.TreeExplainer(self.model)

    def predict_susceptibility(self, input_features: dict) -> dict:
        row = [input_features.get(f, 0.0) for f in self.features]
        df = pd.DataFrame([row], columns=self.features)
        
        prob = float(self.model.predict_proba(df)[0, 1])

        if prob >= 0.70:
            tier = "HIGH"
        elif prob >= 0.40:
            tier = "MODERATE"
        else:
            tier = "LOW"

        # Calculate SHAP values
        shap_values = self.explainer.shap_values(df)
        
        # Depending on XGBoost version/objective, shap_values might be a list (multiclass) or 2D array
        if isinstance(shap_values, list):
            sv = shap_values[1][0]
        else:
            sv = shap_values[0]

        contributions = []
        for i, feature in enumerate(self.features):
            contributions.append({
                "feature": feature,
                "contribution": float(sv[i])
            })
            
        contributions = sorted(contributions, key=lambda x: abs(x["contribution"]), reverse=True)

        return {
            "static_susceptibility_score": round(prob, 4),
            "risk_tier": tier,
            "top_contributing_factors": contributions[:5], # Return top 5
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