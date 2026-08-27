import numpy as np
import torch
from torch.utils.data import Dataset

class TemporalRiskDataset(Dataset):
    def __init__(self, num_samples=1000, seq_length=72, seed=42):
        self.num_samples = num_samples
        self.seq_length = seq_length
        self.seed = seed
        self.features, self.labels = self._generate_synthetic_data()

    def _generate_synthetic_data(self):
        # Deterministic generation
        np.random.seed(self.seed)
        
        # Features: [hourly_rainfall, cumulative_rainfall, soil_moisture]
        features = np.zeros((self.num_samples, self.seq_length, 3), dtype=np.float32)
        labels = np.zeros((self.num_samples, 1), dtype=np.float32)
        
        for i in range(self.num_samples):
            # 30% chance of extreme event (landslide risk high)
            is_extreme = np.random.rand() < 0.3
            
            base_moisture = np.random.uniform(0.3, 0.5)
            current_moisture = base_moisture
            cumulative_rain = 0.0
            
            for t in range(self.seq_length):
                if is_extreme:
                    # Heavy rain, peaking towards the end
                    intensity = (t / self.seq_length) * 2.0
                    rain = np.random.exponential(scale=2.0 + intensity)
                else:
                    # Normal or dry
                    rain = np.random.exponential(scale=0.5)
                
                # Zero out some hours to simulate intermittent rain
                if np.random.rand() < 0.6:
                    rain = 0.0
                    
                cumulative_rain += rain
                
                # Soil moisture increases with rain and decays over time
                current_moisture = min(1.0, current_moisture * 0.98 + rain * 0.02)
                
                features[i, t, 0] = rain
                features[i, t, 1] = cumulative_rain
                features[i, t, 2] = current_moisture
            
            # Label heuristic: if cumulative rain > 150mm and soil moisture > 85%, high risk
            if is_extreme and cumulative_rain > 120.0 and current_moisture > 0.8:
                labels[i, 0] = 1.0
            elif is_extreme and cumulative_rain > 80.0:
                labels[i, 0] = 0.6 + np.random.uniform(0.0, 0.3)
            else:
                labels[i, 0] = np.random.uniform(0.0, 0.3)
                
        return torch.tensor(features), torch.tensor(labels)

    def __len__(self):
        return self.num_samples

    def __getitem__(self, idx):
        return self.features[idx], self.labels[idx]

if __name__ == "__main__":
    ds = TemporalRiskDataset(num_samples=10)
    print(f"Generated {len(ds)} samples.")
    print(f"Feature shape: {ds.features.shape}")
    print(f"Label shape: {ds.labels.shape}")
