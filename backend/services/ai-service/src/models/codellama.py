"""
Wrapper for CodeLlama model. This module provides a simplified interface
for loading and using the model, but we're handling it directly in main.py
for simplicity. This file can be used to separate concerns if needed.
"""

import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

class CodeLlama:
    def __init__(self, model_name: str = "codellama/CodeLlama-7b-hf", device: str = None):
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForCausalLM.from_pretrained(
            model_name,
            torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
            device_map="auto" if self.device == "cuda" else None,
        )
        if self.device == "cpu":
            self.model = self.model.to(self.device)

    def generate(self, prompt: str, **kwargs):
        inputs = self.tokenizer(prompt, return_tensors="pt").to(self.device)
        with torch.no_grad():
            outputs = self.model.generate(
                **inputs,
                **kwargs,
                pad_token_id=self.tokenizer.eos_token_id,
            )
        return self.tokenizer.decode(outputs[0], skip_special_tokens=True)

    def explain(self, code: str, language: str = "python"):
        prompt = f"Explain the following {language} code in simple terms:\n\n{code}\n\nExplanation:"
        return self.generate(prompt, max_new_tokens=300, temperature=0.7, do_sample=False)
