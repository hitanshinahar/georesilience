# Technical Requirements Document (TRD)

## System Architecture
GeoShield AI employs a microservices-inspired architecture designed to integrate machine learning inference, real-time spatial analytics, and responsive user interfaces. The system strictly separates concerns across backend, frontend, ML, and geospatial layers.

## Repository Architecture
- `frontend/`: Next.js application, React components, risk map, dashboard UI.
- `backend/`: FastAPI application, API routes, data orchestration, fusion logic.
- `ml/`: Model training, data preprocessing, and inference scripts.
- `geospatial/`: Terrain processing, routing (road & terrain), and risk grids.
- `shared/`: Common contracts, schemas, and types shared across boundaries.
- `docs/`: Technical specifications and product documentation.
- `scripts/`: Shared setup and CI/CD utilities.

## Technology Stack
- **Frontend:** Next.js, React, Tailwind CSS, Mapbox GL JS (or equivalent), TypeScript.
- **Backend:** FastAPI, Python, Pydantic, SQLAlchemy.
- **Machine Learning:** Scikit-learn, XGBoost, TensorFlow/PyTorch (LSTM), SHAP.
- **Geospatial:** GDAL, Rasterio, Shapely, NetworkX, OSRM.
- **Database:** PostgreSQL (with PostGIS).
- **Deployment:** Docker, Docker Compose, GitHub Actions.

## Backend Architecture
The backend serves as the primary integration point. It ingests field reports, requests inference from the ML layer, requests terrain analysis from the geospatial layer, and exposes the aggregated data via RESTful APIs.

## ML Architecture
The machine learning pipeline is divided into:
1. Data ingestion and preprocessing.
2. Model training and evaluation.
3. Inference (serves predictions to backend).

### XGBoost Requirements
- **Goal:** Predict static landslide susceptibility.
- **Inputs:** Slope, elevation, land cover type, soil composition, historical landslide frequency.
- **Output:** Continuous risk probability (0.0 to 1.0).

### LSTM Requirements
- **Goal:** Predict temporal risk escalation.
- **Inputs:** Time-series weather data (precipitation, soil moisture over past 7, 14, 30 days).
- **Output:** Trend severity multiplier.

### Transformer Experiment
- Strictly isolated in `ml/models/transformer`.
- Evaluated as an alternative to LSTM for time-series forecasting.
- Must not block MVP deployment.

### SHAP Explainability
- **Goal:** Provide human-readable explanations.
- Computes feature importance for individual XGBoost predictions to inform users *why* an area is high risk.

## Geospatial Architecture
The geospatial pipeline processes static raster and vector data to generate features for ML and route optimization.

### Data Pipeline
Raw DEMs, land cover, and boundary shapefiles are processed into localized risk grids (GeoTIFF) and vector outputs (GeoJSON).

### Road Routing
- Uses NetworkX/OSRM on established road network graphs.
- Excludes edges (roads) intersecting with active high-risk landslide zones.

### Terrain Routing
- Computes a cost surface from slope, land cover, and risk grids.
- Uses A* algorithm (or Dijkstra) to find viable off-road emergency corridors.

## Geo-Evidence Fusion Engine
Fuses multiple risk layers.
```python
def calculate_fusion(static_risk: float, temporal_risk: float, field_evidence: float) -> float:
    return 0.55 * static_risk + 0.30 * temporal_risk + 0.15 * field_evidence
```
The backend implements this logic, combining the ML inference outputs with validated field reports.

## Database Requirements
- PostgreSQL with PostGIS extension for spatial queries.
- Tables for `zones`, `reports`, `users`, and `incidents`.

## API Requirements
Communication strictly follows defined JSON contracts in `shared/contracts/`.
- `GET /zones`
- `GET /risk/{zone_id}`
- `GET /risk/{zone_id}/explanation`
- `GET /map/risk`
- `POST /reports`
- `GET /reports`
- `POST /route/road`
- `POST /route/terrain`
- `GET /dashboard/summary`

## Frontend Requirements
- Map interface visualizing the `GET /map/risk` GeoJSON output.
- Incident report forms.
- Dashboard for risk trends and zone summaries.

## Offline Architecture
The frontend (PWA/mobile app) caches spatial tiles and allows offline submission of field reports, which are stored in IndexedDB and synchronized with the backend when the network is restored.

## Authentication
JWT-based authentication. Roles include Admin, Field Officer, and Citizen.

## Deployment
Dockerized services orchestrated via `docker-compose.yml`. Production uses container registries and managed cloud services.

## Environment Variables
- `DATABASE_URL`
- `JWT_SECRET`
- `API_KEYS` (Map providers, external weather APIs).

## Team Workstreams
- Frontend developers own the UI and API client.
- Backend developers own API, fusion, and DB schemas.
- ML developers own model artifacts and inference logic.
- Cross-boundary communication relies entirely on `shared/contracts`.

## MVP Acceptance Criteria
1. Static risk mapped across test zones.
2. Field reports successfully ingested and integrated.
3. Dashboard rendering dynamic risk.
4. Working road-aware routing prototype.
