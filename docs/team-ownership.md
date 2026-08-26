# Team Ownership

This document defines module boundaries for the Smart India Hackathon GeoResilience project. To minimize merge conflicts, each member is responsible for a specific directory structure.

---

## HITANSHI — ARCHITECTURE + INTEGRATION
**Primary Ownership:**
- `shared/`
- Backend integration logic
- API contracts
- Priority orchestration
- Deployment and final integration
- Documentation architecture

**Responsibilities:**
- Define and maintain data contracts.
- Connect ML and geospatial outputs to backend APIs.
- Maintain priority scoring orchestration logic.
- Ensure the complete end-to-end demo works.

*Note: Hitanshi is allowed to modify any module ONLY when required for integration.*

---

## AARYA — CORE FRONTEND
**Primary Ownership:**
- `frontend/app/command-center/`
- `frontend/app/risk-map/`
- `frontend/app/incidents/`
- `frontend/app/infrastructure/`
- `frontend/components/layout/`
- `frontend/components/dashboard/`
- `frontend/components/map/`
- `frontend/components/risk/`
- `frontend/components/infrastructure/`
- `frontend/components/charts/`

**Responsibilities:**
- Overall frontend architecture.
- Command Center, Risk Map, Zone Intelligence, Infrastructure Impact UI.
- Dashboard responsiveness and design consistency.

---

## FENIL — FIELD REPORTING FRONTEND
**Primary Ownership:**
- `frontend/app/field-reports/`
- `frontend/components/field-reports/`

**Responsibilities:**
- Field report interface (form, image upload, GPS).
- Report status and AI analysis result display.
- Verification timeline.

*Note: Fenil must consume shared API contracts and avoid modifying core dashboard architecture.*

---

## HARSHAL — MACHINE LEARNING
**Primary Ownership:**
- `ml/`

**Responsibilities:**
- Dataset preparation, feature engineering, baseline model (XGBoost/LightGBM).
- Model evaluation and SHAP explainability.
- Exporting model artifact to `ml/models/landslide_model.pkl`.
- Providing prediction interface matching `shared/contracts/risk-prediction.json`.

---

## PURV — GEOSPATIAL DATA + IMPACT
**Primary Ownership:**
- `geospatial/`

**Responsibilities:**
- Preparing datasets (roads, villages, hospitals, shelters).
- Proximity and road connectivity analysis.
- Infrastructure impact output matching `shared/contracts/infrastructure-impact.json`.

---

## JANHAVI — RESEARCH + QA + DEMO DATA
**Primary Ownership:**
- `docs/research/`
- `shared/mock-data/`
- `docs/demo-flow.md`

**Responsibilities:**
- Dataset research and demo data validation.
- Testing all user flows.
- Preparing demo scenarios and QA checklist.
