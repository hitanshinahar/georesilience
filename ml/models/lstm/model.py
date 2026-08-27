import torch
import torch.nn as nn

class TemporalLSTM(nn.Module):
    def __init__(self, input_size=3, hidden_size=32, num_layers=1, dropout=0.2):
        super(TemporalLSTM, self).__init__()
        
        self.lstm = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout if num_layers > 1 else 0.0
        )
        
        self.fc = nn.Sequential(
            nn.Dropout(dropout),
            nn.Linear(hidden_size, 16),
            nn.ReLU(),
            nn.Linear(16, 1),
            nn.Sigmoid()
        )

    def forward(self, x):
        # x shape: (batch, seq_length, features)
        lstm_out, (hn, cn) = self.lstm(x)
        
        # Take the output of the last time step
        last_out = lstm_out[:, -1, :]
        
        # Pass through fully connected layers
        risk_score = self.fc(last_out)
        return risk_score
