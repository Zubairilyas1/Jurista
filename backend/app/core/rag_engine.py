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
            print(f"[RETRIEVAL] ChromaDB empty. Using semantic fallback across ALL corpus files...")
            
            # Domain → allowed corpus files mapping.
            # When a domain is identified, ONLY load files from that domain's
            # allow-list so cross-domain bleed (family_law in a land_revenue
            # result, etc.) is structurally impossible.
            DOMAIN_CORPUS_MAP = {
                "land_revenue":               ["land_revenue", "civil_commercial_cpc", "inheritance_property", "specific_performance", "banking_fio"],
                "family_law":                 ["family_law", "inheritance_property"],
                "tax_law":                    ["tax_law", "constitutional_admin"],
                "corporate_law":              ["corporate_law", "constitutional_admin", "civil_commercial_cpc"],
                "banking_fio":                ["banking_fio", "inheritance_property", "land_revenue"],
                "banking_criminal_cpc":       ["banking_criminal_cpc", "civil_commercial_cpc"],
                "constitutional_admin":       ["constitutional_admin"],
                "arbitration_1940":           ["arbitration_1940"],
                "international_arbitration_2011": ["international_arbitration_2011", "arbitration_1940"],
                "civil_commercial_cpc":       ["civil_commercial_cpc"],
                "pre_emption":                ["pre_emption", "land_revenue", "civil_commercial_cpc"],
                "inheritance_property":       ["inheritance_property", "family_law", "banking_fio", "land_revenue"],
                "specific_performance":       ["specific_performance", "civil_commercial_cpc"],
                "service_law":                ["service_law", "constitutional_admin"],
                "rent_law":                   ["rent_law", "civil_commercial_cpc"],
            }
            allowed_stems = DOMAIN_CORPUS_MAP.get(domain_filter, None)

            import numpy as np
            pending_dir = Path(__file__).parent.parent.parent / "data" / "raw" / "case_law" / "pending"
            
            all_chunks = []
            if pending_dir.exists():
                for filepath in sorted(pending_dir.glob("*.txt")):
                    # If a domain is identified, skip files outside the allow-list
                    if allowed_stems is not None and filepath.stem not in allowed_stems:
                        continue
                    try:
                        text = filepath.read_text(encoding="utf-8")
                        chunks = text.split("\n\n")
                        for i, chunk in enumerate(chunks):
                            chunk = chunk.strip()
                            if not chunk or len(chunk) < 20:
                                continue
                            domain_tag = filepath.stem
                            all_chunks.append({
                                "text_raw": chunk,
                                "text": f"[Domain: {domain_tag}]\n{chunk}",
                                "citation": f"Fallback Source ({domain_tag})",
                                "source": filepath.name,
                                "type": "statutes",
                                "section": "",
                                "file_name": filepath.name,
                                "id": f"chunk_{filepath.stem}_{i}",
                                "domain": domain_tag,
                            })
                    except Exception as e:
                        print(f"[RETRIEVAL] Error reading {filepath.name}: {e}")
            
            print(f"[RETRIEVAL] Loaded {len(all_chunks)} chunks from allowed corpus files (domain={domain_filter}).")
            
            if not all_chunks:
                return formatted
            
            # Encode all chunks and compute cosine similarity against the query
            chunk_texts = [c["text_raw"] for c in all_chunks]
            chunk_embeddings = self.model.encode(chunk_texts)
            query_emb = np.array(query_embedding)
            
            similarities = []
            for idx, emb in enumerate(chunk_embeddings):
                emb = np.array(emb)
                cos_sim = float(np.dot(query_emb, emb) / (
                    np.linalg.norm(query_emb) * np.linalg.norm(emb) + 1e-10
                ))
                similarities.append((idx, cos_sim))
            
            # Sort by similarity (highest first) and take top results
            similarities.sort(key=lambda x: x[1], reverse=True)
            
            for idx, score in similarities[:top_k]:
                chunk = all_chunks[idx]
                chunk["score"] = score
                formatted.append(chunk)
                print(f"[RETRIEVAL]   #{len(formatted)}: {chunk['domain']} (sim={score:.4f}) — {chunk['text_raw'][:80]}...")
            
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