from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field
from typing import Optional, List
import torch

# Request/Response models
class FixRequest(BaseModel):
    code: str
    error: Optional[str] = Field(None, description="Error message to fix")
    language: str = "python"

class FixResponse(BaseModel):
    fixed_code: str
    explanation: Optional[str] = None
    model: str

class OptimizeRequest(BaseModel):
    code: str
    language: str = "python"
    focus: str = "performance"  # performance, readability, both

class OptimizeResponse(BaseModel):
    optimized_code: str
    explanation: str
    model: str

# Helper to access models from app.state
def get_models(request: Request):
    model = request.app.state.model
    tokenizer = request.app.state.tokenizer
    if model is None or tokenizer is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    return model, tokenizer

# Create router
router = APIRouter(prefix="/ai", tags=["ai"])

@router.post("/fix", response_model=FixResponse)
async def fix_code(req: FixRequest, request: Request):
    model, tokenizer = get_models(request)
    # Build prompt
    prompt = f"Fix the following {req.language} code"
    if req.error:
        prompt += f" with error: {req.error}"
    prompt += f":\n\n{req.code}\n\nFixed code:"
    try:
        inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=500,
                temperature=0.3,  # lower temperature for more deterministic fixes
                do_sample=True,
                pad_token_id=tokenizer.eos_token_id,
            )
        fixed = tokenizer.decode(outputs[0], skip_special_tokens=True)
        if fixed.startswith(prompt):
            fixed = fixed[len(prompt):].lstrip()
        # Optionally extract explanation (if model provides)
        return FixResponse(
            fixed_code=fixed,
            explanation=None,  # could parse later
            model=request.app.state.model_name,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/optimize", response_model=OptimizeResponse)
async def optimize_code(req: OptimizeRequest, request: Request):
    model, tokenizer = get_models(request)
    prompt = f"Optimize the following {req.language} code for {req.focus}:\n\n{req.code}\n\nOptimized code:"
    try:
        inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=600,
                temperature=0.5,
                do_sample=True,
                pad_token_id=tokenizer.eos_token_id,
            )
        optimized = tokenizer.decode(outputs[0], skip_special_tokens=True)
        if optimized.startswith(prompt):
            optimized = optimized[len(prompt):].lstrip()
        return OptimizeResponse(
            optimized_code=optimized,
            explanation="",  # could separate explanation if model provides
            model=request.app.state.model_name,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# You could also add other endpoints like /complete, /translate, etc.
