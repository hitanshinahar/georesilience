import os
import logging
from ml.models.slm.model_config import SLM_MODEL_NAME, ARTIFACTS_DIR
from ml.models.slm.prompts import build_prompt
from ml.models.slm.schemas import safe_extract_json, HazardIntelligence


def deterministic_rule_fallback(report_text: str) -> dict:
    text = report_text.lower()
    
    # Check road blockage first to prioritize routing/transportation disruption
    hazard_type = "unknown"
    if any(x in text for x in [
        "road completely blocked", "road blocked", "highway blocked", 
        "nh-10 blocked", "nh10 blocked", "road blockage", "vehicles stranded", 
        "road closed", "blocked road", "route blocked"
    ]):
        hazard_type = "road_blockage"
    elif any(x in text for x in [
        "mudslide", "mud slide", "slope collapse", "landslide", 
        "debris flow", "slope failure", "slide", "earth movement"
    ]):
        hazard_type = "landslide"
    elif any(x in text for x in ["rockfall", "rock fall", "boulder", "falling rock", "falling rocks"]):
        hazard_type = "rockfall"
    elif any(x in text for x in ["slope crack", "crack", "fissure", "fracture"]):
        hazard_type = "slope_crack"
    elif any(x in text for x in ["seepage", "water gushing", "groundwater", "seep"]):
        hazard_type = "seepage"

    severity = "low"
    urgency = "monitor"
    
    if any(x in text for x in ["crack", "moderate", "slow movement"]):
        severity = "medium"
        urgency = "monitor"

    if any(x in text for x in ["massive", "major", "severe", "continuous", "expanding", "significant"]):
        severity = "high"
        urgency = "inspect"
        
    if any(x in text for x in [
        "houses at risk", "house at risk", "people trapped", "vehicles stranded",
        "evacuate", "trapped", "injured", "casualties", "completely blocked",
        "critical", "emergency"
    ]):
        severity = "critical"
        urgency = "immediate"

    fallback = HazardIntelligence(
        hazard_type=hazard_type,
        hazard_confidence=0.85 if hazard_type != "unknown" else 0.3,
        severity=severity,
        urgency=urgency,
        observations=["deterministic_rule_fallback_activated"],
        temporal_change="worsening" if severity in ["high", "critical"] else "unknown",
        recommended_action="immediate_evacuation_and_road_closure" if severity == "critical" else ("field_inspection" if severity == "high" else "continue_monitoring"),
        model_available=True,
        provenance="deterministic_rule_fallback"
    )
    return fallback.model_dump() if hasattr(fallback, "model_dump") else fallback.dict()

class SLMPredictor:
    def __init__(self):
        import torch
        from transformers import AutoModelForCausalLM, AutoTokenizer
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        
        if not os.path.exists(ARTIFACTS_DIR) or not os.listdir(ARTIFACTS_DIR):
            raise FileNotFoundError(f"SLM artifacts missing. Run 'python -m ml.models.slm.setup' first to download {SLM_MODEL_NAME} to {ARTIFACTS_DIR}")
            
        try:
            self.tokenizer = AutoTokenizer.from_pretrained(ARTIFACTS_DIR)
            self.model = AutoModelForCausalLM.from_pretrained(
                ARTIFACTS_DIR, 
                torch_dtype=torch.float32 if self.device == "cpu" else torch.float16,
                device_map="auto" if self.device == "cuda" else None
            )
            if self.device == "cpu":
                self.model.to("cpu")
            self.model.eval()
        except Exception as e:
            logging.error(f"Failed to load SLM model from {ARTIFACTS_DIR}: {e}")
            raise

    def analyze(self, report_text: str) -> dict:
        prompt = build_prompt(report_text)
        
        # Qwen-specific chat template formatting (if applicable) or raw prompt
        # We will use raw prompt here since we explicitly instructed the model what to do.
        # However, for instruct models, chat templates are better. We will use tokenizer.apply_chat_template if available.
        messages = [
            {"role": "system", "content": "You are a highly analytical Field Intelligence AI."},
            {"role": "user", "content": prompt}
        ]
        
        text = self.tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True
        )
        
        inputs = self.tokenizer([text], return_tensors="pt").to(self.device)
        
        with torch.no_grad():
            outputs = self.model.generate(
                **inputs,
                max_new_tokens=256,
                temperature=0.1, # Low temperature for more deterministic JSON output
                do_sample=True,
                pad_token_id=self.tokenizer.eos_token_id
            )
            
        # Extract only the newly generated tokens
        input_length = inputs.input_ids.shape[1]
        generated_tokens = outputs[0][input_length:]
        output_text = self.tokenizer.decode(generated_tokens, skip_special_tokens=True)
        
        try:
            extracted_dict = safe_extract_json(output_text)
            # Validate via Pydantic
            validated = HazardIntelligence(**extracted_dict)
            
            # Post-validation safety check:
            # If Qwen produces 'unknown' hazard_type or low confidence or low severity despite strong evidence in report_text, override!
            text_lower = report_text.lower()
            has_critical_indicators = any(x in text_lower for x in [
                "houses at risk", "house at risk", "people trapped", "vehicles stranded",
                "evacuate", "trapped", "injured", "casualties", "completely blocked",
                "mudslide", "landslide", "rockfall", "road blocked", "highway blocked", 
                "nh-10 blocked", "nh10 blocked", "road completely blocked"
            ])
            
            if (validated.hazard_type.value == "unknown" or validated.hazard_confidence < 0.4 or 
                (has_critical_indicators and validated.severity.value in ["low", "medium"] and validated.hazard_type.value in ["unknown", "none"])):
                if has_critical_indicators:
                    return deterministic_rule_fallback(report_text)
                    
            validated.provenance = "qwen_slm"
            return validated.model_dump() if hasattr(validated, "model_dump") else validated.dict()
        except Exception as e:
            # Return a controlled error instead of crashing
            logging.warning(f"Failed to extract/validate JSON. Raw output: {output_text}. Error: {e}")
            return deterministic_rule_fallback(report_text)
