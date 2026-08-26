# Data Specifications

GeoShield AI relies on a variety of environmental, terrain, and crowdsourced datasets.

## Required Datasets & Formats

### Digital Elevation Model (DEM)
- **Source:** SRTM or local high-resolution LiDAR surveys.
- **Format:** GeoTIFF.
- **Usage:** Derivation of slope, aspect, and baseline terrain routing cost.

### Land Cover Data
- **Source:** Copernicus Global Land Service or local surveys.
- **Format:** GeoTIFF or Shapefiles.
- **Usage:** Identifies vegetation density, soil type proxies, and impassable terrain (e.g., deep water bodies).

### Rainfall and Soil Moisture
- **Source:** IMD (Indian Meteorological Department) or satellite estimates (e.g., GPM).
- **Format:** NetCDF or CSV time-series.
- **Usage:** Ingested by the LSTM model to compute temporal risk escalation.

### Historical Landslide Data
- **Source:** GSI (Geological Survey of India) catalogues.
- **Format:** CSV / GeoJSON.
- **Usage:** Ground truth for training the XGBoost static risk model.

### Road Networks
- **Source:** OpenStreetMap (OSM) or regional DOT data.
- **Format:** Shapefiles / GeoJSON.
- **Usage:** Graph generation for road-aware routing.

### Field Reports
- **Source:** GeoShield frontend client.
- **Format:** JSON (following `shared/contracts/field-report.json`).
- **Usage:** Real-time ground truth for the Geo-Evidence Fusion Engine.

## Processing Pipeline
1. **Raw Ingestion:** Files are stored in `geospatial/data/` or `ml/data/raw/`.
2. **Standardization:** Geospatial scripts reproject all spatial data to a common CRS (e.g., EPSG:4326 or local projected CRS).
3. **Feature Engineering:** Scripts in `ml/preprocessing/` extract pixel-wise features (slope, aspect, antecedent rainfall) and construct tabular datasets.
4. **Output:** Cleaned data moves to `ml/data/processed/` for training.

## Sample Data Usage
Currently, the repository relies on **sample data** located in `ml/data/sample/` and mock JSON responses in the frontend. This synthetic data simulates the complex terrain and weather patterns of the NER to facilitate UI and API development while real data pipelines are finalized. 
*Do not treat sample data as live operational data.*
