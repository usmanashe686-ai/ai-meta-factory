import os
import json
import sqlite3
from typing import List, Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

class VectorStore:
    """
    Lightweight vector store using SQLite FTS5 for full-text search.
    Works on Termux without compilation issues.
    For semantic search, you can later implement an embedding service
    using sentence-transformers on a server.
    """

    def __init__(self, db_path: str = "./knowledge.db"):
        """
        Initialize the store with SQLite FTS5.

        Args:
            db_path: Path to SQLite database file.
        """
        self.db_path = db_path
        self.conn = None
        self._init_db()

    def _init_db(self):
        """Initialize SQLite database and create FTS5 virtual table."""
        self.conn = sqlite3.connect(self.db_path)
        # Enable foreign keys and other settings
        self.conn.execute("PRAGMA foreign_keys = ON")
        # Create FTS5 virtual table for full-text search
        self.conn.execute("""
            CREATE VIRTUAL TABLE IF NOT EXISTS documents_fts USING fts5(
                content,
                metadata_json,
                content=documents,
                tokenize='porter'
            )
        """)
        # Create auxiliary table for metadata and IDs
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS documents (
                id TEXT PRIMARY KEY,
                content TEXT NOT NULL,
                metadata TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        # Triggers to keep FTS in sync
        self.conn.execute("""
            CREATE TRIGGER IF NOT EXISTS documents_ai AFTER INSERT ON documents BEGIN
                INSERT INTO documents_fts(rowid, content, metadata_json) VALUES (new.rowid, new.content, new.metadata);
            END;
        """)
        self.conn.execute("""
            CREATE TRIGGER IF NOT EXISTS documents_ad AFTER DELETE ON documents BEGIN
                INSERT INTO documents_fts(documents_fts, rowid, content, metadata_json) VALUES('delete', old.rowid, old.content, old.metadata);
            END;
        """)
        self.conn.execute("""
            CREATE TRIGGER IF NOT EXISTS documents_au AFTER UPDATE ON documents BEGIN
                INSERT INTO documents_fts(documents_fts, rowid, content, metadata_json) VALUES('delete', old.rowid, old.content, old.metadata);
                INSERT INTO documents_fts(rowid, content, metadata_json) VALUES (new.rowid, new.content, new.metadata);
            END;
        """)
        self.conn.commit()
        logger.info(f"FTS5 vector store initialized at {self.db_path}")

    def add_documents(
        self,
        ids: List[str],
        documents: List[str],
        metadatas: Optional[List[Dict[str, Any]]] = None
    ):
        """
        Add documents to the store.

        Args:
            ids: Unique IDs for each document.
            documents: Text content.
            metadatas: Optional metadata (will be JSON-serialized).
        """
        cursor = self.conn.cursor()
        for i, doc_id in enumerate(ids):
            metadata_json = json.dumps(metadatas[i]) if metadatas and i < len(metadatas) else '{}'
            cursor.execute(
                "INSERT OR REPLACE INTO documents (id, content, metadata) VALUES (?, ?, ?)",
                (doc_id, documents[i], metadata_json)
            )
        self.conn.commit()
        logger.info(f"Added {len(ids)} documents.")

    def search(
        self,
        query: str,
        n_results: int = 5,
        where: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Search for documents using full-text search.

        Args:
            query: Search query (supports FTS5 syntax).
            n_results: Number of results to return.
            where: Optional metadata filter (not implemented in FTS5, but could filter post).

        Returns:
            List of results with 'id', 'content', 'metadata', and 'score'.
        """
        cursor = self.conn.cursor()
        # FTS5 returns a rank (lower is better) – we sort by rank and limit
        cursor.execute("""
            SELECT d.id, d.content, d.metadata, fts.rank
            FROM documents d
            JOIN documents_fts fts ON d.rowid = fts.rowid
            WHERE documents_fts MATCH ?
            ORDER BY fts.rank
            LIMIT ?
        """, (query, n_results))

        rows = cursor.fetchall()
        results = []
        for row in rows:
            doc_id, content, metadata_json, rank = row
            results.append({
                'id': doc_id,
                'content': content,
                'metadata': json.loads(metadata_json) if metadata_json else {},
                'score': 1.0 / (rank + 1)  # Convert rank to a 0-1 score (higher is better)
            })
        return results

    def delete_document(self, doc_id: str):
        """Delete a document by ID."""
        cursor = self.conn.cursor()
        cursor.execute("DELETE FROM documents WHERE id = ?", (doc_id,))
        self.conn.commit()
        logger.info(f"Deleted document {doc_id}")

    def get_all_documents(self) -> List[Dict[str, Any]]:
        """Retrieve all documents (for debugging)."""
        cursor = self.conn.cursor()
        cursor.execute("SELECT id, content, metadata FROM documents")
        rows = cursor.fetchall()
        return [
            {'id': row[0], 'content': row[1], 'metadata': json.loads(row[2]) if row[2] else {}}
            for row in rows
        ]

    def close(self):
        """Close database connection."""
        if self.conn:
            self.conn.close()
