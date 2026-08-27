# Smart India Hackathon: GeoShield AI Technical Overview

## 1. Problem
The North Eastern Region (NER) of India faces the critical challenge of predicting and responding to landslide risk due to its complex terrain and weather patterns. Existing solutions often rely on single-modality data (e.g., only rainfall or only terrain), leading to false positives or missed warnings when environmental signals disagree with on-ground reality.

## 2. Technical Challenge
Fusing disparate data sources—static terrain features, time-series weather data, and unstructured human intelligence—into a single, reliable, confidence-aware decision support metric.

## 3. System Architecture
Data flows from environmental sources and field reports into specialized ML engines. The Backend fuses these insights using the Confidence-Aware Risk Fusion Engine and serves the aggregated risk intelligence to the Frontend via REST APIs.

## 4. Why Multiple AI Models?
No single model can capture all aspects of landslide risk. Terrain models miss immediate weather triggers. Weather models miss localized terrain weaknesses. Neither can detect real-time ground cracks reported by citizens. An ensemble approach with multi-modal inputs provides a more robust, holistic risk assessment.

## 5. Role of XGBoost (Phase 1)
Analyzes static terrain, slope, soil, and historical data to predict static landslide susceptibility. It provides the base environmental risk level and utilizes SHAP to explain *why* a location is susceptible.

## 6. Role of LSTM (Phase 2)
Analyzes 72-hour time-series rainfall and soil moisture to monitor temporal risk escalation. It captures the compounding effect of antecedent rainfall on slope stability.

## 7. Role of Transformer (Phase 3)
Evaluates transformer architectures for alternative time-series forecasting. It captures longer-range dependencies and complex patterns in weather sequences compared to standard LSTMs.

## 8. Role of the SLM (Phase 4)
Uses a small, localized Large Language Model (Qwen2.5-0.5B-Instruct) to parse unstructured textual field reports from citizens or officers into structured heuristic evidence (e.g., hazard type, severity, urgency, observations). This enables automated ingestion of human intelligence without requiring manual data entry forms for every scenario.

## 9. Risk Fusion Differentiator (Phase 5)
Instead of a naive average, the Geo-Evidence Fusion Engine uses confidence-aware weighting. It normalizes inputs, detects agreement/disagreement among numerical models, and uses field evidence as a heuristic corroboration/escalation factor. It outputs decision-support metrics like `recommended_action`, `requires_human_review`, and `evidence_coverage` (not prediction probability).

## 10. Explainability
The system is designed for transparency:
- XGBoost provides SHAP values for base terrain risk.
- The Fusion Engine returns `contributing_factors` deterministically derived from the weighted input scores, showing exactly how each model influenced the final score.

## 11. Handling Model Disagreement
The engine measures the spread (max - min) of numerical model predictions. If the spread is large (low agreement), it explicitly flags `requires_human_review = true` rather than averaging them into a misleading "medium" risk. 

## 12. Offline/Failure Considerations
- **Unavailable Sources:** Models that fail to report or are unavailable are dynamically excluded from the normalized weighting. They are not treated as zero-risk.
- **Insufficient Data:** If fewer than two numerical models are available, the system flags `model_agreement = insufficient_data` and triggers human review.
- **Local SLM:** The field intelligence model is small (0.5B parameters) and runs locally, preventing reliance on external APIs during connectivity outages.

## 13. Prototype Limitations
- The temporal models currently use synthetic/demo data for sequence generation.
- Fusion weights and risk thresholds are prototype rules/heuristics designed for the hackathon, not statistically calibrated probabilities derived from historical landslide outcomes.
- SLM extraction confidence is not a disaster prediction confidence.

## 14. Future Roadmap
- Integration of Computer Vision (segmentation/classification) for crack detection in images.
- Calibration of source reliability factors against real historical landslide outcomes.
- Dynamic GIS routing integration based on real-time risk assessments.
