import json
from enum import Enum
from pydantic import BaseModel, Field
from typing import List, Optional

class HazardTypeEnum(str, Enum):
    slope_crack = "slope_crack"
    landslide = "landslide"
    debris_flow = "debris_flow"
    rockfall = "rockfall"
    road_blockage = "road_blockage"
    flooding = "flooding"
    erosion = "erosion"
    seepage = "seepage"
    unknown = "unknown"

class SeverityEnum(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"

class UrgencyEnum(str, Enum):
    monitor = "monitor"
    inspect = "inspect"
    immediate = "immediate"

class TemporalChangeEnum(str, Enum):
    improving = "improving"
    stable = "stable"
    worsening = "worsening"
    unknown = "unknown"

class HazardIntelligence(BaseModel):
    hazard_type: HazardTypeEnum = Field(default=HazardTypeEnum.unknown)
    hazard_confidence: float = Field(ge=0.0, le=1.0, default=0.0)
    severity: SeverityEnum = Field(default=SeverityEnum.low)
    urgency: UrgencyEnum = Field(default=UrgencyEnum.monitor)
    observations: List[str] = Field(default_factory=list)
    temporal_change: TemporalChangeEnum = Field(default=TemporalChangeEnum.unknown)
    recommended_action: str = Field(default="continue_monitoring")
    model_available: bool = Field(default=True)

def safe_extract_json(text: str) -> dict:
    """
    Attempts to extract JSON from raw LLM output.
    Follows this order:
    1. Strip markdown code fences if present
    2. Attempt json.loads directly
    3. If surrounding text exists, extract the first balanced JSON object safely
    """
    import re
    
    def _normalize_dict(d: dict) -> dict:
        if not isinstance(d, dict):
            return d
        if "hazard_type" in d and isinstance(d["hazard_type"], str):
            ht = d["hazard_type"].lower().strip()
            # Order matters: check more specific ones first if they overlap, 
            # though here we just group them by hazard type.
            if any(x in ht for x in ["crack", "fracture"]):
                d["hazard_type"] = "slope_crack"
            elif any(x in ht for x in ["rock", "boulder"]):
                d["hazard_type"] = "rockfall"
            elif any(x in ht for x in ["mudslide", "landslide", "slide", "sliding", "soil movement", "earth movement", "moving soil"]):
                d["hazard_type"] = "landslide"
            elif any(x in ht for x in ["road block", "blocked", "blockage"]):
                d["hazard_type"] = "road_blockage"
            elif any(x in ht for x in ["flood"]):
                d["hazard_type"] = "flooding"
            elif any(x in ht for x in ["seep", "wet ground", "leak"]):
                d["hazard_type"] = "seepage"

        if "severity" in d and isinstance(d["severity"], str):
            sev = d["severity"].lower().strip()
            if sev in ["moderate", "medium_risk"]:
                d["severity"] = "medium"
            elif sev in ["extreme", "severe", "catastrophic", "dangerous"]:
                d["severity"] = "critical"
            elif sev in ["elevated", "high_risk"]:
                d["severity"] = "high"

        if "urgency" in d and isinstance(d["urgency"], str):
            urg = d["urgency"].lower().strip()
            if urg in ["urgent", "critical", "high", "asap", "emergency"]:
                d["urgency"] = "immediate"
            elif urg in ["investigate", "check"]:
                d["urgency"] = "inspect"

        if "temporal_change" in d and isinstance(d["temporal_change"], str):
            tc = d["temporal_change"].lower().strip()
            if tc in ["worsening", "escalating", "deteriorating", "increasing"]:
                d["temporal_change"] = "worsening"
            elif tc in ["improving", "decreasing", "receding"]:
                d["temporal_change"] = "improving"

        return d

    text = text.strip()
    
    # 1. Strip markdown code fences
    # Matches ```json ... ``` or just ``` ... ```
    fence_pattern = re.compile(r"```(?:json)?(.*?)```", re.DOTALL)
    match = fence_pattern.search(text)
    if match:
        extracted = match.group(1).strip()
        try:
            return _normalize_dict(json.loads(extracted))
        except json.JSONDecodeError:
            pass # Fallthrough
            
    # 2. Attempt json.loads directly
    try:
        return _normalize_dict(json.loads(text))
    except json.JSONDecodeError:
        pass # Fallthrough
        
    # 3. Extract the first balanced JSON object safely
    start_idx = text.find('{')
    if start_idx != -1:
        # Find the matching closing brace
        brace_count = 0
        end_idx = -1
        in_string = False
        escape = False
        for i, char in enumerate(text[start_idx:]):
            if char == '"' and not escape:
                in_string = not in_string
            elif char == '\\' and not escape:
                escape = True
            else:
                escape = False
                
            if not in_string:
                if char == '{':
                    brace_count += 1
                elif char == '}':
                    brace_count -= 1
                    if brace_count == 0:
                        end_idx = start_idx + i
                        break
                        
        if end_idx != -1:
            extracted = text[start_idx:end_idx+1]
            try:
                return _normalize_dict(json.loads(extracted))
            except json.JSONDecodeError:
                pass
                
    raise ValueError("Failed to extract valid JSON from SLM output.")
