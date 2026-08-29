from fastapi import APIRouter, HTTPException
from app.services.weather_service import get_live_weather

router = APIRouter()

@router.get("/current")
async def get_current_weather(lat: float, lon: float):
    result = await get_live_weather(lat, lon)
    if result.get("status") == "error":
        raise HTTPException(status_code=502, detail=result.get("message", "Weather API Error"))
    return result
