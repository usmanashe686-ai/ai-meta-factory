"""
Code recommendation engine.
Uses vector search to find similar snippets and an LLM to generate suggestions.
"""

import logging
import json
import requests
from typing import List, Dict, Any, Optional
from ..embeddings.similarity_search import CodeSimilaritySearch

logger = logging.getLogger(__name__)

class CodeRecommender:
    """
    Recommends improvements, libraries, and alternatives for code snippets.
    """

    def __init__(
        self,
        similarity_search: CodeSimilaritySearch,
        ai_endpoint: str = "http://localhost:8000/generate",
        use_local_transformers: bool = False,
        local_model_name: Optional[str] = None,
    ):
        """
        Initialize the recommender.

        Args:
            similarity_search: An instance of CodeSimilaritySearch.
            ai_endpoint: URL of the local AI service (for cloud/fallback).
            use_local_transformers: If True, use a local transformers model instead of HTTP.
            local_model_name: Name of the local transformers model (if use_local_transformers=True).
        """
        self.search = similarity_search
        self.ai_endpoint = ai_endpoint
        self.use_local_transformers = use_local_transformers
        if use_local_transformers:
            try:
                from transformers import pipeline
                self.generator = pipeline("text-generation", model=local_model_name or "codellama/CodeLlama-7b-hf")
            except ImportError:
                logger.error("transformers not installed, falling back to HTTP")
                self.use_local_transformers = False
        else:
            self.generator = None

    def recommend(
        self,
        code: str,
        language: Optional[str] = None,
        n_similar: int = 3,
        include_examples: bool = True,
        temperature: float = 0.3,
        max_tokens: int = 500,
    ) -> Dict[str, Any]:
        """
        Generate recommendations for the given code snippet.

        Args:
            code: The code snippet to analyze.
            language: Optional language filter (e.g., 'python', 'javascript').
            n_similar: Number of similar snippets to retrieve.
            include_examples: Whether to include similar examples in the prompt.
            temperature: Sampling temperature.
            max_tokens: Maximum tokens for the generated response.

        Returns:
            Dictionary with recommendations, possibly including:
            - suggestions: list of improvement suggestions
            - libraries: recommended libraries
            - alternatives: alternative implementations
            - similar_examples: list of similar code snippets (if include_examples)
            - raw_response: the raw LLM response.
        """
        # Step 1: Search for similar snippets
        similar = self.search.search_by_text(code, n_results=n_similar, language=language)

        # Step 2: Build prompt
        prompt = self._build_prompt(code, similar if include_examples else [])

        # Step 3: Generate recommendations
        if self.use_local_transformers and self.generator:
            raw = self._generate_local(prompt, temperature, max_tokens)
        else:
            raw = self._generate_http(prompt, temperature, max_tokens)

        # Step 4: Parse response (try to extract structured data)
        suggestions = self._parse_response(raw)

        # Step 5: Assemble result
        result = {
            "suggestions": suggestions.get("suggestions", []),
            "libraries": suggestions.get("libraries", []),
            "alternatives": suggestions.get("alternatives", []),
            "raw_response": raw,
        }
        if include_examples:
            result["similar_examples"] = [
                {
                    "id": s["id"],
                    "document": s["document"],
                    "language": s["metadata"].get("language", "unknown"),
                }
                for s in similar
            ]
        return result

    def _build_prompt(self, code: str, similar: List[Dict[str, Any]]) -> str:
        """Build the prompt for the LLM."""
        prompt = "You are an expert code reviewer. Analyze the following code snippet and provide recommendations for improvements, suggest useful libraries, and propose alternative implementations.\n\n"
        prompt += "### Code to analyze:\n```\n" + code + "\n```\n\n"

        if similar:
            prompt += "Similar code examples found in the database:\n"
            for i, s in enumerate(similar, 1):
                prompt += f"Example {i} (language: {s['metadata'].get('language', 'unknown')}):\n```\n{s['document']}\n```\n\n"
        else:
            prompt += "No similar examples found.\n\n"

        prompt += (
            "Please provide your response in JSON format with the following keys:\n"
            '- "suggestions": a list of strings with specific improvement suggestions,\n'
            '- "libraries": a list of libraries that could be useful,\n'
            '- "alternatives": a list of alternative implementations (as code blocks).\n'
            'If no suggestions, use empty lists.\n\n'
            "Response:\n"
        )
        return prompt

    def _generate_http(self, prompt: str, temperature: float, max_tokens: int) -> str:
        """Generate via HTTP endpoint."""
        try:
            payload = {
                "prompt": prompt,
                "max_tokens": max_tokens,
                "temperature": temperature,
                "model": "codellama-7b",  # or configure
            }
            response = requests.post(self.ai_endpoint, json=payload, timeout=60)
            response.raise_for_status()
            data = response.json()
            return data.get("text") or data.get("generated_text") or ""
        except Exception as e:
            logger.exception("HTTP generation failed")
            return f"Error: {e}"

    def _generate_local(self, prompt: str, temperature: float, max_tokens: int) -> str:
        """Generate using local transformers pipeline."""
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

    def _parse_response(self, raw: str) -> Dict[str, Any]:
        """Try to parse JSON from the response; fallback to simple extraction."""
        # First, look for a JSON block
        import re
        json_match = re.search(r"\{.*\}", raw, re.DOTALL)
        if json_match:
            try:
                return json.loads(json_match.group())
            except json.JSONDecodeError:
                pass
        # Fallback: just return the raw as suggestions
        return {"suggestions": [raw], "libraries": [], "alternatives": []}


# Example usage
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    from ..embeddings.similarity_search import CodeSimilaritySearch

    # Setup search (with existing ChromaDB)
    searcher = CodeSimilaritySearch(persist_directory="./chroma_data")
    recommender = CodeRecommender(searcher, ai_endpoint="http://localhost:8000/generate")

    code_snippet = """
def factorial(n):
    if n == 0:
        return 1
    else:
        return n * factorial(n-1)
"""
    rec = recommender.recommend(code_snippet, language="python")
    print(json.dumps(rec, indent=2))
