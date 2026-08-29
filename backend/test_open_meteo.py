import httpx
import asyncio

async def test():
    async with httpx.AsyncClient() as client:
        r = await client.get('https://api.open-meteo.com/v1/forecast?latitude=27.34&longitude=88.60&current=temperature_2m,relative_humidity_2m,precipitation&hourly=precipitation,soil_moisture_9_to_27cm&past_days=3&forecast_days=1&timezone=auto')
        d = r.json()
        print("Current time:", d["current"]["time"])
        print("First few hourly times:", d["hourly"]["time"][:5])
        print("Soil moistures:", d["hourly"]["soil_moisture_9_to_27cm"][:5])
        
asyncio.run(test())
