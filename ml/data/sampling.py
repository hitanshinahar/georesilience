import numpy as np
import pandas as pd
from scipy.spatial import cKDTree

def generate_spatial_negatives(positives_df: pd.DataFrame, ratio: float = 1.0, min_buffer_deg: float = 0.05) -> pd.DataFrame:
    np.random.seed(42)
    n_positives = len(positives_df)
    n_negatives = max(int(n_positives * ratio), 10)

    lat_min, lat_max = float(positives_df['latitude'].min()) - 0.5, float(positives_df['latitude'].max()) + 0.5
    lon_min, lon_max = float(positives_df['longitude'].min()) - 0.5, float(positives_df['longitude'].max()) + 0.5

    tree = cKDTree(positives_df[['latitude', 'longitude']].values)
    neg_points = []
    attempts = 0

    while len(neg_points) < n_negatives and attempts < n_negatives * 30:
        candidates = np.column_stack((np.random.uniform(lat_min, lat_max, n_negatives), np.random.uniform(lon_min, lon_max, n_negatives)))
        distances, _ = tree.query(candidates)
        neg_points.extend(candidates[distances >= min_buffer_deg].tolist())
        attempts += n_negatives

    negatives_df = pd.DataFrame(neg_points[:n_negatives], columns=['latitude', 'longitude'])
    negatives_df['label'] = 0
    print(f"[SAMPLING] Generated {len(negatives_df)} spatially buffered negative non-event controls.")
    return negatives_df

def create_training_dataset(positives_df: pd.DataFrame) -> pd.DataFrame:
    negatives_df = generate_spatial_negatives(positives_df, ratio=1.0)
    dataset = pd.concat([positives_df, negatives_df], ignore_index=True)
    return dataset.sample(frac=1.0, random_state=42).reset_index(drop=True)

if __name__ == "__main__":
    from ml.data.ingest import get_positive_landslide_events
    pos = get_positive_landslide_events()
    print(create_training_dataset(pos)['label'].value_counts())