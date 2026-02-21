"""
Similarity search for code snippets using embeddings.
Uses sentence-transformers to encode code, and ChromaDB for storage and retrieval.
"""

import os
import logging
from typing import List, Dict, Any, Optional
import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
import numpy as np

logger = logging.getLogger(__name__)

class CodeSimilaritySearch:
    """
    Index and search code snippets using embeddings.
    """

    def __init__(
        self,
        collection_name: str = "code_snippets",
        persist_directory: str = "./chroma_data",
        model_name: str = "all-MiniLM-L6-v2",
    ):
        """
        Initialize the similarity search.

        Args:
            collection_name: Name of the ChromaDB collection.
            persist_directory: Directory where ChromaDB data is stored.
            model_name: Name of the sentence-transformers model.
        """
        self.collection_name = collection_name
        self.persist_directory = persist_directory
        self.model_name = model_name
        self.client = None
        self.collection = None
        self.encoder = None

    def _initialize_encoder(self):
        """Load the sentence transformer model."""
        if self.encoder is None:
            logger.info(f"Loading embedding model: {self.model_name}")
            self.encoder = SentenceTransformer(self.model_name)
            logger.info("Model loaded.")

    def _initialize_client(self):
        """Initialize ChromaDB client and collection."""
        if self.client is None:
            # Ensure persist directory exists
            os.makedirs(self.persist_directory, exist_ok=True)
            self.client = chromadb.Client(Settings(
                chroma_db_impl="duckdb+parquet",
                persist_directory=self.persist_directory,
                anonymized_telemetry=False
            ))
            # Get or create collection
            self.collection = self.client.get_or_create_collection(
                name=self.collection_name,
                metadata={"hnsw:space": "cosine"}
            )
            logger.info(f"Connected to ChromaDB collection: {self.collection_name}")

    def add_snippets(
        self,
        ids: List[str],
        snippets: List[str],
        metadatas: Optional[List[Dict[str, Any]]] = None,
        languages: Optional[List[str]] = None,
    ):
        """
        Add code snippets to the index.

        Args:
            ids: Unique IDs for each snippet.
            snippets: The code snippets.
            metadatas: Optional metadata for each snippet.
            languages: Optional language tags (will be added to metadata).
        """
        self._initialize_encoder()
        self._initialize_client()

        # Prepare metadata: ensure language is included if provided
        if metadatas is None:
            metadatas = [{} for _ in ids]
        if languages:
            for i, lang in enumerate(languages):
                metadatas[i]["language"] = lang

        # Generate embeddings
        embeddings = self.encoder.encode(snippets, normalize_embeddings=True).tolist()

        # Add to ChromaDB
        self.collection.add(
            ids=ids,
            documents=snippets,
            metadatas=metadatas,
            embeddings=embeddings
        )
        logger.info(f"Added {len(ids)} snippets to collection.")

    def search(
        self,
        query: str,
        n_results: int = 5,
        where: Optional[Dict[str, Any]] = None,
        return_embeddings: bool = False,
    ) -> List[Dict[str, Any]]:
        """
        Search for similar code snippets.

        Args:
            query: Query text or code fragment.
            n_results: Number of results to return.
            where: Optional metadata filter.
            return_embeddings: Whether to include embeddings in results.

        Returns:
            List of results, each with 'id', 'document', 'metadata', and optionally 'embedding'.
        """
        self._initialize_encoder()
        self._initialize_client()

        # Encode query
        query_emb = self.encoder.encode([query], normalize_embeddings=True)[0].tolist()

        # Search
        results = self.collection.query(
            query_embeddings=[query_emb],
            n_results=n_results,
            where=where,
            include=["documents", "metadatas", "distances"] + (["embeddings"] if return_embeddings else [])
        )

        # Format output
        formatted = []
        if results['ids'] and results['ids'][0]:
            for i in range(len(results['ids'][0])):
                item = {
                    'id': results['ids'][0][i],
                    'document': results['documents'][0][i] if results['documents'] else '',
                    'metadata': results['metadatas'][0][i] if results['metadatas'] else {},
                    'distance': results['distances'][0][i] if results['distances'] else None,
                }
                if return_embeddings and results['embeddings']:
                    item['embedding'] = results['embeddings'][0][i]
                formatted.append(item)
        return formatted

    def search_by_text(
        self,
        query: str,
        n_results: int = 5,
        language: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """
        Convenience method to search with optional language filter.
        """
        where = {"language": language} if language else None
        return self.search(query, n_results, where=where)

    def delete_snippet(self, snippet_id: str):
        """Delete a snippet by ID."""
        self._initialize_client()
        self.collection.delete(ids=[snippet_id])
        logger.info(f"Deleted snippet {snippet_id}")

    def get_all_snippets(self) -> List[Dict[str, Any]]:
        """Retrieve all snippets (for debugging)."""
        self._initialize_client()
        results = self.collection.get()
        items = []
        if results['ids']:
            for i in range(len(results['ids'])):
                items.append({
                    'id': results['ids'][i],
                    'document': results['documents'][i] if results['documents'] else '',
                    'metadata': results['metadatas'][i] if results['metadatas'] else {},
                })
        return items

# Example usage
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    searcher = CodeSimilaritySearch(persist_directory="./chroma_test")
    # Add some snippets
    snippets = [
        "def add(a, b): return a + b",
        "function greet(name) { console.log('Hello ' + name); }",
        "print('Hello world')",
    ]
    ids = ["py_add", "js_greet", "py_hello"]
    languages = ["python", "javascript", "python"]
    searcher.add_snippets(ids, snippets, languages=languages)

    # Search
    results = searcher.search_by_text("function that adds numbers", n_results=2)
    for r in results:
        print(f"ID: {r['id']}, Score: {1 - r['distance']}, Snippet: {r['document'][:50]}...")
