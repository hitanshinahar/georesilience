# Temporal Landslide Risk Transformer Model

This module implements a lightweight Transformer-based temporal landslide risk model. It complements the existing LSTM model and processes the same 72-hour environmental sequences to predict time-series landslide susceptibility.

## Purpose

The purpose of this model is to capture complex, non-sequential dependencies in the temporal features (such as long-term rainfall accumulation or intermittent soil moisture peaks) using self-attention mechanisms. 

## Data Source & Limitations

**Note**: This is a prototype temporal model trained on **synthetic/demo data**. The `TemporalRiskDataset` simulates environmental sequences (hourly rainfall, cumulative rainfall, soil moisture) with heuristic risk labels.

Do not overclaim predictive accuracy. The outputs are deterministic relative to the synthetic patterns but do not reflect real-world physical landslide behavior unless trained on actual field sensor and historical meteorological data.

## Features & Sequence Length

- **Input Features**: `rainfall_mm`, `cumulative_rainfall_mm`, `soil_moisture`
- **Sequence Length**: 72 hours

## Architecture

The model uses a lightweight PyTorch `nn.Module`:
- **Input Projection**: Projects the 3 input features to `d_model` (32) space.
- **Positional Encoding**: Injects sequence order information.
- **Transformer Encoder**: 2 layers with `nhead=4` and `dim_feedforward=64`.
- **Temporal Pooling**: Mean pooling across the 72-hour sequence to derive a single representation.
- **Fully Connected Classifier**: Projects the pooled vector to a single Sigmoid risk probability.

## Training

To train the model and generate the required artifacts:

```bash
python -m ml.models.transformer.train
```

This script will:
1. Generate the synthetic dataset (reusing the LSTM dataset generator).
2. Fit and save its own independent `StandardScaler`.
3. Train the PyTorch model for 20 epochs.
4. Save the artifacts (`temporal_transformer.pt`, `scaler.joblib`, `metadata.json`) in `ml/artifacts/transformer/`.

## Inference Usage

```python
from ml.models.transformer.predict import TransformerPredictor

# Ensure artifacts exist
predictor = TransformerPredictor()

sequence_data = [
    {"rainfall_mm": 5.0, "cumulative_rainfall_mm": 100.0, "soil_moisture": 0.8}
] * 72

result = predictor.predict_timeseries(sequence_data)
print(result)
# Output: {'temporal_risk_transformer': 0.7821, 'sequence_length': 72, 'model_available': True}
```

## Relationship with LSTM

This model is intended to run in parallel with the Phase 2 LSTM model. While both process the same sequences, the Transformer acts as a complementary temporal risk estimator. They maintain completely decoupled training pipelines and artifacts.
