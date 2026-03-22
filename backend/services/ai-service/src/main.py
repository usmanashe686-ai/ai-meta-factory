import os
import logging
import json
from contextlib import asynccontextmanager
from typing import Optional, List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import httpx
import dotenv

dotenv.load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

LLAMA_URL = os.getenv("LLAMA_URL", "http://127.0.0.1:8080")
client: Optional[httpx.AsyncClient] = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global client
    client = httpx.AsyncClient(timeout=300.0)
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

class GenerateRequest(BaseModel):
    prompt: str
    max_tokens: int = 2000  # Updated to match frontend key
    temperature: float = 0.2
    top_p: float = 0.95
    stop: Optional[List[str]] = None

async def llama_stream(prompt: str, **kwargs):
    payload = {
        "prompt": prompt,
        "n_predict": kwargs.get("max_tokens", 2000),
        "temperature": kwargs.get("temperature", 0.2),
        "top_p": kwargs.get("top_p", 0.95),
        "stream": True,
        "stop": kwargs.get("stop", ["</s>", "User:"])
    }

    async with client.stream("POST", f"{LLAMA_URL}/completion", json=payload) as resp:
        async for line in resp.aiter_lines():
            if not line or not line.startswith("data: "):
                continue
            try:
                raw_json = line.replace("data: ", "")
                data = json.loads(raw_json)
                if "content" in data:
                    token_payload = json.dumps({"token": data["content"]})
                    yield f"data: {token_payload}\n\n"
            except:
                continue
        yield "data: [DONE]\n\n"

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/ai/generate-stream")
async def generate_stream_endpoint(req: GenerateRequest):
    return StreamingResponse(
        llama_stream(
            req.prompt,
            max_tokens=req.max_tokens,
            temperature=req.temperature,
            top_p=req.top_p,
            stop=req.stop
        ),
        media_type="text/event-stream"
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
