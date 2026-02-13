import os
import logging
from contextlib import asynccontextmanager
from typing import Optional, List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import dotenv

dotenv.load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Environment variables
LLAMA_URL = os.getenv("LLAMA_URL", "http://localhost:8080")
MODEL_NAME = os.getenv("MODEL_NAME", "Qwen2-0.5B")

# HTTP client for llama.cpp
client: httpx.AsyncClient = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global client
    client = httpx.AsyncClient(timeout=60.0)
    logger.info(f"Connected to llama.cpp at {LLAMA_URL}")
    yield
    await client.aclose()

app = FastAPI(
    title="AI Meta Factory AI Service (llama.cpp proxy)",
    description="Proxies AI requests to llama.cpp server",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----- Pydantic Models (v1 style) -----
class GenerateRequest(BaseModel):
    prompt: str
    max_new_tokens: int = 500
    temperature: float = 0.7
    top_p: float = 0.95
    stop: Optional[List[str]] = None

class GenerateResponse(BaseModel):
    generated_text: str
    model: str
    usage: dict

class ExplainRequest(BaseModel):
    code: str
    language: str = "python"

class ExplainResponse(BaseModel):
    explanation: str
    model: str

class FixRequest(BaseModel):
    code: str
    error: Optional[str] = None
    language: str = "python"

class FixResponse(BaseModel):
    fixed_code: str
    explanation: Optional[str] = None
    model: str

class OptimizeRequest(BaseModel):
    code: str
    language: str = "python"
    focus: str = "performance"

class OptimizeResponse(BaseModel):
    optimized_code: str
    explanation: str
    model: str

class EmbedRequest(BaseModel):
    texts: List[str]

class EmbedResponse(BaseModel):
    embeddings: List[List[float]]
    model: str

class HealthResponse(BaseModel):
    status: str
    llama_connected: bool
    model: str

# ----- Helper -----
async def llama_completion(prompt: str, **kwargs):
    """Call llama.cpp's completion endpoint."""
    payload = {
        "prompt": prompt,
        "n_predict": kwargs.get("max_new_tokens", 500),
        "temperature": kwargs.get("temperature", 0.7),
        "top_k": 40,
        "top_p": kwargs.get("top_p", 0.95),
        "stop": kwargs.get("stop", ["</s>", "User:", "\n\n"]),
        "stream": False,
    }
    try:
        resp = await client.post(f"{LLAMA_URL}/completion", json=payload)
        resp.raise_for_status()
        data = resp.json()
        return data["content"]
    except Exception as e:
        logger.exception("llama.cpp request failed")
        raise HTTPException(status_code=503, detail=f"llama.cpp error: {str(e)}")

# ----- Endpoints -----
@app.get("/health", response_model=HealthResponse)
async def health():
    try:
        await client.get(f"{LLAMA_URL}/health", timeout=2.0)
        llama_ok = True
    except:
        llama_ok = False
    return HealthResponse(
        status="ok" if llama_ok else "degraded",
        llama_connected=llama_ok,
        model=MODEL_NAME
    )

@app.post("/generate", response_model=GenerateResponse)
async def generate(req: GenerateRequest):
    generated = await llama_completion(
        req.prompt,
        max_new_tokens=req.max_new_tokens,
        temperature=req.temperature,
        top_p=req.top_p,
        stop=req.stop
    )
    return GenerateResponse(
        generated_text=generated,
        model=MODEL_NAME,
        usage={"prompt_tokens": 0, "completion_tokens": 0}
    )

@app.post("/explain", response_model=ExplainResponse)
async def explain(req: ExplainRequest):
    prompt = f"Explain the following {req.language} code in simple terms:\n\n{req.code}\n\nExplanation:"
    explanation = await llama_completion(prompt, max_new_tokens=300, temperature=0.7)
    return ExplainResponse(explanation=explanation, model=MODEL_NAME)

@app.post("/fix", response_model=FixResponse)
async def fix(req: FixRequest):
    prompt = f"Fix the following {req.language} code"
    if req.error:
        prompt += f" with error: {req.error}"
    prompt += f":\n\n{req.code}\n\nFixed code:"
    fixed = await llama_completion(prompt, max_new_tokens=500, temperature=0.3)
    return FixResponse(fixed_code=fixed, model=MODEL_NAME)

@app.post("/optimize", response_model=OptimizeResponse)
async def optimize(req: OptimizeRequest):
    prompt = f"Optimize the following {req.language} code for {req.focus}:\n\n{req.code}\n\nOptimized code:"
    optimized = await llama_completion(prompt, max_new_tokens=600, temperature=0.5)
    return OptimizeResponse(optimized_code=optimized, explanation="", model=MODEL_NAME)

@app.post("/embed", response_model=EmbedResponse)
async def embed(req: EmbedRequest):
    raise HTTPException(status_code=501, detail="Embeddings not supported by llama.cpp proxy")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
