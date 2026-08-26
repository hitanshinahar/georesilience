# Technical Requirements Document

## System Architecture
GeoShield AI employs a microservices-inspired architecture designed to integrate machine learning inference, real-time spatial analytics, and responsive user interfaces. The system separates concerns across backend, frontend, ML, and geospatial layers.

## Repository Structure
frontend/: Next.js application, React components, risk map, dashboard UI.
backend/: FastAPI application, API routes, data orchestration, fusion logic.
ml/: Model training, data preprocessing, and inference scripts.
geospatial/: Terrain processing, routing, and risk grids.
shared/: Common contracts, schemas, and types shared across boundaries.
docs/: Technical specifications and product documentation.
scripts/: Shared setup and utilities.

## Technology Stack
Frontend: Next.js, React, Tailwind CSS, Mapbox GL JS, TypeScript.
Backend: FastAPI, Python, Pydantic, SQLAlchemy.
Machine Learning: Scikit-learn, XGBoost, TensorFlow/PyTorch, SHAP.
Geospatial: GDAL, Rasterio, Shapely, NetworkX, OSRM.
Database: PostgreSQL with PostGIS.
Deployment: Docker, Docker Compose, GitHub Actions.

## Frontend Architecture
The frontend is a Next.js application providing a modular dashboard and interactive risk map. It communicates strictly via REST APIs and handles offline caching for field reporting.

## Backend Architecture
The backend serves as the central orchestrator. It ingests field reports, requests inference from the ML layer, requests terrain analysis from the geospatial layer, and exposes the aggregated data via RESTful APIs.

## ML Architecture
The machine learning pipeline encompasses data ingestion, preprocessing, training, evaluation, and inference.
XGBoost: Predicts static landslide susceptibility based on slope, elevation, land cover type, soil composition, and historical landslide frequency. Outputs a continuous risk probability (0.0 to 1.0).
LSTM: Predicts temporal risk escalation using time-series weather data (precipitation, soil moisture). Outputs a trend severity multiplier.
Optional Transformer Experiment: Isolated evaluation of transformer architectures for time-series forecasting. Strictly experimental.
Field Evidence Processing: Uses vision and small language models to parse unstructured visual and textual field reports into structured data.

## SHAP Explainability
SHAP computes feature importance for individual XGBoost predictions to inform users why an area is designated as high risk.

## Geospatial Architecture
The geospatial pipeline processes static raster and vector data to generate features for ML and route optimization.

### Data Pipeline
Raw DEMs, land cover, and boundary shapefiles are processed into localized risk grids (GeoTIFF) and vector outputs (GeoJSON).

### Road Routing
Uses NetworkX or OSRM on established road network graphs. Excludes edges intersecting with active high-risk landslide zones. Operates exclusively on mapped road networks.

### Terrain Routing
Computes a cost surface from slope, land cover, and risk grids. Uses A* algorithm or Dijkstra to find viable off-road emergency corridors. Completely separate from road routing. OSRM is not used for arbitrary off-road pathfinding.

## Geo-Evidence Fusion Engine
Fuses multiple risk layers. The backend implements this logic, combining the ML inference outputs with validated field reports.

## API Architecture
Communication strictly follows defined JSON contracts in the shared directory. All interactions are stateless RESTful calls.

## Database Requirements
PostgreSQL with PostGIS extension for spatial queries. Tables for zones, reports, users, and incidents.

## Deployment
Dockerized services orchestrated via docker-compose.yml. 

## Team Ownership
Frontend developers own the UI and API client.
Backend developers own API, fusion, and DB schemas.
ML developers own model artifacts and inference logic.
Geospatial developers own terrain and routing systems.
Cross-boundary communication relies entirely on shared contracts.

## MVP Acceptance Criteria
1. Static risk mapped across test zones.
2. Field reports successfully ingested and integrated.
3. Dashboard rendering dynamic risk.
4. Working road-aware routing prototype.
