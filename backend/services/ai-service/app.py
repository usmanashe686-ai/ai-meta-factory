import os
import logging
import requests
import re
import difflib
from flask import Flask, request, jsonify
import dotenv

dotenv.load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ===============================
# CONFIG
# ===============================
LLAMA_URL = os.getenv("LLAMA_URL", "http://localhost:8080")
MODEL_NAME = os.getenv("MODEL_NAME", "Qwen2-0.5B")

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")

REQUEST_TIMEOUT = 120

app = Flask(__name__)

# ===============================
# FILE SAFETY
# ===============================
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))

def safe_path(base, user_path):
    full_path = os.path.abspath(os.path.join(base, user_path))
    if not full_path.startswith(base):
        raise Exception("Invalid path")
    return full_path

# ===============================
# PROMPT
# ===============================
def build_prompt(user_message, system_message="You are a helpful coding assistant."):
    return f"<|im_start|>system\n{system_message}<|im_end|>\n<|im_start|>user\n{user_message}<|im_end|>\n<|im_start|>assistant\n"

# ===============================
# LOCAL AI
# ===============================
def llama_completion(prompt, **kwargs):
    payload = {
        "prompt": prompt,
        "n_predict": kwargs.get("max_new_tokens", 200),
        "temperature": kwargs.get("temperature", 0.7),
        "top_p": 0.95,
        "stream": False,
    }

    resp = requests.post(f"{LLAMA_URL}/completion", json=payload, timeout=REQUEST_TIMEOUT)
    resp.raise_for_status()
    return resp.json()["content"].strip()

# ===============================
# CLOUD PROVIDERS
# ===============================
def call_openai(prompt):
    if not OPENAI_API_KEY:
        raise Exception("OpenAI key missing")

    r = requests.post(
        "https://api.openai.com/v1/chat/completions",
        headers={"Authorization": f"Bearer {OPENAI_API_KEY}"},
        json={"model": "gpt-4o-mini", "messages": [{"role": "user", "content": prompt}]}
    )
    return r.json()["choices"][0]["message"]["content"]

def call_gemini(prompt):
    if not GEMINI_API_KEY:
        raise Exception("Gemini key missing")

    url = f"https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key={GEMINI_API_KEY}"
    r = requests.post(url, json={"contents": [{"parts": [{"text": prompt}]}]})
    return r.json()["candidates"][0]["content"]["parts"][0]["text"]

def call_deepseek(prompt):
    if not DEEPSEEK_API_KEY:
        raise Exception("DeepSeek key missing")

    r = requests.post(
        "https://api.deepseek.com/v1/chat/completions",
        headers={"Authorization": f"Bearer {DEEPSEEK_API_KEY}"},
        json={"model": "deepseek-chat", "messages": [{"role": "user", "content": prompt}]}
    )
    return r.json()["choices"][0]["message"]["content"]

def call_anthropic(prompt):
    if not ANTHROPIC_API_KEY:
        raise Exception("Anthropic key missing")

    r = requests.post(
        "https://api.anthropic.com/v1/messages",
        headers={
            "x-api-key": ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
        },
        json={
            "model": "claude-3-haiku-20240307",
            "max_tokens": 300,
            "messages": [{"role": "user", "content": prompt}]
        }
    )
    return r.json()["content"][0]["text"]

# ===============================
# SMART ROUTER
# ===============================
def smart_ai_generate(prompt, preferred=None):
    providers = []

    if preferred:
        providers.append(preferred)

    providers += ["local", "anthropic", "openai", "gemini", "deepseek"]

    seen = set()
    providers = [p for p in providers if not (p in seen or seen.add(p))]

    last_error = None

    for provider in providers:
        try:
            logger.info(f"Trying provider: {provider}")

            if provider == "local":
                return llama_completion(build_prompt(prompt)), provider

            elif provider == "openai":
                return call_openai(prompt), provider

            elif provider == "gemini":
                return call_gemini(prompt), provider

            elif provider == "deepseek":
                return call_deepseek(prompt), provider

            elif provider == "anthropic":
                return call_anthropic(prompt), provider

        except Exception as e:
            logger.warning(f"{provider} failed: {e}")
            last_error = str(e)

    raise Exception(last_error or "All providers failed")

# ===============================
# ROUTES
# ===============================
@app.route('/health')
def health():
    return jsonify({"status": "ok"})

@app.route('/models')
def list_models():
    models = [f for f in os.listdir(os.path.join(os.path.dirname(__file__), "models")) if f.endswith(".gguf")]
    return jsonify(models)

@app.route('/ai/generate', methods=['POST'])
def ai_generate():
    data = request.json
    prompt = data.get("prompt")
    provider = data.get("provider")

    if not prompt:
        return jsonify({"error": "prompt required"}), 400

    try:
        result, used = smart_ai_generate(prompt, provider)

        return jsonify({
            "result": result,
            "provider_used": used
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ===============================
# FILE EDIT SYSTEM
# ===============================
def generate_diff(old, new):
    diff = difflib.unified_diff(
        old.splitlines(keepends=True),
        new.splitlines(keepends=True),
        fromfile="current",
        tofile="updated",
    )
    return "".join(diff)

@app.route('/ai/suggest-edit', methods=['POST'])
def suggest_edit():
    data = request.json
    file_path = data.get('path')
    instruction = data.get('instruction')

    if not file_path or not instruction:
        return jsonify({"error": "path and instruction required"}), 400

    try:
        full_path = safe_path(BASE_DIR, file_path)

        with open(full_path, "r", encoding="utf-8") as f:
            current_code = f.read()

        prompt = f"""
You are a code editor.

Instruction:
{instruction}

Current code:
{current_code}

Return ONLY the full updated file.
"""

        result, provider = smart_ai_generate(prompt)

        diff = generate_diff(current_code, result)

        return jsonify({
            "original": current_code,
            "suggested": result,
            "diff": diff,
            "provider": provider
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/ai/apply-edit', methods=['POST'])
def apply_edit():
    data = request.json
    file_path = data.get('path')
    new_content = data.get('content')

    if not file_path or not new_content:
        return jsonify({"error": "path and content required"}), 400

    try:
        full_path = safe_path(BASE_DIR, file_path)

        with open(full_path, "w", encoding="utf-8") as f:
            f.write(new_content)

        return jsonify({
            "status": "updated",
            "file": file_path
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ===============================
# START
# ===============================
if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8000, debug=False)

# ===============================
# LOCAL AI (LLAMA.CPP)
# ===============================
def llama_completion(prompt, **kwargs):
    payload = {
        "prompt": prompt,
        "n_predict": kwargs.get("max_new_tokens", 200),
        "temperature": kwargs.get("temperature", 0.7),
        "stream": False
    }

    resp = requests.post(
        f"{LLAMA_URL}/completion",
        json=payload,
        timeout=120
    )

    resp.raise_for_status()
    return resp.json()["content"].strip()

