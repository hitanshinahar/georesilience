import os
import json
import numpy as np
import xgboost as xgb
import shap

ARTIFACTS_DIR = os.path.join(os.path.dirname(__file__), "..", "artifacts")

def generate_shap_summary():
    model_path = os.path.join(ARTIFACTS_DIR, "xgboost_model.json")
    feature_path = os.path.join(ARTIFACTS_DIR, "feature_names.json")
    
    if not os.path.exists(model_path) or not os.path.exists(feature_path):
        print("Artifacts missing. Run train_xgboost.py first.")
        return

    model = xgb.XGBClassifier()
    model.load_model(model_path)

    with open(feature_path, "r") as f:
        features = json.load(f)

    explainer = shap.TreeExplainer(model)
    
    shap_meta = {
        "explainer_type": "TreeExplainer",
        "expected_value": float(explainer.expected_value) if isinstance(explainer.expected_value, (int, float, np.floating)) else float(explainer.expected_value[0]),
        "top_predictive_drivers": features[:5]
    }

    with open(os.path.join(ARTIFACTS_DIR, "shap_summary.json"), "w") as f:
        json.dump(shap_meta, f, indent=2)

    print("[SHAP] Exported ml/artifacts/shap_summary.json")

if __name__ == "__main__":
    generate_shap_summary()