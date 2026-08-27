import os
import json
import torch
import joblib
import numpy as np
from ml.models.transformer.model import TemporalTransformer

ARTIFACTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "artifacts", "transformer"))

class TransformerPredictor:
    def __init__(self):
        self.model_path = os.path.join(ARTIFACTS_DIR, "temporal_transformer.pt")
        self.scaler_path = os.path.join(ARTIFACTS_DIR, "scaler.joblib")
        self.metadata_path = os.path.join(ARTIFACTS_DIR, "metadata.json")
        
        if not os.path.exists(self.model_path) or not os.path.exists(self.scaler_path) or not os.path.exists(self.metadata_path):
            raise FileNotFoundError("Transformer artifacts missing. Run 'python -m ml.models.transformer.train' first.")
            
        with open(self.metadata_path, "r") as f:
            self.config = json.load(f)
            
        self.scaler = joblib.load(self.scaler_path)
        self.model = TemporalTransformer(
            input_size=self.config["input_size"],
            d_model=self.config["d_model"],
            nhead=self.config["nhead"],
            num_layers=self.config["num_layers"],
            dim_feedforward=self.config["dim_feedforward"],
            dropout=self.config["dropout"]
        )
        self.model.load_state_dict(torch.load(self.model_path, map_location=torch.device('cpu'), weights_only=True))
        self.model.eval()

    def predict_timeseries(self, sequence_data: list) -> dict:
        """
        sequence_data should be a list of dicts:
        [{"rainfall_mm": 0.0, "cumulative_rainfall_mm": 0.0, "soil_moisture": 0.3}, ...]
        Expected length: 72
        """
        if len(sequence_data) < self.config["seq_length"]:
            raise ValueError(f"Sequence too short. Expected {self.config['seq_length']} steps, got {len(sequence_data)}.")
            
        # Take the most recent seq_length hours
        seq = sequence_data[-self.config["seq_length"]:]
        
        # Convert to numpy array shape (seq_length, features)
        features = ["rainfall_mm", "cumulative_rainfall_mm", "soil_moisture"]
        raw_arr = []
        for step in seq:
            raw_arr.append([step.get(f, 0.0) for f in features])
            
        raw_arr = np.array(raw_arr, dtype=np.float32)
        
        # Scale
        scaled_arr = self.scaler.transform(raw_arr)
        
        # Convert to tensor (batch_size=1, seq_length, features)
        tensor_x = torch.tensor(scaled_arr).unsqueeze(0)
        
        # Inference for full sequence
        with torch.no_grad():
            full_risk = self.model(tensor_x).item()
            
        return {
            "temporal_risk_transformer": round(full_risk, 4),
            "sequence_length": len(seq),
            "model_available": True
        }

if __name__ == "__main__":
    try:
        predictor = TransformerPredictor()
        # Dummy sequence
        seq = [{"rainfall_mm": 5.0, "cumulative_rainfall_mm": 100.0, "soil_moisture": 0.8} for _ in range(72)]
        print(predictor.predict_timeseries(seq))
    except FileNotFoundError as e:
        print(e)
