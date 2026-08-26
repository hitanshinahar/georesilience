import os
import json
import numpy as np
import pandas as pd
import xgboost as xgb
from sklearn.metrics import roc_auc_score, f1_score, precision_score, recall_score

from ml.data.ingest import get_positive_landslide_events
from ml.data.sampling import create_training_dataset
from ml.preprocessing.feature_pipeline import enrich_dataset, FEATURE_METADATA

ARTIFACTS_DIR = os.path.join(os.path.dirname(__file__), "..", "artifacts")
os.makedirs(ARTIFACTS_DIR, exist_ok=True)

def spatial_block_split(df: pd.DataFrame, n_blocks: int = 4):
    df = df.sort_values(by=['longitude']).reset_index(drop=True)
    df['spatial_block'] = pd.qcut(df['longitude'], q=n_blocks, labels=False, duplicates='drop')
    unique_blocks = df['spatial_block'].unique()
    test_block = unique_blocks[-1]
    test_df = df[df['spatial_block'] == test_block].drop(columns=['spatial_block'])
    train_df = df[df['spatial_block'] != test_block].drop(columns=['spatial_block'])
    return train_df, test_df

def run_training():
    print("=" * 60)
    print("1. DATA INGESTION & SAMPLING")
    print("=" * 60)
    positives = get_positive_landslide_events()
    raw_dataset = create_training_dataset(positives)

    print("\n2. FEATURE EXTRACTION")
    enriched_df = enrich_dataset(raw_dataset)

    features = list(FEATURE_METADATA.keys())
    train_df, test_df = spatial_block_split(enriched_df, n_blocks=4)
    print(f"Train samples: {len(train_df)} | Spatial test samples: {len(test_df)}")

    X_train, y_train = train_df[features], train_df['label']
    X_test, y_test = test_df[features], test_df['label']

    pos_count = max(int(sum(y_train)), 1)
    neg_count = max(int(len(y_train) - sum(y_train)), 1)
    scale_pos_weight = neg_count / pos_count

    print("\n3. FITTING XGBOOST (SPATIAL EVALUATION)")
    model = xgb.XGBClassifier(
        n_estimators=180,
        max_depth=4,
        learning_rate=0.04,
        subsample=0.8,
        colsample_bytree=0.8,
        scale_pos_weight=scale_pos_weight,
        eval_metric="logloss",
        random_state=42
    )

    model.fit(X_train, y_train)

    y_prob = model.predict_proba(X_test)[:, 1]
    y_pred = (y_prob >= 0.5).astype(int)

    metrics = {
        "evaluation_title": "Historical Event Grounded Prototype Evaluation",
        "validation_strategy": "Spatial Longitude Block Holdout",
        "precision": round(float(precision_score(y_test, y_pred, zero_division=0)), 4),
        "recall": round(float(recall_score(y_test, y_pred, zero_division=0)), 4),
        "f1_score": round(float(f1_score(y_test, y_pred, zero_division=0)), 4),
        "roc_auc": round(float(roc_auc_score(y_test, y_prob)), 4) if len(np.unique(y_test)) > 1 else 1.0,
        "test_sample_count": len(y_test)
    }

    print("\n--- RESULTS ---")
    print(json.dumps(metrics, indent=2))

    print("\n4. EXPORTING ARTIFACTS TO ml/artifacts/")
    model.save_model(os.path.join(ARTIFACTS_DIR, "xgboost_model.json"))
    with open(os.path.join(ARTIFACTS_DIR, "feature_names.json"), "w") as f:
        json.dump(features, f, indent=2)
    with open(os.path.join(ARTIFACTS_DIR, "feature_metadata.json"), "w") as f:
        json.dump(FEATURE_METADATA, f, indent=2)
    with open(os.path.join(ARTIFACTS_DIR, "evaluation_metrics.json"), "w") as f:
        json.dump(metrics, f, indent=2)

    print("✔ Model training complete and saved.")

if __name__ == "__main__":
    run_training()