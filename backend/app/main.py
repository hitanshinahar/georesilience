from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import risk_router, slm_router, fusion_router
from app.core.database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize database
    init_db()
    yield
    # Shutdown: nothing to clean up for SQLite


app = FastAPI(title="GeoResilience API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Existing routers (unchanged)
app.include_router(risk_router.router, prefix="/api/risk", tags=["Risk"])
app.include_router(fusion_router.router, prefix="/api/risk", tags=["Fusion"])
app.include_router(slm_router.router, prefix="/api/field-intelligence", tags=["Intelligence"])
from app.routers import assessment_router
app.include_router(assessment_router.router, prefix="/api/assessment", tags=["Assessment"])

# Phase 7 routers
from app.routers import report_router, incident_router, alert_router
app.include_router(report_router.router, prefix="/api/reports", tags=["Reports"])
app.include_router(incident_router.router, prefix="/api/incidents", tags=["Incidents"])
app.include_router(alert_router.router, prefix="/api/alerts", tags=["Alerts"])

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "georesilience-backend"}
