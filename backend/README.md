# GeoResilience Backend

The backend is built with FastAPI. It handles API requests, orchestrates data from the ML and Geospatial engines, and evaluates priority scoring.

## Getting Started

```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Structure
- `app/routers/`: API endpoints
- `app/services/`: Business logic
- `app/schemas/`: Pydantic models (matching `shared/contracts/`)
