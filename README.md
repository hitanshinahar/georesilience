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
- Road-aware routing
- Terrain-aware emergency corridor analysis

## Core ML and AI Components

XGBoost: Analyzes terrain, slope, and historical data to predict static landslide risk.
LSTM: Analyzes time-series rainfall and soil moisture to monitor temporal risk escalation.
SHAP: Identifies key factors driving the XGBoost risk predictions to provide explainability.
Vision Processing: Processes visual field reports into structured evidence (planned).
Small Language Model Processing: Processes textual field reports into structured evidence (planned).
Optional Transformer Experiment: Evaluates transformer architectures for time-series forecasting (experimental).

## Architecture

GeoShield AI employs a microservices architecture separating frontend UI, backend orchestration, machine learning inference, and geospatial processing. Data flows from environmental sources and field reports into ML and Geospatial engines. The Backend fuses these insights using the Geo-Evidence Fusion Engine and serves the aggregated risk intelligence to the Frontend via REST APIs.

## Repository Structure

```
geoshield-ai/
├── frontend/
├── backend/
├── ml/
│   ├── data/
│   │   ├── raw/
│   │   ├── processed/
│   │   └── sample/
│   ├── preprocessing/
│   ├── models/
│   │   ├── xgboost/
│   │   ├── lstm/
│   │   ├── transformer/
│   │   └── vision/
│   ├── training/
│   ├── inference/
│   └── evaluation/
├── geospatial/
│   ├── data/
│   │   ├── dem/
│   │   ├── landcover/
│   │   ├── boundaries/
│   │   └── roads/
│   ├── processing/
│   └── routing/
├── shared/
│   ├── contracts/
│   ├── constants/
│   └── types/
├── docs/
└── scripts/
```

## Technology Stack

- Frontend: Next.js, React, Tailwind CSS, TypeScript
- Backend: FastAPI, Python
- Machine Learning: Scikit-learn, XGBoost, TensorFlow/PyTorch
- Geospatial: NetworkX, OSRM (for road routing)
- Database: PostgreSQL, PostGIS

## Getting Started

### Frontend UI Development

The frontend currently utilizes a mock API, allowing UI development without a running backend.

```bash
cd frontend
npm install
npm run dev
```

## Documentation

- [Product Requirements Document (PRD)](docs/PRD.md)
- [Technical Requirements Document (TRD)](docs/TRD.md)
- [Architecture](docs/ARCHITECTURE.md)
- [API Specifications](docs/API.md)
- [Data Specifications](docs/DATA.md)
- [Development Guidelines](docs/DEVELOPMENT.md)
