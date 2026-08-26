# Data Specifications

GeoShield AI relies on a variety of environmental, terrain, and crowdsourced datasets.

## Required Datasets

### DEM and Terrain Data
Elevation and slope data derived from Digital Elevation Models. Used for calculating baseline terrain routing cost and static risk features.

### Rainfall and Soil Moisture
Time-series precipitation and moisture data. Ingested by the LSTM model to compute temporal risk escalation.

### Historical Landslide Records
Ground truth catalogues for training the XGBoost static risk model.

### Land Cover
Identifies vegetation density, soil type proxies, and impassable terrain. Used as a penalty layer in terrain routing.

### Road Network Data
Mapped vector data of established infrastructure for road-aware routing.

### Field Reports
Real-time ground truth submitted by users for the Geo-Evidence Fusion Engine.

## Data Categories

Real Data: Production pipelines will connect to active APIs and verified geological surveys.
Sample Data: The repository currently relies on sample datasets located in ml/data/sample/ and mock JSON responses in the frontend. This facilitates UI and API development while real data pipelines are finalized.
Synthetic Data: Demo scenarios may use generated data to simulate extreme weather events for testing routing constraints.
Future Integrations: Automated ingestion of satellite imagery for dynamic land cover updates is a planned future integration.

Important: Do not treat sample data as live operational data.
