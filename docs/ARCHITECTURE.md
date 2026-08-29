# GeoShield Technical Architecture Specification

GeoShield AI is engineered as a decoupled, multi-modal microservices architecture designed for real-time landslide risk assessment, spatial visualization, and emergency response orchestration.

---

## 1. High-Level Data and Analytics Architecture

```mermaid
flowchart TD
    subgraph Data Layer
        D1[Sentinel-1 SAR & Weather Feeds]
        D2[Digital Elevation Models DEM]
        D3[Field Reports & Ground Truth]
    end

    subgraph Analytics & Physics Engines
        P1[Geotechnical Physics Engine<br/>Limit Equilibrium Method]
        M1[XGBoost Susceptibility<br/>+ SHAP Explainability]
        M2[LSTM / Transformer<br/>72h Temporal Forecasting]
        M3[SLM Field Intelligence Parser<br/>Qwen2.5-0.5B]
    end

    subgraph Evidence Fusion & Decisioning
        F1[Confidence-Aware Risk Fusion]
        O1[Incident Generator & Deduplicator]
        R1[A* Emergency Route Planner]
    end

    subgraph Client Application Layer
        C1[Command Center Panel]
        C2[Risk Analysis & Simulation]
        C3[Field Sentinel Reporting Interface]
    end

    D1 & D2 --> P1 & M1 & M2
    D3 --> M3
    P1 & M1 & M2 & M3 --> F1
    F1 --> O1 & R1
    O1 & R1 --> C1 & C2 & C3
```

---

## 2. Component Specifications

### 2.1 Limit Equilibrium Geotechnical Physics Engine
Located in `backend/app/services/physics_service.py`, this engine provides deterministic physical slope stability calculations independent of machine learning models.

- **Factor of Safety ($F_s$) Calculation**:
  $$\text{Effective Normal Stress } \sigma'_n = \max\left(0.1, \gamma \cdot z \cdot \cos^2\theta - u\right)$$
  $$\text{Resisting Shear Strength } \tau_{\text{res}} = c' + \sigma'_n \cdot \tan\phi'$$
  $$\text{Driving Shear Stress } \tau_{\text{drive}} = \gamma \cdot z \cdot \sin\theta \cdot \cos\theta$$
  $$F_s = \frac{\tau_{\text{res}}}{\max(0.1, \tau_{\text{drive}})}$$
- **Pore Water Pressure Proxy**:
  $$u = 0.098 \cdot \text{Rain}_{3\text{h}} \cdot \left(\frac{\text{Moisture}}{50}\right)$$
- **Empirical Debris Runout Estimation**:
  Calculates debris reach ($\text{km}$), inundation area ($\text{km}^2$), impacted khasras, and affected population based on slope angle and 3-hour accumulated rainfall.

### 2.2 Machine Learning Ensemble & Resilience Fallback
- **XGBoost Susceptibility Model**: Evaluates static terrain features (elevation, slope, aspect, TRI, plan curvature) and returns a baseline susceptibility score (0.0 to 1.0) along with SHAP values.
- **LSTM / Transformer Temporal Models**: Process 72-hour sequential rainfall and moisture data to detect escalating saturation.
- **SLM Natural Language Processor**: Uses Qwen2.5-0.5B-Instruct to convert unstructured text reports into structured JSON (`hazard_type`, `severity`, `urgency`, `observations`).
- **Resilience Fallback System**: If PyTorch/Transformers dependencies or trained ML model weights are absent during emergency deployments, endpoints gracefully fallback to the deterministic physics engine and rule-based heuristic parsers without throwing HTTP `503` errors.

---

## 3. Multimodal Assessment Sequence Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Field Officer / Web Client
    participant Router as FastAPI Assessment Router
    participant Physics as Physics Service
    participant ML as ML Predictors
    participant Fusion as Risk Fusion Engine
    participant DB as SQLite DB

    User->>Router: POST /api/assessment/analyze
    Router->>Physics: calculate_factor_of_safety(rain, slope, moisture, insar)
    Physics-->>Router: Fs, Pore Pressure, Shear Stress, Runout Metrics
    
    alt ML Model Available
        Router->>ML: predict_susceptibility(features)
        ML-->>Router: Static Score & SHAP Breakdown
    else ML Missing / Environment Fallback
        Router->>Router: Execute Physics Heuristic Fallback
    end

    Router->>Fusion: fuse(static_score, Fs, slm_intelligence)
    Fusion-->>Router: Unified Risk Score, Level (RED/AMBER/GREEN), Review Flag

    alt High Risk (Fs < 1.0 or Score > 75)
        Router->>DB: Deduplicate & Create Incident
        Router->>DB: Trigger Emergency Alert
    end

    Router-->>User: Return Unified Assessment JSON
```

---

## 4. Operational Incident & Alert Workflow

```mermaid
stateDiagram-v2
    [*] --> Detection
    Detection --> OPEN: Create Incident (Haversine Deduplication)
    
    state OPEN {
        [*] --> Unverified
        Unverified --> UNDER_REVIEW: Operator Assigns Incident
    }

    UNDER_REVIEW --> FIELD_VERIFIED: Ground Truth Confirmed
    UNDER_REVIEW --> DISMISSED: Invalid Report / False Positive

    FIELD_VERIFIED --> ESCALATED: Emergency Alert Dispatched
    ESCALATED --> RESOLVED: Road Cleared & Slope Stabilized

    DISMISSED --> [*]
    RESOLVED --> [*]
```

---

## 5. LAN & Emergency Deployment Architecture

```mermaid
flowchart LR
    subgraph Host Laptop (Single Source of Truth)
        B[Backend FastAPI Server<br/>Host: 0.0.0.0 : 8000]
        F[Frontend Vite Dev Server<br/>Host: 0.0.0.0 : 5173]
        DB[(SQLite Database<br/>georesilience.db)]
        B <--> DB
        F <-->|VITE_API_BASE_URL| B
    end

    subgraph Client Machine (Friend's Mac / Mobile)
        C[Browser Only<br/>http://LAN_IP:5173]
    end

    C <-->|HTTP / CORS| F
    C <-->|API Calls| B
```

- **Host Binding**: Uvicorn binds to `0.0.0.0:8000` and Vite binds to `0.0.0.0:5173`.
- **Zero Client Overhead**: Client machines (Mac, iPhone, Android) require no Python, Node.js, SQLite, or model installations - only a standard web browser.
- **CORS Handling**: `CORSMiddleware` configured with `allow_origins=["*"]` to allow seamless local network API execution.
