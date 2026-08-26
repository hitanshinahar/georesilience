# Product Requirements Document (PRD)

## Problem Statement
**SIH26001: AI-Based Early Warning and Landslide Risk Monitoring System in the North Eastern Region.**

## Problem Background
The North Eastern Region (NER) of India is highly susceptible to landslides due to its complex terrain, heavy rainfall, and geological vulnerabilities. Early warning systems are crucial to prevent loss of life, mitigate infrastructure damage, and coordinate rapid response. Current systems lack the ability to fuse static geospatial risks with dynamic weather conditions and real-time field reports.

## Product Vision
GeoShield AI provides an integrated, intelligent platform for early warning and landslide risk monitoring. By combining state-of-the-art machine learning models with geospatial intelligence and crowdsourced field evidence, it acts as a proactive shield against natural disasters in the NER.

## Core Differentiator
The core differentiator of GeoShield AI is the **Geo-Evidence Fusion Engine**, which synthesizes environmental static risks, dynamic temporal escalations, and real-time field reports into a single, cohesive, actionable risk assessment.

## User Types
1. **Decision Makers & Authorities:** Rely on dashboards for high-level risk overview, resource allocation, and policy making.
2. **Field Officers & First Responders:** Submit real-time field reports, assess ground reality, and require safe routing to affected zones.
3. **Citizens:** Submit geo-tagged hazard reports (crowdsourcing).
4. **Data Scientists & GIS Analysts:** Monitor model accuracy, explainability (SHAP), and update geospatial layers.

## Major Product Modules
1. **Frontend Dashboard & Risk Map:** Interactive UI for visualization, alerts, and incident management.
2. **Backend API & Orchestration:** Fast and scalable services orchestrating the ML and geospatial engines.
3. **Geo-Evidence Fusion Engine:** Core logic aggregating risk from multiple sources.
4. **Machine Learning Pipeline:** Predictive models (XGBoost, LSTM) and evidence processing (Vision/SLM).
5. **Geospatial Processing & Routing:** GIS intelligence, terrain analysis, and pathfinding.

## Functional Requirements
- Display real-time risk maps with zone-specific analytics.
- Accept and process field reports containing textual and visual evidence.
- Generate explanations for high-risk predictions.
- Provide safe routing options avoiding high-risk zones.

## Geo-Evidence Fusion Engine
Combines three distinct risk vectors:
1. **Static Risk:** Environmental baseline.
2. **Temporal Risk:** Weather-driven escalations.
3. **Field Evidence:** Ground reality reports.

*Prototype formula:*
`final_risk = 0.55 * static_risk + 0.30 * temporal_risk + 0.15 * field_evidence`
*(Note: Weights are prototype parameters and configurable.)*

## Machine Learning Models
- **XGBoost:** Calculates static and geospatial landslide susceptibility based on terrain, slope, and historical data.
- **LSTM (Long Short-Term Memory):** Monitors temporal risk escalation based on sequential data like rainfall and soil moisture.
- **Transformer (Optional):** An experimental model, strictly non-blocking for the MVP.
- **Vision and SLM:** Processes visual and textual field reports into structured disaster evidence.

## GIS Intelligence
Processes DEM, slope, elevation, land cover, and risk grids. Outputs GeoJSON for frontend rendering and supports advanced routing cost surfaces.

## Routing Systems
### Road-aware Routing
Uses mapped road networks, road closures, and risk segments to find safer available routes on established infrastructure.

### Terrain-aware Routing
Used when viable road routes are destroyed or unavailable. Employs A* (primary) or Dijkstra to calculate emergency off-road corridors based on slope difficulty, land cover, landslide risk, and impassable barriers.

## Response Prioritization
The system prioritizes response based on:
1. Final risk and escalation trend.
2. Field evidence severity.
3. Infrastructure and settlement exposure.
4. Route accessibility.

## Offline Field Reporting
Architecture supports offline data collection for field officers, syncing when connectivity is restored.

## MVP Scope
- XGBoost static risk prediction.
- Basic LSTM temporal analysis.
- Dashboard with risk map visualization.
- Manual and simulated field report ingestion.
- Basic Geo-Evidence Fusion.
- Road-aware routing prototype.

## Advanced Features
- Full Vision/SLM field evidence processing.
- Dynamic terrain-aware emergency corridor routing.
- Advanced infrastructure exposure analysis.

## Explicitly Out-of-Scope Features
- Real-time satellite imagery processing (cost/latency constraints).
- Full social media scraping (outside primary problem statement).
- Hardware sensor deployment (software solution focus).
