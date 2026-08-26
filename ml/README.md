# GeoResilience ML Engine

Handles landslide risk prediction using XGBoost/LightGBM. 

## Workflow
1. Prepare raw data in `data/raw/`
2. Run notebooks in `notebooks/` for exploration
3. Train model using `src/train.py`
4. Export model to `models/landslide_model.pkl`

## Integration
Provide an interface or API that matches the payload in `shared/contracts/risk-prediction.json`.
