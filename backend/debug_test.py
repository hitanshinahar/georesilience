import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

# Submit a critical report
import random
lat = 27.0 + random.random()
lon = 88.0 + random.random()
payload = {
    "report_text": "Massive mudslide near NH-10. Road completely blocked. Vehicles stranded and houses at risk.",
    "latitude": lat,
    "longitude": lon,
    "location_name": "NH-10 Critical",
    "reporter_type": "field_officer"
}

response = client.post("/api/reports", json=payload)
print(f"POST /api/reports -> {response.status_code}")
print(response.json())

report_id = response.json()["report_id"]

print("\nFetching incidents:")
inc_response = client.get("/api/incidents")
incidents = inc_response.json()
print(f"Found {len(incidents)} incidents")

for inc in incidents:
    if report_id in inc.get("linked_report_ids", []):
        print("FOUND INCIDENT:", inc)
        break
else:
    print("INCIDENT NOT FOUND FOR REPORT ID", report_id)
    # Print the last few incidents to see what's there
    for inc in incidents[:3]:
        print(inc)
