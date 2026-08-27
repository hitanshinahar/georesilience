import os
import json
import torch
import joblib
import numpy as np
from ml.models.lstm.model import TemporalLSTM

ARTIFACTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "artifacts", "lstm"))

class LSTMPredictor:
    def __init__(self):
        self.model_path = os.path.join(ARTIFACTS_DIR, "temporal_lstm.pt")
        self.scaler_path = os.path.join(ARTIFACTS_DIR, "scaler.joblib")
        self.config_path = os.path.join(ARTIFACTS_DIR, "config.json")
        
        if not os.path.exists(self.model_path) or not os.path.exists(self.scaler_path):
            raise FileNotFoundError("LSTM artifacts missing. Run 'python -m ml.models.lstm.train' first.")
            
        with open(self.config_path, "r") as f:
            self.config = json.load(f)
            
        self.scaler = joblib.load(self.scaler_path)
        self.model = TemporalLSTM(
            input_size=self.config["input_size"],
            hidden_size=self.config["hidden_size"],
            num_layers=self.config["num_layers"],
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
            
        # Take the most recent 72 hours
        seq = sequence_data[-self.config["seq_length"]:]
        
        # Convert to numpy array shape (72, 3)
        features = ["rainfall_mm", "cumulative_rainfall_mm", "soil_moisture"]
        raw_arr = []
        for step in seq:
            raw_arr.append([step.get(f, 0.0) for f in features])
            
        raw_arr = np.array(raw_arr, dtype=np.float32)
        
        # Scale
        scaled_arr = self.scaler.transform(raw_arr)
        
        # Convert to tensor (batch_size=1, seq_length, features)
        tensor_x = torch.tensor(scaled_arr).unsqueeze(0)
        
        # Inference for full 72h
        with torch.no_grad():
            full_risk = self.model(tensor_x).item()
            
        # Trend detection: compare with the risk if we only look at the first 48 hours
        # We will pad the 48h to 72h (or just run on 48h since LSTM handles variable lengths? 
        # Actually our model was trained on 72h. Let's just pass the first 48h.)
        tensor_48h = torch.tensor(scaled_arr[:48]).unsqueeze(0)
        with torch.no_grad():
            risk_48h = self.model(tensor_48h).item()
            
        diff = full_risk - risk_48h
        if diff > 0.1:
            trend = "increasing"
        elif diff < -0.1:
            trend = "decreasing"
        else:
            trend = "stable"
            
        return {
            "temporal_risk_lstm": round(full_risk, 4),
            "trend": trend,
            "sequence_length": len(seq),
            "model_available": True
        }

if __name__ == "__main__":
    predictor = LSTMPredictor()
    # Dummy sequence
    seq = [{"rainfall_mm": 5.0, "cumulative_rainfall_mm": 100.0, "soil_moisture": 0.8} for _ in range(72)]
    print(predictor.predict_timeseries(seq))
