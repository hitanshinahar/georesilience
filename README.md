# GeoShield AI

GeoShield AI is an integrated platform for early warning and landslide risk monitoring. By combining machine learning models with geospatial intelligence and field evidence, it assists in rapid response and informed decision-making.

## Problem

The North Eastern Region (NER) of India faces the critical challenge of predicting and responding to landslide risk due to its complex terrain and weather patterns.

## What the Platform Does

- Static landslide risk prediction
- Temporal risk monitoring
- GIS visualization
- Field evidence reporting
- Risk explainability
- Geo-Evidence Fusion
- Infrastructure impact analysis

## Future Roadmap (Phase 9+)

- **Road-aware routing**: Utilizing GIS graph networks (e.g. OSRM) for hazard-aware pathfinding.
- **Terrain-aware emergency corridor analysis**: Utilizing A* routing across generated cost surfaces for off-road emergency paths.
- **Real-time GIS integration**: Fetching live SRTM DEM rasters and IMD sensor feeds.
## Core ML and AI Components

XGBoost: Analyzes terrain, slope, and historical data to predict static landslide risk.
LSTM: Analyzes time-series rainfall and soil moisture to monitor temporal risk escalation.
SHAP: Identifies key factors driving the XGBoost risk predictions to provide explainability.
Vision Processing: Processes visual field reports into structured evidence (planned).
Small Language Model Processing: Processes textual field reports into structured evidence (planned).
Optional Transformer Experiment: Evaluates transformer architectures for time-series forecasting (experimental).

## System Architecture

```text
Environmental and terrain data
        |
        +--> XGBoost (Phase 1)
        |
        +--> LSTM (Phase 2)
        |
        +--> Transformer (Phase 3)

Citizen / Field Reports
        |
        +--> SLM Field Intelligence (Phase 4)
                    |
                    v
             Risk Fusion Engine (Phase 5)
                    |
                    v
          Unified Risk Assessment
                    |
                    v
    Operational Workflow (Phase 7)
    (Incidents, Alerts, Human Review)
```

## AI/ML Pipeline

1. **XGBoost (Phase 1)**: Analyzes terrain, slope, and historical data to predict static landslide risk. Includes real SHAP explanations for interpretability.
2. **LSTM (Phase 2)**: Analyzes 72-hour time-series rainfall and soil moisture to monitor temporal risk escalation. Demo scenarios generate full 72-step synthetic prototype sequences. Models execute real PyTorch inference but are trained on generated heuristic data.
3. **Transformer (Phase 3)**: Evaluates transformer architectures for alternative time-series forecasting. Demo scenarios generate full 72-step synthetic prototype sequences. Models execute real PyTorch inference but are trained on generated heuristic data.
4. **SLM Field Intelligence (Phase 4)**: Uses local Qwen2.5-0.5B-Instruct to convert unstructured textual field reports into structured heuristic evidence. The frontend field report sheet calls the backend SLM endpoint directly.
5. **Confidence-Aware Risk Fusion Engine (Phase 5)**: Synthesizes the above predictions into a unified assessment. Uses prototype decision support heuristics for model agreement and field evidence weighting, rather than statistically calibrated probabilities. Evidence coverage represents data availability.
6. **Assessment Orchestrator (Phase 6)**: Single `/api/assessment/analyze` endpoint orchestrates all models, safely handles unavailable models (marks them as unavailable rather than defaulting to zero risk), and triggers the Phase 7 operational workflow.

## Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/hitanshinahar/georesilience.git
   cd georesilience
   ```
2. **Create Python environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. **Install backend dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```
4. **Set up SLM:**
   ```bash
   python ml/models/slm/setup.py
   ```
   *(Downloads the Qwen model to `ml/artifacts/slm/model.safetensors`, which is ignored in Git)*
5. **Verify ML artifacts:**
    Ensure `ml/models/xgboost`, `lstm`, and `transformer` artifacts are present or generated.
6. **Run the backend:**
    ```bash
    cd backend
    uvicorn app.main:app --reload
    ```
7. **Set up and run the frontend:**
    ```bash
    cd frontend
    cp .env.example .env.local   # Configure API_BASE_URL if needed
    npm install
    npm run dev
    ```
    The Next.js dev server proxies `/api/*` requests to the backend via `next.config.ts` rewrites.
8. **Run tests:**
    ```bash
    cd backend
    python -m pytest tests/ -v
    python run_tests.py
    ```

## API Overview

- `GET /health`: System health check
- `POST /api/risk/predict`: Static XGBoost risk prediction
- `POST /api/risk/timeseries`: Temporal LSTM risk prediction
- `POST /api/risk/timeseries/transformer`: Temporal Transformer prediction
- `POST /api/field-intelligence/analyze`: SLM structured field intelligence extraction
- `POST /api/risk/fuse`: Confidence-Aware Risk Fusion Engine
- `POST /api/assessment/analyze`: Unified assessment orchestrator (Phase 6)
- `POST /api/reports`: Submit field report (Phase 7)
- `GET /api/incidents`: List incidents (Phase 7)
- `POST /api/incidents/{id}/review`: Human review action (Phase 7)
- `GET /api/alerts`: List alerts (Phase 7)

## Documentation

- [Product Requirements Document (PRD)](docs/PRD.md)
- [Technical Requirements Document (TRD)](docs/TRD.md)
- [Architecture](docs/ARCHITECTURE.md)
- [SIH Technical Overview](docs/SIH_TECHNICAL_OVERVIEW.md)
- [API Specifications](docs/API.md)
- [Data Specifications](docs/DATA.md)
- [Development Guidelines](docs/DEVELOPMENT.md)
