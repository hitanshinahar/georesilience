# Machine Learning Subsystem — Landslide Static Susceptibility Core

## 1. Overview & Scope
This directory contains the baseline **Static Landslide Susceptibility Model** built on XGBoost. 
Its responsibility is strictly scoped to predicting spatial slope vulnerability based on historical events and topographic drivers. It outputs an intermediate `static_susceptibility_score` which is fed into the backend **Geo-Evidence Fusion Engine** alongside real-time field reports and temporal radar streams.

---

## 2. Feature Provenance & Categorization

| Feature Name | Source Type | Underlying Dataset / Proxy |
| :--- | :--- | :--- |
| `elevation_m` | **Derived** | SRTM 30m Digital Elevation Model |
| `slope_deg` | **Derived** | Topographic gradient derivative |
| `aspect_deg` | **Derived** | Slope direction derivative |
| `tri_ruggedness` | **Derived** | Terrain Ruggedness Index |
| `plan_curvature` | **Derived** | Contour curvature profile |
| `rainfall_3h_accum_mm` | **Simulated Proxy** | Dynamic precipitation burst proxy |
| `rainfall_72h_accum_mm` | **Simulated Proxy** | Antecedent Precipitation Index (API) |
| `soil_moisture_saturation_pct`| **Simulated Proxy** | Root-zone soil saturation proxy |
| `ground_deformation_proxy_mm_yr`| **Simulated Proxy**| Pre-failure ground creep proxy |
| `anthropogenic_load_proxy_kpa`| **Simulated Proxy**| Cadastral building load overburden proxy |

---

## 3. Current Prototype Limitations

> **Important Statement on Operational Context:**
> - **Benchmark Grounding:** Historical event coordinates are derived from the NASA Global Landslide Catalog (GLC) filtered for the Indian subcontinent.
> - **Data Provenance:** Dynamic weather and InSAR variables are explicitly labeled as **simulated proxies** for prototype demonstration.
> - **Evaluation Context:** Reported metrics represent **Historical Event Grounded Prototype Evaluation** across spatial longitude holdout blocks, not certified operational real-world forecasting accuracy.
> - **InSAR Claims:** True interferometric SAR processing requires full Sentinel-1 SLC pipeline integration, which will be coupled in Phase 2.