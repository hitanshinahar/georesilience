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
    provenance: str = Field(default="qwen_slm")

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
            # Strict mapping to Canonical HazardTypeEnum values
            if any(x in ht for x in ["crack", "fracture", "slope crack"]):
                d["hazard_type"] = "slope_crack"
            elif any(x in ht for x in ["debris flow", "mud flow", "debris_flow"]):
                d["hazard_type"] = "debris_flow"
            elif any(x in ht for x in ["rock fall", "rockfall", "boulder"]):
                d["hazard_type"] = "rockfall"
            elif any(x in ht for x in ["mudslide", "mud slide", "landslide", "land slide", "slope collapse", "slide", "earth movement"]):
                d["hazard_type"] = "landslide"
            elif any(x in ht for x in ["road block", "road_blocked", "blocked_road", "blocked road", "road_blockage", "blockage"]):
                d["hazard_type"] = "road_blockage"
            elif any(x in ht for x in ["flood"]):
                d["hazard_type"] = "flooding"
            elif any(x in ht for x in ["erosion"]):
                d["hazard_type"] = "erosion"
            elif any(x in ht for x in ["seep", "seepage", "leak"]):
                d["hazard_type"] = "seepage"
            else:
                valid_types = [e.value for e in HazardTypeEnum]
                if d["hazard_type"] not in valid_types:
                    d["hazard_type"] = "unknown"

        if "severity" in d and isinstance(d["severity"], str):
            sev = d["severity"].lower().strip()
            if sev in ["moderate", "medium_risk", "medium"]:
                d["severity"] = "medium"
            elif sev in ["extreme", "severe", "catastrophic", "dangerous", "critical"]:
                d["severity"] = "critical"
            elif sev in ["elevated", "high_risk", "high"]:
                d["severity"] = "high"
            elif sev in ["low", "minor", "minimal"]:
                d["severity"] = "low"
            else:
                valid_sev = [e.value for e in SeverityEnum]
                if d["severity"] not in valid_sev:
                    d["severity"] = "low"

        if "urgency" in d and isinstance(d["urgency"], str):
            urg = d["urgency"].lower().strip()
            if urg in ["urgent", "critical", "high", "asap", "emergency", "immediate"]:
                d["urgency"] = "immediate"
            elif urg in ["investigate", "check", "inspect"]:
                d["urgency"] = "inspect"
            elif urg in ["monitor", "routine", "low"]:
                d["urgency"] = "monitor"
            else:
                valid_urg = [e.value for e in UrgencyEnum]
                if d["urgency"] not in valid_urg:
                    d["urgency"] = "monitor"

        if "temporal_change" in d and isinstance(d["temporal_change"], str):
            tc = d["temporal_change"].lower().strip()
            if tc in ["worsening", "escalating", "deteriorating", "increasing", "getting worse"]:
                d["temporal_change"] = "worsening"
            elif tc in ["improving", "decreasing", "receding", "better"]:
                d["temporal_change"] = "improving"
            elif tc in ["stable", "unchanged", "no change", "steady"]:
                d["temporal_change"] = "stable"
            else:
                valid_tc = [e.value for e in TemporalChangeEnum]
                if d["temporal_change"] not in valid_tc:
                    d["temporal_change"] = "unknown"
                    
        # Graceful type-casting for floats to prevent validation errors on slight model glitches
        if "hazard_confidence" in d:
            try:
                d["hazard_confidence"] = float(d["hazard_confidence"])
            except (ValueError, TypeError):
                d["hazard_confidence"] = 0.5
                
        # Graceful handling for observations lists that came as strings
        if "observations" in d and isinstance(d["observations"], str):
            d["observations"] = [d["observations"]]

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
