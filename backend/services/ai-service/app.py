import os
import logging
import requests
import re
from flask import Flask, request, jsonify
import dotenv

dotenv.load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

LLAMA_URL = os.getenv("LLAMA_URL", "http://localhost:8080")
MODEL_NAME = os.getenv("MODEL_NAME", "Qwen2-0.5B")
REQUEST_TIMEOUT = 120

app = Flask(__name__)

def build_prompt(user_message, system_message="You are a helpful coding assistant."):
    return f"<|im_start|>system\n{system_message}<|im_end|>\n<|im_start|>user\n{user_message}<|im_end|>\n<|im_start|>assistant\n"

def llama_completion(prompt, **kwargs):
    stop_tokens = kwargs.get("stop", ["<|im_end|>", "</s>"])
    payload = {
        "prompt": prompt,
        "n_predict": kwargs.get("max_new_tokens", 200),
        "temperature": kwargs.get("temperature", 0.0),
        "top_k": 40,
        "top_p": kwargs.get("top_p", 0.95),
        "stop": stop_tokens,
        "stream": False,
    }
    try:
        resp = requests.post(f"{LLAMA_URL}/completion", json=payload, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
        data = resp.json()
        return data["content"].strip()
    except Exception as e:
        logger.exception("llama.cpp request failed")
        raise e

def clean_code_output(text):
    """Remove language tags, backticks, and extra whitespace."""
    text = re.sub(r'```\w*\n?', '', text)
    text = re.sub(r'```', '', text)
    text = re.sub(r'^\s*(python|javascript|typescript|js|ts|java|cpp|c|ruby|go|rust)\s*\n', '', text, flags=re.IGNORECASE)
    return text.strip()

@app.route('/health', methods=['GET'])
def health():
    try:
        requests.get(f"{LLAMA_URL}/health", timeout=2)
        llama_ok = True
    except:
        llama_ok = False
    return jsonify({
        "status": "ok" if llama_ok else "degraded",
        "llama_connected": llama_ok,
        "model": MODEL_NAME
    })

@app.route('/models', methods=['GET'])
def list_models():
    """Return a list of available models (currently just the one)."""
    return jsonify([
        {
            "id": MODEL_NAME.lower().replace(' ', '-'),
            "name": MODEL_NAME,
            "size": "unknown"
        }
    ])

@app.route('/generate', methods=['POST'])
def generate():
    data = request.get_json()
    user_prompt = data.get('prompt')
    if not user_prompt:
        return jsonify({"error": "prompt required"}), 400

    max_new_tokens = data.get('max_new_tokens', 200)
    temperature = data.get('temperature', 0.7)
    top_p = data.get('top_p', 0.95)

    try:
        prompt = build_prompt(user_prompt)
        generated = llama_completion(
            prompt,
            max_new_tokens=max_new_tokens,
            temperature=temperature,
            top_p=top_p,
        )
        cleaned = clean_code_output(generated)
        return jsonify({
            "text": cleaned,
            "generated_text": cleaned,
            "model": MODEL_NAME,
            "usage": {"prompt_tokens": 0, "completion_tokens": 0}
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 503

@app.route('/explain', methods=['POST'])
def explain():
    data = request.get_json()
    code = data.get('code')
    language = data.get('language', 'python')
    if not code:
        return jsonify({"error": "code required"}), 400

    user_prompt = f"Explain the following {language} code in simple terms:\n\n{code}"
    prompt = build_prompt(user_prompt)
    try:
        explanation = llama_completion(prompt, max_new_tokens=300, temperature=0.7)
        return jsonify({"explanation": explanation, "model": MODEL_NAME})
    except Exception as e:
        return jsonify({"error": str(e)}), 503

@app.route('/fix', methods=['POST'])
def fix():
    data = request.get_json()
    code = data.get('code')
    language = data.get('language', 'python')
    if not code:
        return jsonify({"error": "code required"}), 400

    system_msg = "You are a code fixer. Output ONLY the corrected code, with no extra text."
    examples = (
        "Example 1:\n"
        "Input: def add(a b): return a+b\n"
        "Output: def add(a, b): return a+b\n"
        "Example 2:\n"
        "Input: for i range(5): print(i)\n"
        "Output: for i in range(5): print(i)\n\n"
        "Now fix this code:\n"
    )
    user_prompt = examples + code
    prompt = build_prompt(user_prompt, system_message=system_msg)

    try:
        fixed = llama_completion(
            prompt,
            max_new_tokens=100,
            temperature=0.0,
        )
        cleaned = clean_code_output(fixed)
        return jsonify({"fixed_code": cleaned, "model": MODEL_NAME})
    except Exception as e:
        return jsonify({"error": str(e)}), 503

@app.route('/optimize', methods=['POST'])
def optimize():
    data = request.get_json()
    code = data.get('code')
    language = data.get('language', 'python')
    focus = data.get('focus', 'performance')
    if not code:
        return jsonify({"error": "code required"}), 400

    system_msg = "You are a code optimizer. Output ONLY the optimized code, with no extra text."
    examples = (
        "Example:\n"
        "Input: def add(a,b): result = a + b; return result\n"
        "Output: def add(a,b): return a+b\n\n"
        "Now optimize this code:\n"
    )
    user_prompt = examples + code
    prompt = build_prompt(user_prompt, system_message=system_msg)

    try:
        optimized = llama_completion(
            prompt,
            max_new_tokens=200,
            temperature=0.0,
        )
        cleaned = clean_code_output(optimized)
        return jsonify({"optimized_code": cleaned, "model": MODEL_NAME})
    except Exception as e:
        return jsonify({"error": str(e)}), 503

@app.route('/embed', methods=['POST'])
def embed():
    return jsonify({"error": "Embeddings not supported"}), 501

if __name__ == '__main__':
    # Bind to localhost only for security
    app.run(host='127.0.0.1', port=8000, debug=False)
