import os
import logging
from typing import Optional, Dict, Any, List
from pathlib import Path

# Try to import llama-cpp-python, fallback to a mock for testing
try:
    from llama_cpp import Llama
except ImportError:
    Llama = None
    logging.warning("llama-cpp-python not installed. Using mock Llama.")

logger = logging.getLogger(__name__)

class InferenceEngine:
    """
    Inference engine for local LLM models using llama.cpp.
    Manages model loading and text generation.
    """

    def __init__(self, model_path: Optional[str] = None, model_alias: str = "default"):
        """
        Initialize the inference engine.
        
        Args:
            model_path: Path to the GGUF model file. If None, uses env var or default.
            model_alias: A friendly name for the model (for logging/monitoring).
        """
        self.model_alias = model_alias
        self.model_path = model_path or os.getenv("LLM_MODEL_PATH", "./models/qwen2-0.5b.Q4_K_M.gguf")
        self.model = None
        self.loaded = False
        self._validate_model_path()

    def _validate_model_path(self):
        """Ensure the model file exists."""
        if not Path(self.model_path).exists():
            logger.warning(f"Model file not found at {self.model_path}. Will attempt to load anyway, but may fail.")
        else:
            logger.info(f"Model found at {self.model_path}")

    def load_model(self, **kwargs):
        """
        Load the model into memory.
        
        Args:
            **kwargs: Additional arguments for Llama constructor (n_ctx, n_gpu_layers, etc.)
        """
        if self.loaded:
            logger.info(f"Model {self.model_alias} already loaded.")
            return

        if Llama is None:
            raise ImportError("llama-cpp-python is required but not installed.")

        logger.info(f"Loading model {self.model_alias} from {self.model_path}...")
        try:
            # Default parameters; can be overridden via kwargs
            default_kwargs = {
                "n_ctx": 2048,
                "n_threads": os.cpu_count() or 4,
                "verbose": False,
            }
            default_kwargs.update(kwargs)

            self.model = Llama(model_path=self.model_path, **default_kwargs)
            self.loaded = True
            logger.info(f"Model {self.model_alias} loaded successfully.")
        except Exception as e:
            logger.error(f"Failed to load model {self.model_alias}: {e}")
            raise

    def generate(
        self,
        prompt: str,
        max_tokens: int = 256,
        temperature: float = 0.7,
        top_p: float = 0.95,
        stop: Optional[List[str]] = None,
        echo: bool = False,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Generate text from the model.
        
        Args:
            prompt: Input text prompt.
            max_tokens: Maximum number of tokens to generate.
            temperature: Sampling temperature.
            top_p: Nucleus sampling parameter.
            stop: List of stop sequences.
            echo: Whether to include the prompt in the output.
            **kwargs: Additional generation parameters.
        
        Returns:
            Dictionary with generated text and usage stats.
        """
        if not self.loaded or self.model is None:
            raise RuntimeError("Model not loaded. Call load_model() first.")

        try:
            response = self.model(
                prompt,
                max_tokens=max_tokens,
                temperature=temperature,
                top_p=top_p,
                stop=stop or [],
                echo=echo,
                **kwargs
            )
            # Extract generated text
            if echo:
                text = response["choices"][0]["text"]
            else:
                text = response["choices"][0]["text"].lstrip()

            # Rough token count (approximation)
            prompt_tokens = response.get("usage", {}).get("prompt_tokens", len(prompt.split()))
            completion_tokens = response.get("usage", {}).get("completion_tokens", len(text.split()))
            
            return {
                "text": text,
                "usage": {
                    "prompt_tokens": prompt_tokens,
                    "completion_tokens": completion_tokens,
                    "total_tokens": prompt_tokens + completion_tokens,
                },
            }
        except Exception as e:
            logger.error(f"Generation failed: {e}")
            raise

    def unload(self):
        """Unload model to free memory."""
        self.model = None
        self.loaded = False
        logger.info(f"Model {self.model_alias} unloaded.")

    def is_loaded(self) -> bool:
        return self.loaded

# Singleton instance for reuse across requests (optional)
_default_engine = None

def get_default_engine(model_path: Optional[str] = None) -> InferenceEngine:
    """Get or create a default inference engine instance."""
    global _default_engine
    if _default_engine is None:
        _default_engine = InferenceEngine(model_path)
    return _default_engine
