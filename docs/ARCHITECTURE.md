# Technical Architecture

The GeoShield AI architecture follows a clear separation of concerns, orchestrated by the central Backend service. 

## High-Level Data Flow

```mermaid
flowchart TD
    %% Data Sources
    subgraph Data Sources
        ENV[Environmental Data]
        TER[Terrain/DEM Data]
        WEA[Weather & Rainfall]
        FIELD[Field Reports]
    end

    %% Processing & ML Layer
    subgraph ML & Geospatial
        GEO[Geospatial Feature Engineering]
        XGB[XGBoost Static Risk]
        LSTM[LSTM Temporal Risk]
        EVID[Vision/SLM Evidence Processing]
    end

    %% Orchestration & Fusion
    subgraph Backend Orchestration
        FUSION[Geo-Evidence Fusion Engine]
        INTEL[Impact & Access Intelligence]
        API[FastAPI Gateway]
    end

    %% Presentation Layer
    subgraph Frontend Client
        UI[Dashboard & Alerts]
        MAP[Risk Map UI]
    end

    %% Flows
    ENV --> GEO
    TER --> GEO
    WEA --> LSTM
    FIELD --> EVID
    
    GEO --> XGB
    
    XGB --> FUSION
    LSTM --> FUSION
    EVID --> FUSION
    
    FUSION --> INTEL
    INTEL --> API
    API --> UI
    API --> MAP
```

## Module Boundaries

### Frontend
- Communicates exclusively with the Backend via REST APIs.
- Agnostic of ML and Geospatial implementation details.

### Backend
- Acts as the orchestrator.
- Queries the ML and Geospatial services internally (or imports modules).
- Executes the `Geo-Evidence Fusion Engine`.

### Machine Learning (ML)
- Receives raw or engineered features.
- Returns risk predictions and explanations (SHAP).

### Geospatial
- Generates base grids, slope analyses, and cost surfaces.
- Performs all vector math.

## Routing Systems Architecture

GeoShield AI implements two strictly separated routing paradigms:

```mermaid
flowchart LR
    REQ[Route Request] --> DECISION{Is Road Network Available?}
    DECISION -- Yes --> ROAD[Road Routing]
    DECISION -- No --> TERR[Terrain Routing]

    subgraph Road Routing
        RN[Mapped Road Network]
        CLOSURES[Road Closures]
        HIGH_RISK[Risk Intersections]
        RN --> OR[OSRM / NetworkX]
        CLOSURES --> OR
        HIGH_RISK --> OR
    end

    subgraph Terrain Routing
        SLOPE[Slope Difficulty]
        LC[Land Cover Penalty]
        RISK[Landslide Risk Grid]
        BARRIER[Impassable Barriers]
        SLOPE --> COST[Cost Surface]
        LC --> COST
        RISK --> COST
        BARRIER --> COST
        COST --> ASTAR[A* / Dijkstra Algorithm]
    end

    OR --> RES[Safe Route]
    ASTAR --> RES
```

**Crucial Note on Routing Limits:** 
Standard road routing systems (like OSRM or Google Maps) cannot perform unrestricted off-road pathfinding. Therefore, GeoShield implements custom Terrain Routing using a computed cost surface and A* search for emergency off-road corridors.
