import os
import re
import time
import requests
from urllib.parse import urlparse
from flask import Blueprint, request, jsonify, Response

model_bp = Blueprint('model_bp', __name__)

MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')
os.makedirs(MODEL_DIR, exist_ok=True)

ALLOWED_DOMAINS = [
    "huggingface.co",
    "cdn.huggingface.co",
    "github.com",
    "raw.githubusercontent.com",
]

@model_bp.route('/api/models/download', methods=['POST'])
def download_model():
    data = request.json
    model_url = data.get('url')
    model_name = data.get('name')

    if not model_url or not model_name:
        return jsonify({"error": "Missing URL or name"}), 400

    parsed = urlparse(model_url)

    if not any(parsed.netloc.endswith(d) for d in ALLOWED_DOMAINS):
        return jsonify({"error": "Domain not allowed"}), 403

    if not re.match(r'^[\w\-.]+$', model_name):
        return jsonify({"error": "Invalid model name"}), 400

    target_path = os.path.join(MODEL_DIR, model_name)

    if os.path.exists(target_path):
        return jsonify({"error": "Model already exists"}), 409

    def generate():
        try:
            start = time.time()

            response = requests.get(model_url, stream=True, timeout=30)
            response.raise_for_status()

            total = int(response.headers.get('content-length', 0))
            downloaded = 0

            with open(target_path, 'wb') as f:
                for chunk in response.iter_content(8192):

                    if time.time() - start > 600:
                        raise Exception("Download timeout")

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
            if os.path.exists(target_path):
                os.remove(target_path)
            yield f'data: {{"error": "{str(e)}"}}\n\n'

    return Response(generate(), mimetype='text/event-stream')
