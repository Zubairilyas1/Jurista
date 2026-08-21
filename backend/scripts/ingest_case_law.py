import os
import json
import chromadb
from pathlib import Path
from sentence_transformers import SentenceTransformer
from tqdm import tqdm

def ingest_case_law():
    print("Starting Case Law Ingestion...")
    
    # 1. Setup paths
    base_dir = Path(__file__).parent.parent
    case_law_dir = base_dir / "data" / "raw" / "case_law"
    db_path = base_dir / "data" / "chroma_db"
    
    if not case_law_dir.exists():
        print(f"Directory {case_law_dir} does not exist.")
        return

    # 2. Connect to ChromaDB
    print(f"Connecting to ChromaDB at {db_path}...")
    client = chromadb.PersistentClient(path=str(db_path))
    collection = client.get_or_create_collection("pakistani_law")
    
    # 3. Load Embedding Model
    print("Loading embedding model (all-MiniLM-L6-v2)...")
    model = SentenceTransformer('all-MiniLM-L6-v2')
    
    # 4. Find all JSON files
    json_files = list(case_law_dir.glob("*.json"))
    # Ignore the schema template
    json_files = [f for f in json_files if f.name != "schema_template.json"]
    
    if not json_files:
        print(f"No case law JSON files found in {case_law_dir}. Add some and try again.")
        return
        
    print(f"Found {len(json_files)} case law files to process.")
    
    # 5. Process files
    total_added = 0
    
    for file_path in json_files:
        print(f"\nProcessing {file_path.name}...")
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                cases = json.load(f)
        except Exception as e:
            print(f"Failed to read {file_path.name}: {e}")
            continue
            
        chunks = []
        metadatas = []
        ids = []
        
        for i, case in enumerate(cases):
            citation = case.get("citation", f"Unknown Citation {i}")
            court = case.get("court", "Unknown Court")
            year = case.get("year", "Unknown Year")
            topic = case.get("topic", "General")
            
            # Handle statutes_cited which might be a list or a string
            statutes = case.get("statutes_cited", [])
            if isinstance(statutes, list):
                statutes_str = " | ".join(statutes)
            else:
                statutes_str = str(statutes)
                
            ratio = case.get("ratio_decidendi", "")
            summary = case.get("summary_text", "")
            
            # THE MAGIC SAUCE: Concatenating metadata explicitly into the embedding text!
            embedding_text = f"Citation: {citation}\nCourt: {court}\nYear: {year}\nTopic: {topic}\nStatutes Cited: {statutes_str}\nHolding/Ratio: {ratio}\nSummary: {summary}"
            
            chunks.append(embedding_text)
            metadatas.append({
                "source": citation,
                "citation": f"{court} ({year}) - {topic}",
                "type": "case_law",
                "section": statutes_str,
                "file_name": file_path.name
            })
            ids.append(f"caselaw_{file_path.stem}_{i}")
            
        if chunks:
            # Batch add to avoid memory issues (e.g. 100 at a time)
            batch_size = 100
            for i in tqdm(range(0, len(chunks), batch_size), desc="Ingesting Batches"):
                batch_chunks = chunks[i:i+batch_size]
                batch_metas = metadatas[i:i+batch_size]
                batch_ids = ids[i:i+batch_size]
                
                # Generate embeddings
                embeddings = model.encode(batch_chunks).tolist()
                
                collection.add(
                    documents=batch_chunks,
                    embeddings=embeddings,
                    metadatas=batch_metas,
                    ids=batch_ids
                )
                total_added += len(batch_chunks)
                
    print(f"\n? Ingestion Complete! Successfully added {total_added} case law precedents to Jurista.")

if __name__ == "__main__":
    ingest_case_law()
