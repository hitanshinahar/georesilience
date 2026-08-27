import os
from transformers import AutoModelForCausalLM, AutoTokenizer
from ml.models.slm.model_config import SLM_MODEL_NAME, ARTIFACTS_DIR

def download_model():
    print(f"Downloading {SLM_MODEL_NAME} to {ARTIFACTS_DIR}...")
    os.makedirs(ARTIFACTS_DIR, exist_ok=True)
    
    tokenizer = AutoTokenizer.from_pretrained(SLM_MODEL_NAME)
    model = AutoModelForCausalLM.from_pretrained(SLM_MODEL_NAME)
    
    tokenizer.save_pretrained(ARTIFACTS_DIR)
    model.save_pretrained(ARTIFACTS_DIR)
    print("Download complete.")

if __name__ == "__main__":
    download_model()
