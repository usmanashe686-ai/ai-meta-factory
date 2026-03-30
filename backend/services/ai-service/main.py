import os
import logging
from typing import Optional, List
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from llama_cpp import Llama
import dotenv

dotenv.load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Model paths (Download a .gguf model to this path!)
MODEL_PATH = os.getenv("MODEL_PATH", "models/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf")

# Global variable for the model
llm = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load model on startup."""
    global llm
    logger.info(f"Loading Llama model from {MODEL_PATH}...")
    try:
        if os.path.exists(MODEL_PATH):
            llm = Llama(
                model_path=MODEL_PATH,
                n_ctx=2048,
                n_threads=4,  # Adjust based on your phone cores
            )
            logger.info("Llama model loaded successfully.")
        else:
            logger.warning(f"Model file not found at {MODEL_PATH}. Only health check will work.")
    except Exception as e:
        logger.error(f"Failed to load model: {e}")
        llm = None
    yield
    del llm

app = FastAPI(title="AI Meta Factory AI Service", version="1.0.0", lifespan=lifespan)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Request/Response Models ---
class GenerateRequest(BaseModel):
    prompt: str = Field(..., description="The input prompt")
    max_tokens: int = Field(500, ge=1, le=2048)
    temperature: float = Field(0.7, ge=0.0, le=2.0)
    top_p: float = Field(0.95, ge=0.0, le=1.0)
    stop: Optional[List[str]] = Field(None)

class GenerateResponse(BaseModel):
    generated_text: str
    model: str

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool

# --- Endpoints ---
@app.get("/health", response_model=HealthResponse)
async def health():
    return HealthResponse(
        status="ok",
        model_loaded=llm is not None
    )

@app.post("/generate", response_model=GenerateResponse)
async def generate(req: GenerateRequest):
    if llm is None:
        raise HTTPException(status_code=503, detail="Model not loaded. Check MODEL_PATH.")

    try:
        output = llm(
            req.prompt,
            max_tokens=req.max_tokens,
            stop=req.stop,
            temperature=req.temperature,
            top_p=req.top_p,
        )
        return GenerateResponse(
            generated_text=output["choices"][0]["text"],
            model=MODEL_PATH
        )
    except Exception as e:
        logger.exception("Generation failed")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
