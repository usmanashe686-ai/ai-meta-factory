#!/usr/bin/env python3
"""
Quantize a Hugging Face model using bitsandbytes.
Usage: python quantize_transformers.py --model_id <hf_model_id> --save_path <path> --bits 4
"""

import argparse
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
import os

def quantize_model(model_id, save_path, bits=4):
    print(f"Loading model {model_id}...")
    model = AutoModelForCausalLM.from_pretrained(
        model_id,
        torch_dtype=torch.float16,
        device_map="auto",
        load_in_4bit=(bits == 4),
        load_in_8bit=(bits == 8),
    )
    tokenizer = AutoTokenizer.from_pretrained(model_id)
    
    # Save quantized model
    os.makedirs(save_path, exist_ok=True)
    model.save_pretrained(save_path)
    tokenizer.save_pretrained(save_path)
    print(f"Quantized model saved to {save_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--model_id", type=str, required=True, help="Hugging Face model ID")
    parser.add_argument("--save_path", type=str, required=True, help="Directory to save quantized model")
    parser.add_argument("--bits", type=int, choices=[4, 8], default=4, help="Quantization bits")
    args = parser.parse_args()
    
    quantize_model(args.model_id, args.save_path, args.bits)
