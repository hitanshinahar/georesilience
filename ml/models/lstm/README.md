# Temporal Risk Model (LSTM)

## Purpose
This PyTorch-based LSTM module analyzes the evolution of environmental conditions over a 72-hour period to output a temporal landslide risk score. It answers whether the temporal risk is increasing, stable, or decreasing based on recent weather events.

## Data Source
The training dataset is **synthetic and deterministic**, generated for demonstration purposes. The real dataset (`NASA_GLC_URL`) only contains historical point-in-time coordinates of landslides, with no continuous temporal rainfall or soil moisture data. Therefore, a reproducible sequence generator (`dataset.py`) produces realistic synthetic weather patterns (intermittent rain, soil moisture decay, extreme accumulation spikes).

## Architecture
- **Input Size**: 3 features (`hourly_rainfall`, `cumulative_rainfall`, `soil_moisture`)
- **Sequence Length**: 72 steps (hours)
- **LSTM Layer**: 1 layer, 64 hidden units, batch_first
- **Fully Connected**: Dropout (0.2) -> Linear(64, 16) -> ReLU -> Linear(16, 1) -> Sigmoid
- **Output**: 0 to 1 continuous risk score.

## How to Train
Run the training script from the root of the repository:
```bash
python -m ml.models.lstm.train
```
This will:
1. Generate the synthetic dataset.
2. Train the LSTM for 20 epochs.
3. Save the model weights (`temporal_lstm.pt`), config (`config.json`), and feature scaler (`scaler.joblib`) to `ml/artifacts/lstm/`.

## Inference
The inference pipeline accepts a 72-step sequence. Trend detection is implemented by comparing the risk score of the full 72-hour window against the risk score generated if the model only sees the first 48 hours of that window.

## Limitations
- **Synthetic Data**: The model learns from physically plausible heuristics, not real historical time-series data. It is for architectural demonstration only.
- **Trend Heuristics**: The trend logic assumes the LSTM can handle variable length inputs (48h vs 72h) reasonably well to output a trend diff.
