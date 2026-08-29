# Field Intelligence SLM Pipeline

This module implements Phase 4: SLM-Based Field Intelligence Pipeline.

## Purpose

The purpose of this component is to extract structured hazard intelligence from unstructured text (such as field officer reports or citizen observations). It does **not** independently predict whether a landslide will occur; instead, it outputs a structured JSON representing the hazards described in the text.

## Selected SLM
**Model**: `Qwen/Qwen2.5-0.5B-Instruct`

**Why chosen**:
- Extremely lightweight (~0.5B parameters, <1.5GB disk, <2GB RAM).
- CPU-capable inference with reasonable latency.
- Highly capable of following instruction constraints and generating valid JSON schema.
- Keeps the system hardware requirements minimal without relying on external cloud LLM APIs.

## Setup Instructions

To download the model weights to the local artifact cache (`ml/artifacts/slm/`):

```bash
python -m ml.models.slm.setup
```

## Inference Process
1. Input is passed to the API.
2. A strict system prompt containing the desired Pydantic JSON schema is applied.
3. The local `Qwen2.5-0.5B-Instruct` model performs generation.
4. The raw text is passed to an extraction pipeline that strips markdown fences, attempts raw JSON parsing, and gracefully falls back to extracting the first balanced JSON bracket object.
5. The extracted dictionary is validated against the Pydantic schema `HazardIntelligence`.
6. If the model output is malformed or PyTorch is not installed, a controlled deterministic rule fallback is returned instead of crashing the API.

## API Endpoint
`POST /api/field-intelligence/analyze`

**Input Format**:
```json
{
  "report_text": "Heavy rain has continued since last night and a new crack appeared behind the house.",
  "latitude": 27.3389,
  "longitude": 88.6065,
  "source_type": "citizen"
}
```

**Output Schema**:
Conforms to `HazardIntelligence` Pydantic model (see `schemas.py`).

## Fallback Behavior & Limitations
- If the model is not downloaded or PyTorch is unavailable, the API will execute a deterministic rule fallback.
- The pipeline does not fabricate evidence. It will output `unknown` when details are omitted from the text.
- The model simply translates raw sentences into categorized schema slots.
