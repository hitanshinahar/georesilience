import os
import json
import xgboost as xgb

ARTIFACTS_DIR = os.path.join(os.path.dirname(__file__), "..", "artifacts")

def run_detailed_evaluation():
    model_path = os.path.join(ARTIFACTS_DIR, "xgboost_model.json")
    if not os.path.exists(model_path):
        print("Model file missing. Run train_xgboost.py first.")
        return

    model = xgb.XGBClassifier()
    model.load_model(model_path)

    importance = model.get_booster().get_score(importance_type='gain')
    sorted_importance = [
        {"feature": k, "gain": round(float(v), 2)}
        for k, v in sorted(importance.items(), key=lambda item: item[1], reverse=True)
    ]

    with open(os.path.join(ARTIFACTS_DIR, "feature_importance.json"), "w") as f:
        json.dump(sorted_importance, f, indent=2)

    print("[EVALUATION] Exported ml/artifacts/feature_importance.json")

if __name__ == "__main__":
    run_detailed_evaluation()