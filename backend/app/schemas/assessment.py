from pydantic import BaseModel
from typing import List, Dict, Optional, Any
from app.schemas.schemas import StaticFeaturesInput, TimeseriesStep
from ml.fusion.schemas import FusionResponse

class LocationMetadata(BaseModel):
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    name: Optional[str] = None

class AssessmentRequest(BaseModel):
    static_features: Optional[StaticFeaturesInput] = None
    timeseries_sequence: Optional[List[TimeseriesStep]] = None
    field_report: Optional[str] = None
    location: Optional[LocationMetadata] = None

class AssessmentResponse(BaseModel):
    location: Optional[LocationMetadata] = None
    assessment: FusionResponse
    model_outputs: Dict[str, Any]
    data_sources: Dict[str, bool]
