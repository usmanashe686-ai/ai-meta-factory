"""
Automated code review using LLM and optional static analysis.
"""

import logging
import json
import requests
import subprocess
import tempfile
import os
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

class CodeReviewer:
    """
    Reviews code for bugs, style issues, security vulnerabilities, and suggests improvements.
    Can use an LLM (via HTTP or local transformers) and optionally run external linters.
    """

    def __init__(
        self,
        ai_endpoint: str = "http://localhost:8000/generate",
        use_local_transformers: bool = False,
        local_model_name: Optional[str] = None,
        enable_linters: bool = False,
    ):
        """
        Initialize the reviewer.

        Args:
            ai_endpoint: URL of the local AI service.
            use_local_transformers: If True, use a local transformers pipeline.
            local_model_name: Name of the local transformers model.
            enable_linters: If True, run linters like pylint, eslint if available.
        """
        self.ai_endpoint = ai_endpoint
        self.use_local_transformers = use_local_transformers
        self.enable_linters = enable_linters

        if use_local_transformers:
            try:
                from transformers import pipeline
                self.generator = pipeline("text-generation", model=local_model_name or "codellama/CodeLlama-7b-hf")
            except ImportError:
                logger.error("transformers not installed, falling back to HTTP")
                self.use_local_transformers = False
                self.generator = None
        else:
            self.generator = None

    def review(
        self,
        code: str,
        language: str = "python",
        filename: Optional[str] = None,
        include_linter_output: bool = False,
        temperature: float = 0.2,
        max_tokens: int = 800,
    ) -> Dict[str, Any]:
        """
        Perform a code review.

        Args:
            code: The source code to review.
            language: Programming language (e.g., 'python', 'javascript', 'typescript').
            filename: Optional filename (for linters).
            include_linter_output: Whether to include linter output.
            temperature: Sampling temperature.
            max_tokens: Maximum tokens for AI response.

        Returns:
            Dictionary containing:
            - issues: list of detected issues (each with severity, line, message)
            - suggestions: list of improvement suggestions
            - linter_output: optional output from external linters
            - raw_response: raw AI response
        """
        # Step 1: Run linters if enabled
        linter_output = None
        if self.enable_linters:
            linter_output = self._run_linters(code, language, filename)

        # Step 2: Build prompt for AI
        prompt = self._build_prompt(code, language, linter_output if include_linter_output else None)

        # Step 3: Generate review from AI
        if self.use_local_transformers and self.generator:
            raw = self._generate_local(prompt, temperature, max_tokens)
        else:
            raw = self._generate_http(prompt, temperature, max_tokens)

        # Step 4: Parse AI response
        issues, suggestions = self._parse_response(raw)

        result = {
            "issues": issues,
            "suggestions": suggestions,
            "raw_response": raw,
        }
        if linter_output:
            result["linter_output"] = linter_output
        return result

    def _build_prompt(self, code: str, language: str, linter_output: Optional[str] = None) -> str:
        """Build the prompt for the AI."""
        prompt = f"You are an expert code reviewer. Review the following {language} code for bugs, style issues, security vulnerabilities, and suggest improvements.\n\n"
        prompt += f"### Code to review:\n```{language}\n{code}\n```\n\n"
        if linter_output:
            prompt += f"### Linter output (for reference):\n{linter_output}\n\n"
        prompt += (
            "Please provide your review in JSON format with two keys:\n"
            '- "issues": a list of objects, each with "severity" (critical, warning, info), "line" (optional line number), and "message".\n'
            '- "suggestions": a list of strings with improvement suggestions.\n'
            "If no issues, use empty lists.\n\n"
            "Response:\n"
        )
        return prompt

    def _generate_http(self, prompt: str, temperature: float, max_tokens: int) -> str:
        try:
            payload = {
                "prompt": prompt,
                "max_tokens": max_tokens,
                "temperature": temperature,
                "model": "codellama-7b",
            }
            response = requests.post(self.ai_endpoint, json=payload, timeout=60)
            response.raise_for_status()
            data = response.json()
            return data.get("text") or data.get("generated_text") or ""
        except Exception as e:
            logger.exception("HTTP generation failed")
            return f"Error: {e}"

    def _generate_local(self, prompt: str, temperature: float, max_tokens: int) -> str:
        try:
            result = self.generator(
                prompt,
                max_new_tokens=max_tokens,
                temperature=temperature,
                do_sample=True,
                top_p=0.95,
            )
            return result[0]["generated_text"]
        except Exception as e:
            logger.exception("Local generation failed")
            return f"Error: {e}"

    def _parse_response(self, raw: str) -> tuple:
        """Parse the AI response into issues and suggestions."""
        import re
        issues = []
        suggestions = []
        json_match = re.search(r"\{.*\}", raw, re.DOTALL)
        if json_match:
            try:
                data = json.loads(json_match.group())
                issues = data.get("issues", [])
                suggestions = data.get("suggestions", [])
            except json.JSONDecodeError:
                pass
        # If parsing fails, try to extract bullet points as suggestions
        if not suggestions:
            lines = raw.split('\n')
            for line in lines:
                if line.strip().startswith('-') or line.strip().startswith('*'):
                    suggestions.append(line.strip())
        return issues, suggestions

    def _run_linters(self, code: str, language: str, filename: Optional[str] = None) -> Optional[str]:
        """Run external linters and return their output."""
        if language == "python":
            return self._run_pylint(code, filename)
        elif language in ["javascript", "typescript"]:
            return self._run_eslint(code, filename)
        else:
            logger.info(f"No linter configured for {language}")
            return None

    def _run_pylint(self, code: str, filename: Optional[str] = None) -> Optional[str]:
        try:
            with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
                f.write(code)
                temp_path = f.name
            result = subprocess.run(['pylint', '--output-format=text', temp_path], capture_output=True, text=True)
            os.unlink(temp_path)
            return result.stdout + result.stderr
        except FileNotFoundError:
            logger.warning("pylint not installed")
            return None
        except Exception as e:
            logger.exception("pylint failed")
            return str(e)

    def _run_eslint(self, code: str, filename: Optional[str] = None) -> Optional[str]:
        # For simplicity, we'd need to write to a temp file and run eslint.
        # This requires eslint installed globally or in node_modules.
        try:
            with tempfile.NamedTemporaryFile(mode='w', suffix='.js', delete=False) as f:
                f.write(code)
                temp_path = f.name
            result = subprocess.run(['eslint', '--format=compact', temp_path], capture_output=True, text=True)
            os.unlink(temp_path)
            return result.stdout + result.stderr
        except FileNotFoundError:
            logger.warning("eslint not installed")
            return None
        except Exception as e:
            logger.exception("eslint failed")
            return str(e)


# Example usage
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    reviewer = CodeReviewer(ai_endpoint="http://localhost:8000/generate", enable_linters=False)
    code_snippet = """
def factorial(n):
    if n == 0:
        return 1
    else:
        return n * factorial(n-1)
"""
    review_result = reviewer.review(code_snippet, language="python")
    print(json.dumps(review_result, indent=2))
