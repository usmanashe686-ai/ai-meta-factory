import os
import logging
from contextlib import asynccontextmanager
from typing import Optional, List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
from sentence_transformers import SentenceTransformer
import dotenv

dotenv.load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Environment variables
MODEL_NAME = os.getenv("MODEL_NAME", "codellama/CodeLlama-7b-hf")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
DEVICE = os.getenv("DEVICE", "cuda" if torch.cuda.is_available() else "cpu")

# Global variables
model = None
tokenizer = None
embedder = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load models on startup."""
    global model, tokenizer, embedder
    logger.info(f"Loading model {MODEL_NAME} on {DEVICE}...")
    try:
        tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
        model = AutoModelForCausalLM.from_pretrained(
            MODEL_NAME,
            torch_dtype=torch.float16 if DEVICE == "cuda" else torch.float32,
            device_map="auto" if DEVICE == "cuda" else None,
            low_cpu_mem_usage=True,
        )
        if DEVICE == "cpu":
            model = model.to(DEVICE)
        logger.info("Model loaded successfully.")
    except Exception as e:
        logger.error(f"Failed to load model: {e}")
        model = None
        tokenizer = None

    logger.info(f"Loading embedding model {EMBEDDING_MODEL}...")
    try:
        embedder = SentenceTransformer(EMBEDDING_MODEL, device=DEVICE)
        logger.info("Embedding model loaded.")
    except Exception as e:
        logger.error(f"Failed to load embedding model: {e}")
        embedder = None

    yield

    # Cleanup
    del model
    del tokenizer
    del embedder
    if DEVICE == "cuda":
        torch.cuda.empty_cache()

app = FastAPI(
    title="AI Meta Factory AI Service",
    description="Local AI code generation and embedding service",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----- Pydantic Models -----
class GenerateRequest(BaseModel):
    prompt: str = Field(..., description="Input prompt")
    max_new_tokens: int = Field(500, ge=1, le=2048)
    temperature: float = Field(0.7, ge=0.0, le=2.0)
    top_p: float = Field(0.95, ge=0.0, le=1.0)
    stop: Optional[List[str]] = Field(None, description="Stop sequences")

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

class EmbedRequest(BaseModel):
    texts: List[str]

class EmbedResponse(BaseModel):
    embeddings: List[List[float]]
    model: str

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    embedder_loaded: bool
    device: str

# ----- Helper Functions -----
def truncate_at_stop(text: str, stop_sequences: List[str]) -> str:
    if not stop_sequences:
        return text
    for stop in stop_sequences:
        if stop in text:
            return text[:text.index(stop)]
    return text

# ----- Endpoints -----
@app.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="ok",
        model_loaded=model is not None,
        embedder_loaded=embedder is not None,
        device=DEVICE,
    )

@app.post("/generate", response_model=GenerateResponse)
async def generate(req: GenerateRequest):
    if model is None or tokenizer is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    try:
        inputs = tokenizer(req.prompt, return_tensors="pt").to(model.device)

        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=req.max_new_tokens,
                temperature=req.temperature,
                top_p=req.top_p,
                do_sample=True,
                pad_token_id=tokenizer.eos_token_id,
                eos_token_id=tokenizer.eos_token_id,
            )

        generated = tokenizer.decode(outputs[0], skip_special_tokens=True)
        if generated.startswith(req.prompt):
            generated = generated[len(req.prompt):].lstrip()

        if req.stop:
            generated = truncate_at_stop(generated, req.stop)

        return GenerateResponse(
            generated_text=generated,
            model=MODEL_NAME,
            usage={
                "prompt_tokens": len(inputs.input_ids[0]),
                "completion_tokens": len(outputs[0]) - len(inputs.input_ids[0]),
            }
        )
    except Exception as e:
        logger.exception("Generation failed")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/explain", response_model=ExplainResponse)
async def explain(req: ExplainRequest):
    if model is None or tokenizer is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    prompt = f"Explain the following {req.language} code in simple terms:\n\n{req.code}\n\nExplanation:"
    try:
        inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=300,
                temperature=0.7,
                do_sample=False,
                pad_token_id=tokenizer.eos_token_id,
            )
        explanation = tokenizer.decode(outputs[0], skip_special_tokens=True)
        if explanation.startswith(prompt):
            explanation = explanation[len(prompt):].lstrip()
        return ExplainResponse(
            explanation=explanation,
            model=MODEL_NAME,
        )
    except Exception as e:
        logger.exception("Explanation failed")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/embed", response_model=EmbedResponse)
async def embed(req: EmbedRequest):
    if embedder is None:
        raise HTTPException(status_code=503, detail="Embedding model not loaded")
    try:
        embeddings = embedder.encode(req.texts, convert_to_tensor=False).tolist()
        return EmbedResponse(
            embeddings=embeddings,
            model=EMBEDDING_MODEL,
        )
    except Exception as e:
        logger.exception("Embedding failed")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
