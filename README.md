# GeoShield 🇮🇳 — National AI Landslide Early Warning & Disaster Resilience Platform

[![Python 3.10+](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-r128-black?style=flat-square&logo=three.js&logoColor=white)](https://threejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

**GeoShield 🇮🇳** is an integrated AI-driven early warning, geotechnical risk analysis, and emergency response platform engineered for landslide-prone regions, with a specialized focus on the North Eastern Region (NER) of India and Himalayan transport corridors (e.g. NH-10).

The system fuses static terrain GIS rasters, real-time meteorological feeds, limit-equilibrium geotechnical physics calculations, machine learning ensembles (XGBoost + SHAP, temporal LSTM/Transformers), and Small Language Model (SLM) field intelligence into parcel-level (Khasra) risk scores and emergency response workflows.

---

## 🌟 Key Features

- 🌐 **3D Photorealistic Earth Intro Loader**: Built with Three.js WebGL rendering, NASA satellite textures, specular ocean reflections, Rayleigh atmosphere scattering, and scroll-triggered camera zoom scrubbing.
- 🏔️ **Geotechnical Limit Equilibrium Engine**: Calculates real-time Factor of Safety ($F_s$), pore water pressure, shear stress, and debris runout reach/inundation area.
- 🤖 **Multimodal AI Ensemble**:
  - **XGBoost Susceptibility**: Predicts baseline terrain risk with SHAP factor attribution.
  - **Temporal LSTM & Transformer**: Analyzes 72-hour antecedent rainfall accumulators and soil moisture trends.
  - **SLM Field Intelligence**: Localized NLP parser (Qwen2.5-0.5B) extracting hazard type, severity, and urgency from citizen text reports.
- 🗺️ **Parcel-Level Khasra Cadastre Visualization**: Interactive Leaflet maps mapping risk predictions to cadastral land parcels (e.g. Khasra 104/A, 104/B, 108).
- 🧭 **Safe Disaster Routing**: A* shortest path algorithm avoiding high-risk zones and active landslide blockages along critical highways.
- 📱 **Responsive & LAN-Ready Architecture**: Built for emergency field deployments with binding to `0.0.0.0`, configurable `VITE_API_BASE_URL`, and internal sidebar collapse toggles for desktop and mobile devices.

---

## 🏗️ System Architecture & Data Flow

```mermaid
flowchart TD
    subgraph Data Sources & Telemetry
        A1[📡 Sentinel-1 SAR & Weather Feeds]
        A2[🗺️ DEM Spatial Raster / Elevation]
        A3[📱 Citizen & Field Reports]
    end

    subgraph AI & Geotechnical Analytics Core
        B1[🧮 Limit Equilibrium Physics Engine<br/>Factor of Safety Fs, Pore Pressure, Shear]
        B2[🌲 XGBoost Susceptibility + SHAP]
        B3[📈 LSTM & Transformer Temporal Risk]
        B4[🤖 SLM Field Intelligence Parser<br/>Qwen2.5-0.5B]
    end

    subgraph Decision Engine
        C1[⚖️ Confidence-Aware Risk Fusion]
        C2[🚨 Operational Incident & Alert Manager]
        C3[🧭 A* Emergency Route Planner]
    end

    subgraph Presentation & Client Layer
        D1[🖥️ Operations Command Center]
        D2[📊 Risk Analysis & Simulation]
        D3[📱 Field Sentinel Mobile App]
    end

    A1 & A2 --> B1 & B2 & B3
    A3 --> B4
    B1 & B2 & B3 & B4 --> C1
    C1 --> C2 & C3
    C2 & C3 --> D1 & D2 & D3
```

---

## ⚡ Risk Fusion Sequence

```mermaid
sequenceDiagram
    autonumber
    actor Client as Frontend / Operator
    participant API as FastAPI Backend
    participant Physics as Geotechnical Physics Engine
    participant ML as ML Ensemble (XGBoost / LSTM)
    participant Fusion as Risk Fusion Engine
    participant DB as SQLite Storage

    Client->>API: POST /api/assessment/analyze (features & report)
    API->>Physics: Calculate Factor of Safety (Fs), Shear, Pore Pressure
    Physics-->>API: Physics Metrics & Runout Estimate
    API->>ML: Predict Susceptibility & Temporal Risk
    alt ML Available
        ML-->>API: ML Risk Probabilities & SHAP Factors
    else ML Unavailable / Fallback
        API-->>API: Execute Heuristic Physics Fallback
    end
    API->>Fusion: Fuse Physics, ML Scores, and SLM Evidence
    Fusion-->>API: Unified Risk Score, Level (RED/AMBER/GREEN), & Review Flag
    API->>DB: Store Incident / Trigger Push Alert (if CRITICAL)
    API-->>Client: Return Unified Assessment & Spatial Coordinates
```

---

## 🔄 Emergency Incident Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Detection: High Risk (Fs < 1.0 or Score > 75)
    Detection --> OPEN: Auto-Deduplicate & Create Incident
    
    state OPEN {
        [*] --> Unverified
        Unverified --> UNDER_REVIEW: Assigned to Dispatch Operator
    }
    
    UNDER_REVIEW --> FIELD_VERIFIED: Field Sentinel Confirms Ground Truth
    UNDER_REVIEW --> DISMISSED: Verified False Alarm
    
    FIELD_VERIFIED --> ESCALATED: Evacuation / Highway Closure Ordered
    ESCALATED --> RESOLVED: Debris Cleared & Slope Stabilized
    DISMISSED --> [*]
    RESOLVED --> [*]
```

---

## 🛠️ Quick Start & Setup Guide

### 1. Repository Setup

```bash
git clone https://github.com/hitanshinahar/georesilience.git
cd georesilience
```

### 2. Backend Setup (FastAPI)

```bash
cd backend

# Create & activate Python virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI dev server (listening on 0.0.0.0 for LAN access)
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Backend will be available at:
- Local: `http://localhost:8000`
- Health Check: `http://localhost:8000/health`
- Interactive API Docs (Swagger): `http://localhost:8000/docs`

### 3. Frontend Setup (React + Vite)

In a new terminal:

```bash
cd frontend-v2

# Install Node dependencies
npm install

# Configure environment variable (Optional for LAN access)
# Edit .env file:
# VITE_API_BASE_URL=http://<YOUR_LAPTOP_IP>:8000

# Start Vite dev server
npm run dev
```

Frontend will be available at:
- Web App: `http://localhost:5173`
- LAN Access: `http://<YOUR_LAN_IP>:5173`

---

## 📡 Live REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | System health check and status verification |
| `GET` | `/api/weather/current` | Live meteorological telemetry (rainfall accumulators, moisture) |
| `GET` | `/api/spatial/terrain` | Spatial DEM features (slope, aspect, elevation, TRI) |
| `POST` | `/api/risk/predict` | Geotechnical physics & ML landslide risk assessment |
| `POST` | `/api/routing/astar` | A* emergency route planning avoiding hazard zones |
| `POST` | `/api/field-intelligence/analyze` | SLM natural language extraction from text reports |
| `GET` | `/api/incidents` | List active hazard incidents |
| `PATCH` | `/api/incidents/{id}` | Update incident review status (`FIELD_VERIFIED`, `RESOLVED`) |
| `GET` | `/api/alerts` | Active emergency notifications |
| `GET` | `/api/reports` | Historical field intelligence reports |

---

## 📁 Repository Structure

```text
georesilience/
├── backend/                  # FastAPI Application & Business Services
│   ├── app/
│   │   ├── core/            # Database initialization & SQLite models
│   │   ├── routers/         # REST API route handlers
│   │   ├── schemas/         # Pydantic data schemas
│   │   └── services/        # Physics engine, A* routing, incident logic
│   └── requirements.txt
├── frontend-v2/              # React 19 + Vite + Three.js Frontend
│   ├── src/
│   │   ├── api/             # GeoAPI client with environment configuration
│   │   ├── components/      # EarthLoader, AppShell, Topbar, Sidebar
│   │   ├── pages/           # Command Center, Risk Analysis, Simulation
│   │   └── index.css        # Core design tokens
│   ├── package.json
│   └── vite.config.js
├── ml/                       # Machine Learning Models & Inference Scripts
│   ├── artifacts/           # Model weights (XGBoost, SLM tokenizer)
│   ├── fusion/              # Risk fusion normalizer & engine
│   ├── inference/           # XGBoost prediction pipeline
│   └── models/              # LSTM, Transformer & SLM predictors
├── geospatial/               # GIS data processing utilities
└── docs/                     # Technical Documentation & Architecture Specs
```

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.
