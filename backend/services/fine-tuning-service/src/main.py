import os
import logging
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import uuid
import json

from .train import start_finetuning

app = FastAPI(title="Fine-tuning Service", version="0.1.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# In-memory job store (replace with database in production)
jobs = {}

class FineTuneRequest(BaseModel):
    model_name: str = "codellama/CodeLlama-7b-hf"
    dataset: List[dict]  # list of {"instruction": "...", "output": "..."}
    lora_r: int = 8
    lora_alpha: int = 16
    lora_dropout: float = 0.05
    epochs: int = 3
    learning_rate: float = 2e-4
    user_id: Optional[str] = None

class FineTuneResponse(BaseModel):
    job_id: str
    status: str

class JobStatus(BaseModel):
    job_id: str
    status: str
    model_path: Optional[str] = None
    error: Optional[str] = None

@app.post("/finetune", response_model=FineTuneResponse)
async def finetune(request: FineTuneRequest, background_tasks: BackgroundTasks):
    job_id = str(uuid.uuid4())
    jobs[job_id] = {"status": "queued", "request": request.dict()}
    background_tasks.add_task(start_finetuning, job_id, request.dict())
    return FineTuneResponse(job_id=job_id, status="queued")

@app.get("/status/{job_id}", response_model=JobStatus)
async def get_status(job_id: str):
    job = jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return JobStatus(
        job_id=job_id,
        status=job["status"],
        model_path=job.get("model_path"),
        error=job.get("error")
    )

@app.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)
