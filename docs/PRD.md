# Product Requirements Document

## Problem Statement
SIH26001: AI-Based Early Warning and Landslide Risk Monitoring System in the North Eastern Region.

## Problem Background
The North Eastern Region (NER) of India is highly susceptible to landslides due to its complex terrain, heavy rainfall, and geological vulnerabilities. Early warning systems are crucial to prevent loss of life, mitigate infrastructure damage, and coordinate rapid response. Current systems often fail to fuse static geospatial risks with dynamic weather conditions and real-time field reports.

## Product Vision
GeoShield AI provides an integrated platform for early warning and landslide risk monitoring. By combining machine learning models with geospatial intelligence and crowdsourced field evidence, it acts as a proactive shield against natural disasters in the NER.

## Target Users
1. Decision Makers and Authorities: Rely on dashboards for high-level risk overview, resource allocation, and policy making.
2. Field Officers and First Responders: Submit real-time field reports, assess ground reality, and require safe routing to affected zones.
3. Citizens: Submit geo-tagged hazard reports.
4. Data Scientists and GIS Analysts: Monitor model accuracy, explainability, and update geospatial layers.

## Major Product Modules
1. Authority Dashboard and GIS Risk Visualization: Interactive UI for visualization, alerts, and incident management.
2. Static Risk Prediction: XGBoost model analyzing baseline environmental data.
3. Temporal Risk Forecasting: LSTM model analyzing weather escalations.
4. Field and Citizen Evidence: Reporting interfaces for ground truth collection.
5. Geo-Evidence Fusion Engine: Core logic aggregating risk from multiple sources.

## Geo-Evidence Fusion Engine
Combines distinct risk vectors:
1. Static Risk: Environmental baseline.
2. Temporal Risk: Weather-driven escalations.
3. Field Evidence: Ground reality reports.

Prototype formula:
> [!WARNING] 
> This original static weighting formula was superseded in Phase 5. The implemented Confidence-Aware Risk Fusion Engine uses dynamic weights based on `base_importance * reliability_factor * availability`, incorporates model agreement detection, and uses field evidence as a heuristic escalation factor rather than a strict weighted sum. See `ml/fusion/README.md` for current implementation details.
## Machine Learning Models
XGBoost calculates static and geospatial landslide susceptibility based on terrain, slope, and historical data.
LSTM (Long Short-Term Memory) monitors temporal risk escalation based on sequential data like rainfall and soil moisture.
Transformer models are an optional experimental feature and strictly non-blocking for the MVP.
Vision and small language model (SLM) processing converts visual and textual field reports into structured disaster evidence.

## Explainability
SHAP is used to provide feature importance for high-risk predictions, explaining the static risk score drivers.

## Infrastructure and Connectivity Impact
The platform assesses the exposure of infrastructure and settlements to landslide risk.

## Routing Systems
Road-aware emergency routing uses mapped road networks, closures, and risk segments to find safer routes.
Terrain-aware emergency corridor generation is used when viable road routes are unavailable, employing cost surface algorithms to calculate off-road corridors.

## Offline Field Reporting
The architecture supports offline data collection for field officers, syncing when connectivity is restored.

## MVP Scope
XGBoost static risk prediction.
Basic LSTM temporal analysis.
Dashboard with GIS risk visualization.
Manual and simulated field report ingestion.
Basic Geo-Evidence Fusion.
Road-aware routing prototype.

## Experimental Features
Vision and SLM field evidence processing.
Transformer model for time-series forecasting.

## Future Scope
Dynamic terrain-aware emergency corridor routing.
Advanced infrastructure exposure analysis.
