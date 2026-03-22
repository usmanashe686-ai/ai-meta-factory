import os
import logging
from contextlib import asynccontextmanager
from typing import Optional, List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

import httpx
import dotenv
import json

dotenv.load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 🔥 IMPORTANT: use 127.0.0.1
LLAMA_URL = os.getenv("LLAMA_URL", "http://127.0.0.1:8080")
MODEL_NAME = os.getenv("MODEL_NAME", "Qwen2-0.5B")

client: httpx.AsyncClient = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global client
    client = httpx.AsyncClient(timeout=300.0)  # 🔥 BIG TIMEOUT
    logger.info(f"Connected to llama.cpp at {LLAMA_URL}")
    yield
    await client.aclose()

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----- Models -----
class GenerateRequest(BaseModel):
    prompt: str
    max_new_tokens: int = 100  # 🔥 reduced for speed
    temperature: float = 0.7
    top_p: float = 0.95
    stop: Optional[List[str]] = None


class GenerateResponse(BaseModel):
    generated_text: str
    model: str
    usage: dict


# ----- Helper -----
async def llama_completion(prompt: str, **kwargs):
    payload = {
        "prompt": prompt,
        "n_predict": kwargs.get("max_new_tokens", 100),
        "temperature": kwargs.get("temperature", 0.7),
        "top_k": 40,
        "top_p": kwargs.get("top_p", 0.95),
        "stop": kwargs.get("stop", ["</s>"]),
        "stream": False,
    }

    try:
        resp = await client.post(
            f"{LLAMA_URL}/completion",
            json=payload,
            timeout=300.0  # 🔥 ensure timeout
        )

        logger.info(f"STATUS: {resp.status_code}")

        resp.raise_for_status()

        data = resp.json()

        logger.info(f"LLAMA RESPONSE: {data}")

        # 🔥 SAFE extraction
        if isinstance(data, dict):
            return data.get("content") or data.get("generated_text") or ""

        return str(data)

    except Exception as e:
        logger.exception("LLM request failed")
        raise HTTPException(status_code=503, detail=str(e))


# ----- Streaming -----
async def llama_stream(prompt: str, **kwargs):
    payload = {
        "prompt": prompt,
        "n_predict": kwargs.get("max_new_tokens", 100),
        "temperature": kwargs.get("temperature", 0.7),
        "top_k": 40,
        "top_p": kwargs.get("top_p", 0.95),
        "stream": True,
    }

    async with client.stream("POST", f"{LLAMA_URL}/completion", json=payload) as resp:
        async for line in resp.aiter_lines():
            if not line:
                continue
            try:
                data = json.loads(line)
                if "content" in data:
                    yield data["content"]
            except Exception:
                continue


# ----- Endpoints -----
@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/generate", response_model=GenerateResponse)
async def generate(req: GenerateRequest):
    result = await llama_completion(
        req.prompt,
        max_new_tokens=req.max_new_tokens,
        temperature=req.temperature,
        top_p=req.top_p,
        stop=req.stop
    )

    return GenerateResponse(
        generated_text=result,
        model=MODEL_NAME,
        usage={"prompt_tokens": 0, "completion_tokens": 0}
    )


@app.post("/generate-stream")
async def generate_stream(req: GenerateRequest):
    return StreamingResponse(
        llama_stream(
            req.prompt,
            max_new_tokens=req.max_new_tokens,
            temperature=req.temperature,
            top_p=req.top_p,
            stop=req.stop
        ),
        media_type="text/plain"
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
