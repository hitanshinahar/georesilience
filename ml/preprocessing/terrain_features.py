import numpy as np

def extract_dem_terrain_features(lat: float, lon: float) -> dict:
    seed = int(abs(lat * 1000 + lon * 10000)) % (2**31 - 1)
    rng = np.random.RandomState(seed)

    base_elevation = 750.0 + (lat - 20.0) * 115.0 + rng.normal(0, 150.0)
    elevation_m = np.clip(base_elevation, 300.0, 3600.0)

    slope_deg = np.clip(rng.gamma(shape=4.0, scale=6.5), 2.0, 60.0)
    aspect_deg = rng.uniform(0.0, 360.0)
    tri_ruggedness = np.clip(slope_deg * 0.42 + rng.normal(4.0, 1.5), 1.0, 45.0)
    plan_curvature = np.clip(rng.normal(0.0, 0.02), -0.05, 0.05)

    return {
        "elevation_m": round(float(elevation_m), 1),
        "slope_deg": round(float(slope_deg), 2),
        "aspect_deg": round(float(aspect_deg), 1),
        "tri_ruggedness": round(float(tri_ruggedness), 2),
        "plan_curvature": round(float(plan_curvature), 4)
    }