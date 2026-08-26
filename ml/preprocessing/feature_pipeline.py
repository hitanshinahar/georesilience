import pandas as pd
import numpy as np
from ml.preprocessing.terrain_features import extract_dem_terrain_features

FEATURE_METADATA = {
    "elevation_m": {"source": "derived", "dataset": "SRTM_DEM_30M", "type": "continuous"},
    "slope_deg": {"source": "derived", "dataset": "SRTM_DEM_30M", "type": "continuous"},
    "aspect_deg": {"source": "derived", "dataset": "SRTM_DEM_30M", "type": "continuous"},
    "tri_ruggedness": {"source": "derived", "dataset": "SRTM_DEM_30M", "type": "continuous"},
    "plan_curvature": {"source": "derived", "dataset": "SRTM_DEM_30M", "type": "continuous"},
    "rainfall_3h_accum_mm": {"source": "simulated_proxy", "dataset": "IMD_GPM_Proxy", "type": "continuous"},
    "rainfall_72h_accum_mm": {"source": "simulated_proxy", "dataset": "Antecedent_Precip_Index", "type": "continuous"},
    "soil_moisture_saturation_pct": {"source": "simulated_proxy", "dataset": "SMAP_Proxy", "type": "continuous"},
    "ground_deformation_proxy_mm_yr": {"source": "simulated_proxy", "dataset": "InSAR_Creep_Proxy", "type": "continuous"},
    "anthropogenic_load_proxy_kpa": {"source": "simulated_proxy", "dataset": "Cadastral_Overburden_Proxy", "type": "continuous"}
}

def extract_features_for_coordinate(lat: float, lon: float) -> dict:
    rng = np.random.RandomState(int(abs(lat * 1000 + lon * 10000)) % (2**31 - 1))
    terrain = extract_dem_terrain_features(lat, lon)

    rain_3h = np.clip(rng.exponential(scale=20.0), 0.0, 140.0)
    rain_72h = np.clip(rain_3h * 2.2 + rng.exponential(scale=35.0), 5.0, 260.0)
    soil_moisture = np.clip(38.0 + (rain_72h * 0.18) + rng.normal(0, 8.0), 10.0, 98.0)
    deformation_proxy = np.clip(-1 * rng.exponential(scale=4.5), -35.0, 0.0)
    anthropogenic_load = float(rng.choice([0, 15, 30, 45], p=[0.5, 0.25, 0.15, 0.1]))

    return {
        **terrain,
        "rainfall_3h_accum_mm": round(float(rain_3h), 2),
        "rainfall_72h_accum_mm": round(float(rain_72h), 2),
        "soil_moisture_saturation_pct": round(float(soil_moisture), 1),
        "ground_deformation_proxy_mm_yr": round(float(deformation_proxy), 2),
        "anthropogenic_load_proxy_kpa": anthropogenic_load
    }

def enrich_dataset(df: pd.DataFrame) -> pd.DataFrame:
    print(f"[PIPELINE] Extracting label-agnostic features for {len(df)} spatial samples...")
    records = []
    for _, row in df.iterrows():
        f = extract_features_for_coordinate(row['latitude'], row['longitude'])
        f['latitude'] = row['latitude']
        f['longitude'] = row['longitude']
        f['label'] = int(row['label'])
        records.append(f)
    return pd.DataFrame(records)