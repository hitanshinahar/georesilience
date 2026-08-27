import os
import json
import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
from datetime import datetime
from torch.utils.data import DataLoader, TensorDataset
import joblib
from sklearn.preprocessing import StandardScaler
from ml.models.lstm.dataset import TemporalRiskDataset
from ml.models.transformer.model import TemporalTransformer

ARTIFACTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "artifacts", "transformer"))

def train_model():
    print("Generating synthetic dataset (reusing TemporalRiskDataset from LSTM)...")
    full_dataset = TemporalRiskDataset(num_samples=2000, seq_length=72, seed=42)
    
    # Train/Val split (80/20)
    train_size = int(0.8 * len(full_dataset))
    val_size = len(full_dataset) - train_size
    train_dataset, val_dataset = torch.utils.data.random_split(full_dataset, [train_size, val_size])
    
    # Extract features for scaling
    print("Fitting Scaler...")
    train_features = []
    for i in range(len(train_dataset)):
        train_features.append(train_dataset[i][0].numpy())
    
    # Reshape to (N*seq_length, features) to fit the scaler
    train_features_np = np.concatenate(train_features, axis=0)
    scaler = StandardScaler()
    scaler.fit(train_features_np)
    
    # Function to apply scaling
    def scale_dataset(dataset):
        scaled_X = []
        Y = []
        for i in range(len(dataset)):
            x, y = dataset[i]
            x_np = x.numpy()
            x_scaled = scaler.transform(x_np)
            scaled_X.append(x_scaled)
            Y.append(y.numpy())
        return torch.tensor(np.array(scaled_X), dtype=torch.float32), torch.tensor(np.array(Y), dtype=torch.float32)

    X_train, Y_train = scale_dataset(train_dataset)
    X_val, Y_val = scale_dataset(val_dataset)
    
    train_loader = DataLoader(TensorDataset(X_train, Y_train), batch_size=32, shuffle=True)
    val_loader = DataLoader(TensorDataset(X_val, Y_val), batch_size=32, shuffle=False)
    
    # Model configuration
    config = {
        "input_size": 3,
        "d_model": 32,
        "nhead": 4,
        "num_layers": 2,
        "dim_feedforward": 64,
        "dropout": 0.2,
        "seq_length": 72,
        "features": ["rainfall_mm", "cumulative_rainfall_mm", "soil_moisture"]
    }
    
    model = TemporalTransformer(**{k: config[k] for k in ["input_size", "d_model", "nhead", "num_layers", "dim_feedforward", "dropout"]})
    criterion = nn.BCELoss() # Binary Cross Entropy for risk score
    optimizer = optim.Adam(model.parameters(), lr=0.001)
    
    print("Training started...")
    epochs = 20
    for epoch in range(epochs):
        model.train()
        train_loss = 0.0
        for batch_x, batch_y in train_loader:
            optimizer.zero_grad()
            outputs = model(batch_x)
            loss = criterion(outputs, batch_y)
            loss.backward()
            optimizer.step()
            train_loss += loss.item() * batch_x.size(0)
        
        train_loss /= len(train_loader.dataset)
        
        # Validation
        model.eval()
        val_loss = 0.0
        with torch.no_grad():
            for batch_x, batch_y in val_loader:
                outputs = model(batch_x)
                loss = criterion(outputs, batch_y)
                val_loss += loss.item() * batch_x.size(0)
        val_loss /= len(val_loader.dataset)
        
        if (epoch + 1) % 5 == 0:
            print(f"Epoch {epoch+1}/{epochs} | Train Loss: {train_loss:.4f} | Val Loss: {val_loss:.4f}")
            
    print("Training complete.")
    
    os.makedirs(ARTIFACTS_DIR, exist_ok=True)
    
    # Save model weights
    torch.save(model.state_dict(), os.path.join(ARTIFACTS_DIR, "temporal_transformer.pt"))
    
    # Save scaler
    joblib.dump(scaler, os.path.join(ARTIFACTS_DIR, "scaler.joblib"))
    
    # Save metadata
    metadata = {
        "model_type": "Transformer",
        "training_data_type": "synthetic/demo",
        "training_timestamp": datetime.utcnow().isoformat(),
        "data_limitations": "Prototype temporal model trained on synthetic data. Do not overclaim predictive accuracy.",
        **config
    }
    
    with open(os.path.join(ARTIFACTS_DIR, "metadata.json"), "w") as f:
        json.dump(metadata, f, indent=4)
        
    print(f"Artifacts saved to {ARTIFACTS_DIR}")

if __name__ == "__main__":
    train_model()
