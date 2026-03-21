import os
import logging
import requests
import re
import time
from urllib.parse import urlparse
from flask import Flask, request, jsonify, Response
import dotenv

dotenv.load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

LLAMA_URL = os.getenv("LLAMA_URL", "http://localhost:8080")
MODEL_NAME = os.getenv("MODEL_NAME", "Qwen2-0.5B")
REQUEST_TIMEOUT = 120

app = Flask(__name__)

# ===============================
# PROMPT BUILDER
# ===============================
def build_prompt(user_message, system_message="You are a helpful coding assistant."):
    return f"<|im_start|>system\n{system_message}<|im_end|>\n<|im_start|>user\n{user_message}<|im_end|>\n<|im_start|>assistant\n"

# ===============================
# CLEAN OUTPUT (SAFE)
# ===============================
def clean_code_output(text):
    text = re.sub(r'```[\w]*', '', text)
    text = text.replace('```', '')
    return text.strip()

# ===============================
# LLAMA CALL
# ===============================
def llama_completion(prompt, **kwargs):
    payload = {
        "prompt": prompt,
        "n_predict": kwargs.get("max_new_tokens", 200),
        "temperature": kwargs.get("temperature", 0.0),
        "top_k": 40,
        "top_p": kwargs.get("top_p", 0.95),
        "stop": kwargs.get("stop", ["<|im_end|>", "</s>"]),
        "stream": False,
    }

    resp = requests.post(
        f"{LLAMA_URL}/completion",
        json=payload,
        timeout=REQUEST_TIMEOUT
    )

    resp.raise_for_status()
    data = resp.json()

    return data["content"].strip()

# ===============================
# HEALTH CHECK
# ===============================
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

# ===============================
# MODEL LIST
# ===============================
@app.route('/models', methods=['GET'])
def list_models():
    return jsonify([
        {
            "id": MODEL_NAME.lower().replace(' ', '-'),
            "name": MODEL_NAME,
            "size": "unknown"
        }
    ])

# ===============================
# GENERATE
# ===============================
@app.route('/generate', methods=['POST'])
def generate():
    data = request.get_json()
    user_prompt = data.get('prompt')

    if not user_prompt:
        return jsonify({"error": "prompt required"}), 400

    try:
        prompt = build_prompt(user_prompt)

        generated = llama_completion(
            prompt,
            max_new_tokens=data.get('max_new_tokens', 200),
            temperature=data.get('temperature', 0.7),
            top_p=data.get('top_p', 0.95),
        )

        cleaned = clean_code_output(generated)

        return jsonify({
            "text": cleaned,
            "generated_text": cleaned,
            "model": MODEL_NAME
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 503

# ===============================
# EXPLAIN
# ===============================
@app.route('/explain', methods=['POST'])
def explain():
    data = request.get_json()
    code = data.get('code')

    if not code:
        return jsonify({"error": "code required"}), 400

    prompt = build_prompt(f"Explain this code:\n\n{code}")

    try:
        result = llama_completion(prompt, max_new_tokens=300, temperature=0.7)
        return jsonify({"explanation": result, "model": MODEL_NAME})
    except Exception as e:
        return jsonify({"error": str(e)}), 503

# ===============================
# FIX
# ===============================
@app.route('/fix', methods=['POST'])
def fix():
    data = request.get_json()
    code = data.get('code')

    if not code:
        return jsonify({"error": "code required"}), 400

    system_msg = "You are a code fixer. Output ONLY code."
    prompt = build_prompt(f"Fix this code:\n\n{code}", system_msg)

    try:
        fixed = llama_completion(prompt, temperature=0.0)
        return jsonify({"fixed_code": clean_code_output(fixed), "model": MODEL_NAME})
    except Exception as e:
        return jsonify({"error": str(e)}), 503

# ===============================
# OPTIMIZE
# ===============================
@app.route('/optimize', methods=['POST'])
def optimize():
    data = request.get_json()
    code = data.get('code')

    if not code:
        return jsonify({"error": "code required"}), 400

    system_msg = "You are a code optimizer. Output ONLY code."
    prompt = build_prompt(f"Optimize this code:\n\n{code}", system_msg)

    try:
        optimized = llama_completion(prompt, temperature=0.0)
        return jsonify({"optimized_code": clean_code_output(optimized), "model": MODEL_NAME})
    except Exception as e:
        return jsonify({"error": str(e)}), 503

# ===============================
# MODEL DOWNLOAD (STREAMING)
# ===============================
@app.route('/api/models/download', methods=['POST'])
def download_model():
    data = request.json
    url = data.get("url")
    name = data.get("name")

    if not url or not name:
        return jsonify({"error": "Missing URL or name"}), 400

    MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')
    os.makedirs(MODEL_DIR, exist_ok=True)

    parsed = urlparse(url)

    ALLOWED = [
        "huggingface.co",
        "github.com",
        "raw.githubusercontent.com"
    ]

    if not any(parsed.netloc.endswith(d) for d in ALLOWED):
        return jsonify({"error": "Domain not allowed"}), 403

    if not re.match(r'^[\w\-.]+$', name):
        return jsonify({"error": "Invalid name"}), 400

    path = os.path.join(MODEL_DIR, name)

    if os.path.exists(path):
        return jsonify({"error": "Model exists"}), 409

    def generate():
        try:
            start = time.time()
            r = requests.get(url, stream=True, timeout=30)
            r.raise_for_status()

            total = int(r.headers.get('content-length', 0))
            downloaded = 0

            with open(path, "wb") as f:
                for chunk in r.iter_content(8192):

                    if time.time() - start > 600:
                        raise Exception("Timeout")

                    if chunk:
                        f.write(chunk)
                        downloaded += len(chunk)

                        if total > 0:
                            progress = (downloaded / total) * 100
                            yield f'data: {{"progress": {progress:.2f}}}\n\n'
                        else:
                            yield f'data: {{"status": "downloading"}}\n\n'

            yield f'data: {{"status": "completed"}}\n\n'

        except Exception as e:
            if os.path.exists(path):
                os.remove(path)
            yield f'data: {{"error": "{str(e)}"}}\n\n'

    return Response(generate(), mimetype='text/event-stream')

# ===============================
# START SERVER
# ===============================
if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8000, debug=False)

@app.route('/models', methods=['GET'])
def list_models():
    """List downloaded local models from disk."""
    models = []

    if not os.path.exists(MODEL_DIR):
        return jsonify(models)

    for file in os.listdir(MODEL_DIR):
        if file.endswith(".gguf"):
            models.append({
                "id": file,
                "name": file.replace(".gguf", ""),
                "size": "local"
            })

    return jsonify(models)


MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')
os.makedirs(MODEL_DIR, exist_ok=True)


@app.route('/generate-stream', methods=['POST'])
def generate_stream():
    data = request.json
    prompt = data.get('prompt')
    model = data.get('model')

    if not prompt:
        return jsonify({"error": "prompt required"}), 400

    if not model:
        return jsonify({"error": "model required"}), 400

    model_path = os.path.join(MODEL_DIR, model)

    if not os.path.exists(model_path):
        return jsonify({"error": "Model not found"}), 404

    # Here you will connect to llama.cpp with model path
    # (for now we reuse existing endpoint)

    try:
        response = requests.post(f"{LLAMA_URL}/completion", json={
            "prompt": prompt,
            "n_predict": 200,
            "stream": True
        }, stream=True)

        def stream():
            for line in response.iter_lines():
                if line:
                    yield line.decode() + "\n"

        return Response(stream(), mimetype='text/event-stream')

    except Exception as e:
        return jsonify({"error": str(e)}), 500

