#!/usr/bin/env python3
"""
End-to-end test for all AI features.
Assumes:
- Flask proxy is running on localhost:8000 (with llama.cpp or similar)
- ChromaDB is accessible (optional, but used for similarity)
- The ai-service Python environment has required packages.
"""

import sys
import json
import time
import logging
from typing import Dict, Any
import requests

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Settings
AI_API_URL = "http://localhost:8000/generate"
TEST_CODE_PYTHON = """
def fibonacci(n):
    if n <= 1:
        return n
    else:
        return fibonacci(n-1) + fibonacci(n-2)
"""

TEST_CODE_JS = """
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n-1) + fibonacci(n-2);
}
"""

def test_llm_generation():
    """Test basic text generation via the local AI."""
    logger.info("Testing LLM generation...")
    prompt = "Write a short poem about coding."
    payload = {
        "prompt": prompt,
        "max_tokens": 50,
        "temperature": 0.7,
        "model": "tinyllama-1.1b"
    }
    try:
        resp = requests.post(AI_API_URL, json=payload, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        text = data.get("text") or data.get("generated_text") or ""
        if len(text) > 10:
            logger.info("✅ LLM generation successful (response length %d)", len(text))
        else:
            logger.error("❌ LLM generation returned too short text")
            return False
        return True
    except Exception as e:
        logger.exception("LLM generation failed")
        return False

def test_code_explanation():
    """Test code explanation endpoint (assuming we have a /explain endpoint)."""
    logger.info("Testing code explanation...")
    # This might be a separate endpoint; we'll simulate using /generate with a prompt
    prompt = f"Explain the following code in simple terms:\n\n{TEST_CODE_PYTHON}"
    payload = {
        "prompt": prompt,
        "max_tokens": 200,
        "temperature": 0.3,
        "model": "tinyllama-1.1b"
    }
    try:
        resp = requests.post(AI_API_URL, json=payload, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        text = data.get("text") or data.get("generated_text") or ""
        if "fibonacci" in text.lower():
            logger.info("✅ Code explanation successful")
        else:
            logger.warning("Explanation may not be relevant")
        return True
    except Exception as e:
        logger.exception("Code explanation failed")
        return False

def test_code_fix():
    """Test code fixing by introducing a bug."""
    buggy_code = """
def add(a, b)
    return a + b
"""
    prompt = f"Fix the syntax error in this code:\n\n{buggy_code}"
    payload = {
        "prompt": prompt,
        "max_tokens": 100,
        "temperature": 0.2,
        "model": "tinyllama-1.1b"
    }
    try:
        resp = requests.post(AI_API_URL, json=payload, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        text = data.get("text") or data.get("generated_text") or ""
        if ":" in text:  # crude check for fixed colon
            logger.info("✅ Code fix successful")
        else:
            logger.warning("Fix may not have corrected the error")
        return True
    except Exception as e:
        logger.exception("Code fix failed")
        return False

def test_code_optimize():
    """Test optimization of a recursive function."""
    prompt = f"Optimize this recursive Fibonacci function (e.g., use memoization or iteration):\n\n{TEST_CODE_PYTHON}"
    payload = {
        "prompt": prompt,
        "max_tokens": 200,
        "temperature": 0.2,
        "model": "tinyllama-1.1b"
    }
    try:
        resp = requests.post(AI_API_URL, json=payload, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        text = data.get("text") or data.get("generated_text") or ""
        if "for" in text or "while" in text or "dict" in text:
            logger.info("✅ Code optimization produced a suggestion")
        else:
            logger.warning("Optimization output may not be optimal")
        return True
    except Exception as e:
        logger.exception("Code optimization failed")
        return False

def test_similarity_search():
    """Test similarity search (requires ChromaDB and populated index)."""
    logger.info("Testing similarity search...")
    try:
        # Import here to avoid dependency issues if not installed
        sys.path.insert(0, "backend/services/ai-service/src")
        from embeddings.similarity_search import CodeSimilaritySearch
        searcher = CodeSimilaritySearch(persist_directory="./chroma_data")
        # Add some test snippets if collection is empty (optional)
        snippets = [
            "def hello_world(): print('hello')",
            "function greet(name) { console.log('Hello '+name); }",
        ]
        ids = ["py_hello", "js_greet"]
        languages = ["python", "javascript"]
        # Check if already present, if not add
        existing = searcher.get_all_snippets()
        if not existing:
            searcher.add_snippets(ids, snippets, languages=languages)
        results = searcher.search_by_text("print hello", n_results=2)
        if results and len(results) > 0:
            logger.info("✅ Similarity search returned %d results", len(results))
        else:
            logger.warning("Similarity search returned no results")
        return True
    except ImportError as e:
        logger.error("Similarity search dependencies not installed: %s", e)
        return False
    except Exception as e:
        logger.exception("Similarity search failed")
        return False

def test_code_recommender():
    """Test the code recommender (requires similarity search and AI)."""
    logger.info("Testing code recommender...")
    try:
        sys.path.insert(0, "backend/services/ai-service/src")
        from embeddings.similarity_search import CodeSimilaritySearch
        from recommendations.code_recommender import CodeRecommender
        searcher = CodeSimilaritySearch(persist_directory="./chroma_data")
        recommender = CodeRecommender(searcher, ai_endpoint=AI_API_URL)
        result = recommender.recommend(TEST_CODE_PYTHON, language="python", n_similar=2)
        if result.get("suggestions") or result.get("libraries") or result.get("alternatives"):
            logger.info("✅ Code recommender produced suggestions")
        else:
            logger.warning("Code recommender returned empty suggestions")
        return True
    except ImportError as e:
        logger.error("Code recommender dependencies not installed: %s", e)
        return False
    except Exception as e:
        logger.exception("Code recommender failed")
        return False

def test_code_reviewer():
    """Test the code reviewer."""
    logger.info("Testing code reviewer...")
    try:
        sys.path.insert(0, "backend/services/ai-service/src")
        from review.code_reviewer import CodeReviewer
        reviewer = CodeReviewer(ai_endpoint=AI_API_URL, enable_linters=False)
        result = reviewer.review(TEST_CODE_PYTHON, language="python")
        if result.get("issues") or result.get("suggestions"):
            logger.info("✅ Code reviewer produced issues/suggestions")
        else:
            logger.warning("Code reviewer returned empty")
        return True
    except ImportError as e:
        logger.error("Code reviewer dependencies not installed: %s", e)
        return False
    except Exception as e:
        logger.exception("Code reviewer failed")
        return False

def main():
    logger.info("Starting end-to-end AI feature tests")
    tests = [
        ("LLM Generation", test_llm_generation),
        ("Code Explanation", test_code_explanation),
        ("Code Fix", test_code_fix),
        ("Code Optimization", test_code_optimize),
        ("Similarity Search", test_similarity_search),
        ("Code Recommender", test_code_recommender),
        ("Code Reviewer", test_code_reviewer),
    ]
    results = {}
    all_passed = True
    for name, func in tests:
        logger.info("=" * 50)
        logger.info("Running: %s", name)
        try:
            success = func()
            results[name] = "✅ PASS" if success else "❌ FAIL"
            if not success:
                all_passed = False
        except Exception as e:
            logger.exception("Unhandled exception in %s", name)
            results[name] = "❌ ERROR"
            all_passed = False
    logger.info("=" * 50)
    logger.info("Test Summary:")
    for name, status in results.items():
        logger.info("  %s: %s", name, status)
    if all_passed:
        logger.info("✅ All tests passed!")
    else:
        logger.error("❌ Some tests failed.")
    return 0 if all_passed else 1

if __name__ == "__main__":
    sys.exit(main())
