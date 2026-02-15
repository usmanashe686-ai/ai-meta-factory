import logging
from typing import Optional, Dict, Any, List
from .engine import InferenceEngine, get_default_engine

logger = logging.getLogger(__name__)

class CodeGenerator:
    """
    Specialized code generation using local LLMs.
    Provides methods for code completion, explanation, fixing, and optimization.
    """

    def __init__(self, engine: Optional[InferenceEngine] = None, model_path: Optional[str] = None):
        """
        Initialize with an inference engine.
        
        Args:
            engine: Existing InferenceEngine instance. If None, uses default.
            model_path: Model path for default engine.
        """
        self.engine = engine or get_default_engine(model_path)

    def ensure_loaded(self, **load_kwargs):
        """Ensure the underlying model is loaded."""
        if not self.engine.is_loaded():
            self.engine.load_model(**load_kwargs)

    def generate_code(
        self,
        instruction: str,
        context: Optional[str] = None,
        max_tokens: int = 512,
        temperature: float = 0.2,
        stop: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Generate code based on instruction and optional context.
        
        Args:
            instruction: What to generate (e.g., "Write a React component that fetches data").
            context: Existing code context (optional).
            max_tokens: Maximum tokens to generate.
            temperature: Sampling temperature (low for code).
            stop: Stop sequences (e.g., ["\n```"]).
        
        Returns:
            Dictionary with generated code and usage.
        """
        self.ensure_loaded()

        # Construct prompt
        if context:
            prompt = f"Context:\n{context}\n\nInstruction: {instruction}\n\nGenerated code:\n"
        else:
            prompt = f"Instruction: {instruction}\n\nGenerated code:\n"

        return self.engine.generate(
            prompt=prompt,
            max_tokens=max_tokens,
            temperature=temperature,
            top_p=0.95,
            stop=stop or ["\n```", "\n\n\n"],
        )

    def explain_code(self, code: str, detail_level: str = "detailed") -> Dict[str, Any]:
        """
        Explain the given code.
        
        Args:
            code: Source code to explain.
            detail_level: "simple" or "detailed".
        
        Returns:
            Dictionary with explanation text.
        """
        self.ensure_loaded()

        if detail_level == "simple":
            prompt = f"Explain the following code in simple terms:\n\n{code}\n\nExplanation:"
        else:
            prompt = f"Provide a detailed explanation of the following code, including its purpose, logic, and any potential issues:\n\n{code}\n\nExplanation:"

        return self.engine.generate(
            prompt=prompt,
            max_tokens=400,
            temperature=0.3,
            stop=["\n\n\n"],
        )

    def fix_code(self, code: str, error_message: Optional[str] = None) -> Dict[str, Any]:
        """
        Fix bugs in the given code.
        
        Args:
            code: Code with potential bugs.
            error_message: Optional error message to help the fix.
        
        Returns:
            Dictionary with fixed code.
        """
        self.ensure_loaded()

        if error_message:
            prompt = f"The following code has an error: {error_message}\n\nCode:\n{code}\n\nPlease fix the error and output the corrected code:\n"
        else:
            prompt = f"Identify and fix any bugs in the following code:\n\n{code}\n\nCorrected code:\n"

        return self.engine.generate(
            prompt=prompt,
            max_tokens=600,
            temperature=0.2,
            stop=["\n```", "\n\n\n"],
        )

    def optimize_code(self, code: str, focus: str = "performance") -> Dict[str, Any]:
        """
        Optimize code for performance or readability.
        
        Args:
            code: Code to optimize.
            focus: "performance", "readability", or "both".
        
        Returns:
            Dictionary with optimized code.
        """
        self.ensure_loaded()

        if focus == "performance":
            prompt = f"Optimize the following code for better performance:\n\n{code}\n\nOptimized code:\n"
        elif focus == "readability":
            prompt = f"Rewrite the following code to be more readable and maintainable:\n\n{code}\n\nOptimized code:\n"
        else:
            prompt = f"Optimize the following code for both performance and readability:\n\n{code}\n\nOptimized code:\n"

        return self.engine.generate(
            prompt=prompt,
            max_tokens=600,
            temperature=0.2,
            stop=["\n```", "\n\n\n"],
        )

    def complete_code(self, code_prefix: str, suffix: Optional[str] = None, max_tokens: int = 128) -> Dict[str, Any]:
        """
        Complete code at cursor position.
        
        Args:
            code_prefix: Code before cursor.
            suffix: Code after cursor (optional).
            max_tokens: Maximum tokens to generate for completion.
        
        Returns:
            Dictionary with completed code (only the missing part).
        """
        self.ensure_loaded()

        if suffix:
            prompt = f"Complete the code at the cursor (marked as <CURSOR>). Output only the missing code that should be inserted.\n\nCode before cursor:\n{code_prefix}\n<CURSOR>\nCode after cursor:\n{suffix}\n\nMissing code:\n"
        else:
            prompt = f"Complete the following code:\n\n{code_prefix}\n\nCompletion:\n"

        result = self.engine.generate(
            prompt=prompt,
            max_tokens=max_tokens,
            temperature=0.1,
            stop=["\n```", "\n\n"],
        )
        # The result.text may include extra whitespace; we can return as is.
        return result

    def generate_unit_tests(self, code: str, framework: str = "pytest") -> Dict[str, Any]:
        """
        Generate unit tests for the given code.
        
        Args:
            code: Source code.
            framework: Testing framework (pytest, unittest, etc.).
        
        Returns:
            Dictionary with generated tests.
        """
        self.ensure_loaded()

        prompt = f"Generate {framework} unit tests for the following code. Include edge cases and typical scenarios:\n\n{code}\n\nTests:\n"

        return self.engine.generate(
            prompt=prompt,
            max_tokens=800,
            temperature=0.3,
            stop=["\n```", "\n\n\n"],
        )

# Example usage (commented):
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    cg = CodeGenerator(model_path="./models/tinyllama-1.1b.Q4_K_M.gguf")
    result = cg.generate_code("Write a Python function to compute fibonacci")
    print(result["text"])
