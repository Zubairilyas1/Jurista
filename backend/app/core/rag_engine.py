import chromadb
from pathlib import Path

class RAGEngine:
    def __init__(self, db_path: str = None):
        if db_path is None:
            db_path = Path(__file__).parent.parent.parent / "data" / "chroma_db"
        self.client = chromadb.PersistentClient(path=str(db_path))
        self.collection = self.client.get_collection("pakistani_law")

    def query(self, query_text: str, top_k: int = 5):
        results = self.collection.query(
            query_texts=[query_text],
            n_results=top_k
        )
        
        # Format results with safe .get() to avoid KeyError
        formatted = []
        if results['documents'] and len(results['documents']) > 0:
            for i, doc in enumerate(results['documents'][0]):
                meta = results['metadatas'][0][i]
                formatted.append({
                    "text": doc,
                    "citation": meta.get("citation", "Unknown citation"),
                    "source": meta.get("source", "Unknown source"),
                    "type": meta.get("type", "unknown"),
                    "score": results['distances'][0][i] if 'distances' in results else None,
                    # Include any other metadata you might need
                    "section": meta.get("section", ""),
                    "file_name": meta.get("file_name", "")
                })
        return formatted