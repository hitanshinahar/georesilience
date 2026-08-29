# GeoShield Development and Contribution Guidelines

Guidelines for building, testing, and extending the GeoShield AI codebase.

---

## Repository Architecture

```mermaid
flowchart TD
    subgraph Frontend ["Frontend-V2"]
        F1[React 19 Dashboard]
        F2[Three.js 3D Earth Loader]
        F3[Leaflet Spatial Maps]
    end

    subgraph Backend ["Backend"]
        B1[FastAPI REST API]
        B2[Geotechnical Physics Engine]
        B3[A* Routing Solver]
    end

    subgraph MachineLearning ["Machine Learning"]
        M1[XGBoost + SHAP Engine]
        M2[LSTM / Transformer Sequences]
        M3[SLM Qwen NLP Parser]
    end

    Frontend <-->|REST API / CORS| Backend
    Backend <-->|Inference Pipelines| MachineLearning
```

---

## Development Workflows

### 1. Environment Setup
- Python version: **3.10+**
- Node.js version: **18.0+**

### 2. Running Backend Services Locally
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Running Frontend Web App Locally
```bash
cd frontend-v2
npm install
npm run dev
```

### 4. Running Verification Tests
```bash
cd backend
python -m pytest tests/ -v
```

---

## Code Conventions

- **Linting and Formatting**: Follow PEP 8 for Python code and ESLint/Oxlint rules for React JavaScript/JSX.
- **Error Handling**: Every ML inference call must provide a deterministic fallback so API routes return `200 OK` during emergency deployments.
- **Git Commit Messages**: Use conventional commits (`feat:`, `fix:`, `docs:`, `style:`, `refactor:`).
