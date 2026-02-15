#!/bin/bash
# Test script for AI model inference via Flask proxy
# Assumes Flask proxy is running on localhost:8000

set -e

API_URL="http://localhost:8000"
MODEL_LIST_ENDPOINT="$API_URL/models"
GENERATE_ENDPOINT="$API_URL/generate"

echo "🔍 Testing AI Model Inference"
echo "=============================="

# 1. Check available models
echo -e "\n📋 Fetching available models from $MODEL_LIST_ENDPOINT ..."
curl -s "$MODEL_LIST_ENDPOINT" | jq '.' || echo "Failed to get models or jq not installed. Raw response:"
curl "$MODEL_LIST_ENDPOINT"
echo ""

# 2. Test generation with TinyLlama (or default)
echo -e "\n🧪 Testing text generation (TinyLlama)..."
curl -s -X POST "$GENERATE_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "tinyllama-1.1b",
    "prompt": "Write a short poem about coding",
    "max_tokens": 50,
    "temperature": 0.7
  }' | jq '.text' || echo "Raw response:"
curl -X POST "$GENERATE_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "tinyllama-1.1b",
    "prompt": "Write a short poem about coding",
    "max_tokens": 50,
    "temperature": 0.7
  }'
echo ""

# 3. Test Qwen2 code generation
echo -e "\n🧪 Testing code generation (Qwen2)..."
curl -s -X POST "$GENERATE_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen2-0.5b",
    "prompt": "Write a Python function to reverse a string",
    "max_tokens": 100,
    "temperature": 0.2
  }' | jq '.text' || echo "Raw response:"
curl -X POST "$GENERATE_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen2-0.5b",
    "prompt": "Write a Python function to reverse a string",
    "max_tokens": 100,
    "temperature": 0.2
  }'
echo ""

# 4. Test code explanation with TinyLlama
echo -e "\n🧪 Testing code explanation (TinyLlama)..."
curl -s -X POST "$GENERATE_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "tinyllama-1.1b",
    "prompt": "Explain this code: def hello(): print('world')",
    "max_tokens": 50,
    "temperature": 0.3
  }' | jq '.text' || echo "Raw response:"
curl -X POST "$GENERATE_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "tinyllama-1.1b",
    "prompt": "Explain this code: def hello(): print('world')",
    "max_tokens": 50,
    "temperature": 0.3
  }'
echo ""

echo -e "\n✅ Tests completed."
