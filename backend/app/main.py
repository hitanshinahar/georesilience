from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import risk_router, slm_router

app = FastAPI(title="GeoResilience API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(risk_router.router, prefix="/api/risk", tags=["Risk"])
app.include_router(slm_router.router, prefix="/api/field-intelligence", tags=["Intelligence"])

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "georesilience-backend"}
