import torch
import torch.nn as nn
import math

class PositionalEncoding(nn.Module):
    def __init__(self, d_model: int, dropout: float = 0.1, max_len: int = 5000):
        super().__init__()
        self.dropout = nn.Dropout(p=dropout)

        position = torch.arange(max_len).unsqueeze(1)
        div_term = torch.exp(torch.arange(0, d_model, 2) * (-math.log(10000.0) / d_model))
        pe = torch.zeros(max_len, 1, d_model)
        pe[:, 0, 0::2] = torch.sin(position * div_term)
        pe[:, 0, 1::2] = torch.cos(position * div_term)
        self.register_buffer('pe', pe)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Args:
            x: Tensor, shape [seq_len, batch_size, embedding_dim]
        """
        x = x + self.pe[:x.size(0)]
        return self.dropout(x)

class TemporalTransformer(nn.Module):
    def __init__(self, input_size=3, d_model=32, nhead=4, num_layers=2, dim_feedforward=64, dropout=0.2):
        super(TemporalTransformer, self).__init__()
        
        self.d_model = d_model
        
        # Project input features to d_model
        self.input_projection = nn.Linear(input_size, d_model)
        
        # Positional encoding
        self.pos_encoder = PositionalEncoding(d_model, dropout)
        
        # Transformer encoder
        encoder_layers = nn.TransformerEncoderLayer(
            d_model=d_model, 
            nhead=nhead, 
            dim_feedforward=dim_feedforward, 
            dropout=dropout,
            batch_first=True
        )
        self.transformer_encoder = nn.TransformerEncoder(encoder_layers, num_layers=num_layers)
        
        # Fully connected layer for classification
        self.fc = nn.Sequential(
            nn.Dropout(dropout),
            nn.Linear(d_model, 16),
            nn.ReLU(),
            nn.Linear(16, 1),
            nn.Sigmoid()
        )

    def forward(self, x):
        # x shape: (batch_size, seq_length, features)
        
        # Project to d_model space: (batch_size, seq_length, d_model)
        x = self.input_projection(x)
        x = x * math.sqrt(self.d_model)
        
        # PyTorch TransformerEncoder expects (batch, seq, feature) when batch_first=True
        # BUT our PositionalEncoding expects (seq_length, batch_size, d_model)
        x = x.transpose(0, 1) # (seq_length, batch_size, d_model)
        x = self.pos_encoder(x)
        x = x.transpose(0, 1) # (batch_size, seq_length, d_model)
        
        # Pass through Transformer encoder
        encoded = self.transformer_encoder(x)
        
        # Temporal pooling (mean pooling over the sequence)
        # encoded shape: (batch_size, seq_length, d_model)
        pooled = encoded.mean(dim=1) # (batch_size, d_model)
        
        # Predict risk score
        risk_score = self.fc(pooled)
        return risk_score
