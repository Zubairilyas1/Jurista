import chromadb
from pathlib import Path
import re

class RAGEngine:
    def __init__(self, db_path: str = None):
        if db_path is None:
            db_path = "./data/chroma_db_v5"
        self.client = None
        self.collection = None
        self.model = None
        try:
            # Bypass PersistentClient due to unfixable Windows Rust Panic bug
            self.client = chromadb.Client()
            self.collection = self.client.create_collection("pakistani_law")
            from sentence_transformers import SentenceTransformer
            self.model = SentenceTransformer('all-MiniLM-L6-v2')
        except BaseException as e:
            print(f"?? ChromaDB Init Error: {e}. Falling back to RAW file parsing.")

    def query(self, query_text: str, top_k: int = 5, domain_filter: str = None):
        formatted = []

        # 1. Broad Retrieval (Get top 20 instead of top_k)
        retrieve_k = max(20, top_k * 4)
        query_embedding = self.model.encode(query_text).tolist()
        
        query_args = {
            "query_embeddings": [query_embedding],
            "n_results": retrieve_k
        }
        
        if domain_filter:
            query_args["where"] = {"domain": domain_filter}
            
        results = {"documents": []}
        if self.collection:
            try:
                results = self.collection.query(**query_args)
            except BaseException:
                pass

        if not results.get('documents') or len(results['documents']) == 0 or len(results['documents'][0]) == 0:
            print(f"?? Using fallback raw file parser for domain: {domain_filter}...")
            
            # Map domain filters to files (if no filter, default to all known files)
            files_to_check = []
            pending_dir = Path(__file__).parent.parent.parent / "data" / "raw" / "case_law" / "pending"
            
            if domain_filter == "constitutional_admin":
                files_to_check.append(pending_dir / "constitutional_admin.txt")
            elif domain_filter == "banking_fio":
                files_to_check.append(pending_dir / "banking_fio.txt")
            elif domain_filter == "banking_criminal_cpc":
                files_to_check.append(pending_dir / "banking_criminal_cpc.txt")
            elif domain_filter == "pre_emption":
                files_to_check.append(pending_dir / "pre_emption.txt")
            elif domain_filter == "inheritance_property":
                files_to_check.append(pending_dir / "inheritance_property.txt")
            elif domain_filter == "specific_performance":
                files_to_check.append(pending_dir / "specific_performance.txt")
            elif domain_filter == "arbitration_1940":
                files_to_check.append(pending_dir / "arbitration_1940.txt")
            elif domain_filter == "family_law":
                files_to_check.append(pending_dir / "family_law.txt")
            elif domain_filter == "rent_law":
                files_to_check.append(pending_dir / "rent_law.txt")
            elif domain_filter == "civil_commercial_cpc":
                files_to_check.append(pending_dir / "civil_commercial_cpc.txt")
            elif domain_filter == "service_law":
                files_to_check.append(pending_dir / "service_law.txt")
            elif domain_filter == "corporate_law":
                files_to_check.append(pending_dir / "corporate_law.txt")
            else:
                files_to_check.extend([
                    pending_dir / "constitutional_admin.txt",
                    pending_dir / "banking_fio.txt",
                    pending_dir / "banking_criminal_cpc.txt",
                    pending_dir / "pre_emption.txt",
                    pending_dir / "inheritance_property.txt",
                    pending_dir / "specific_performance.txt",
                    pending_dir / "arbitration_1940.txt",
                    pending_dir / "family_law.txt"
                ])
                
            for filepath in files_to_check:
                if filepath.exists():
                    text = filepath.read_text(encoding="utf-8")
                    chunks = text.split("\n\n")
                    for i, chunk in enumerate(chunks):
                        if not chunk.strip(): continue
                        domain_tag = domain_filter if domain_filter else filepath.stem
                        formatted.append({
                            "text": f"[Domain: {domain_tag}]\n{chunk}",
                            "citation": f"Fallback Source ({domain_tag})",
                            "source": filepath.name,
                            "type": "statutes",
                            "score": 0.9,
                            "section": "",
                            "file_name": filepath.name,
                            "id": f"chunk_{filepath.stem}_{i}"
                        })
            
            if formatted:
                return formatted[:top_k]
            return formatted

        for i, doc in enumerate(results['documents'][0]):
            meta = results['metadatas'][0][i]
            formatted.append({
                "text": doc,
                "citation": meta.get("citation", "Unknown citation"),
                "source": meta.get("source", "Unknown source"),
                "type": meta.get("type", "unknown"),
                "score": results['distances'][0][i] if 'distances' in results else None,
                "section": meta.get("section", ""),
                "file_name": meta.get("file_name", ""),
                "id": f"chunk_{i}"
            })

        # 2. Re-Ranking / Filtering with Groq LLM
        import os
        import json
        from groq import Groq
        
        api_key = os.environ.get("LLM_API_KEY", "")
        # Fallback to returning original top_k if no API key is available
        if not api_key:
            return formatted[:top_k]
            
        try:
            client = Groq(api_key=api_key)
            
            # Prepare chunks for the prompt
            chunks_json = []
            for chunk in formatted:
                chunks_json.append({
                    "id": chunk["id"],
                    "source": chunk["source"],
                    "text": chunk["text"][:500] # Truncate to save tokens
                })
            
            prompt = f"""You are a strict legal relevance filter for Pakistani Law.
User Query: "{query_text}"

Below are {len(chunks_json)} legal chunks retrieved from a vector database. Some are highly relevant, some are completely irrelevant noise.
Evaluate each chunk's relevance to the User Query. Return a JSON array of the {top_k} most relevant chunk IDs, ordered by relevance.

STRICT RULES:
1. Discard any chunks discussing mortgages, charges, or leases unless explicitly asked by the user.
2. Prioritize case law precedents (PLD, SCMR, etc.) if they directly answer the legal principle in the query.
3. Discard banking, trademark, corporate laws, or municipal local government bills if the query is about agricultural land, inheritance, or pre-emption.
4. Only return chunks that match the primary legal domain of the query.

Chunks:
{json.dumps(chunks_json, indent=2)}

Output ONLY a raw JSON array of strings (the IDs), like: ["chunk_5", "chunk_1", "chunk_12"]. Do not include markdown formatting or explanation."""

            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.0,
                max_tokens=100
            )
            
            # Parse the LLM output
            output_text = response.choices[0].message.content.strip()
            if output_text.startswith("```json"):
                output_text = output_text[7:-3].strip()
            
            ranked_ids = json.loads(output_text)
            
            # Filter and order the original chunks based on the LLM's ranking
            ranked_chunks = []
            for chunk_id in ranked_ids:
                for chunk in formatted:
                    if chunk["id"] == chunk_id:
                        ranked_chunks.append(chunk)
                        break
                        
            # If the LLM failed to return enough chunks, pad with the original top results
            if len(ranked_chunks) < top_k:
                for chunk in formatted:
                    if chunk not in ranked_chunks:
                        ranked_chunks.append(chunk)
                    if len(ranked_chunks) >= top_k:
                        break
                        
            return ranked_chunks[:top_k]
            
        except Exception as e:
            print(f"Re-ranking failed: {e}. Falling back to standard retrieval.")
            return formatted[:top_k]