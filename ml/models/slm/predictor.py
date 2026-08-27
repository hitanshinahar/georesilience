import os
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch
from ml.models.slm.model_config import SLM_MODEL_NAME, ARTIFACTS_DIR
from ml.models.slm.prompts import build_prompt
from ml.models.slm.schemas import safe_extract_json, HazardIntelligence
import logging

class SLMPredictor:
    def __init__(self):
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
            return validated.dict()
        except Exception as e:
            # Return a controlled error instead of crashing
            logging.warning(f"Failed to extract/validate JSON. Raw output: {output_text}. Error: {e}")
            fallback = HazardIntelligence(
                hazard_type="unknown",
                hazard_confidence=0.0,
                severity="low",
                urgency="monitor",
                observations=["parsing_failed"],
                temporal_change="unknown",
                recommended_action="manual_review",
                model_available=True
            )
            return fallback.dict()
