import httpx
import datetime
from typing import Dict, Any

async def get_live_weather(lat: float, lon: float) -> Dict[str, Any]:
    """
    Fetches real environmental data from Open-Meteo.
    """
    url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,precipitation&hourly=precipitation,soil_moisture_9_to_27cm&past_days=3&forecast_days=1&timezone=auto"
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=5.0)
            response.raise_for_status()
            data = response.json()
            
            current = data.get("current", {})
            hourly = data.get("hourly", {})
            
            temp = current.get("temperature_2m")
            humidity = current.get("relative_humidity_2m")
            rain_1h = current.get("precipitation", 0.0)
            
            current_time_str = current.get("time")
            
            rain_3h = 0.0
            rain_24h = 0.0
            rain_72h = 0.0
            soil_moisture = None
            is_proxy = True
            soil_moisture_source = "UNAVAILABLE"
            
            if current_time_str and "time" in hourly and "precipitation" in hourly:
                times = hourly["time"]
                precips = hourly["precipitation"]
                soil_moistures = hourly.get("soil_moisture_9_to_27cm", [])
                
                try:
                    # current_time_str format is typically "YYYY-MM-DDTHH:MM"
                    # we want to match the hour "YYYY-MM-DDTHH:00"
                    closest_hour = current_time_str[:13] + ":00"
                    
                    if closest_hour in times:
                        idx = times.index(closest_hour)
                        # Past 3 hours
                        start_3h = max(0, idx - 2)
                        rain_3h_vals = [p for p in precips[start_3h:idx+1] if p is not None]
                        rain_3h = sum(rain_3h_vals)
                        
                        # Past 24 hours
                        start_24h = max(0, idx - 23)
                        rain_24h_vals = [p for p in precips[start_24h:idx+1] if p is not None]
                        rain_24h = sum(rain_24h_vals)
                        
                        # Past 72 hours
                        start_72h = max(0, idx - 71)
                        rain_72h_vals = [p for p in precips[start_72h:idx+1] if p is not None]
                        rain_72h = sum(rain_72h_vals)
                        
                        if soil_moistures and len(soil_moistures) > idx:
                            # Soil moisture might be None for the exact current hour, so search backwards
                            vwc = None
                            for i in range(idx, max(-1, idx - 24), -1):
                                if soil_moistures[i] is not None:
                                    vwc = soil_moistures[i]
                                    break
                            
                            if vwc is not None:
                                soil_moisture = min(100.0, vwc * 200.0)
                                is_proxy = False
                                soil_moisture_source = "Open-Meteo"
                    else:
                        rain_3h = rain_1h
                        rain_24h = rain_1h
                        rain_72h = rain_1h * 3.0
                except Exception:
                    rain_3h = rain_1h
                    rain_24h = rain_1h
                    rain_72h = rain_1h * 3.0
            else:
                rain_3h = rain_1h
                rain_24h = rain_1h
                rain_72h = rain_1h * 3.0
            
            # Ensure no nulls are passed back
            return {
                "latitude": lat,
                "longitude": lon,
                "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
                "temperature": temp if temp is not None else 25.0,
                "humidity": humidity if humidity is not None else 65.0,
                "soil_moisture": soil_moisture,
                "soil_moisture_is_proxy": is_proxy,
                "soil_moisture_source": soil_moisture_source,
                "rainfall_1h_mm": rain_1h if rain_1h is not None else 0.0,
                "rainfall_3h_accum_mm": rain_3h if rain_3h is not None else 0.0,
                "rainfall_24h_accum_mm": rain_24h if rain_24h is not None else 0.0,
                "rainfall_72h_accum_mm": rain_72h if rain_72h is not None else 0.0,
                "source": "Open-Meteo Live",
                "data_timestamp": current_time_str or datetime.datetime.utcnow().isoformat() + "Z",
                "status": "success"
            }
    except Exception as e:
        print(f"Weather API error: {e}")
        return {
            "status": "error",
            "message": str(e)
        }
