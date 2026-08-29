from fastapi import APIRouter, HTTPException
from app.services import terrain_service

router = APIRouter()

@router.get("/terrain")
def get_terrain(lat: float, lon: float):
    """
    Lookup terrain features from a local DEM.
    Fails closed with 503 if DEM is unavailable.
    """
    try:
        return terrain_service.get_terrain_features(lat, lon)
    except RuntimeError as e:
        if "UNAVAILABLE" in str(e):
            raise HTTPException(status_code=503, detail=str(e))
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
