import os
import sys
from pathlib import Path

# Add the parent directory to sys.path so we can import config if needed
sys.path.append(str(Path(__file__).parent.parent))

import chromadb
from sentence_transformers import SentenceTransformer
from chromadb.utils import embedding_functions

# --- Configuration ---
DATA_FILE = Path(__file__).parent.parent / "data" / "raw" / "crpc_497.txt"
CHROMA_DB_PATH = Path(__file__).parent.parent / "data" / "chroma_db"

# Use BGE-M3 as per the technical spec
# Note: This will download ~2GB of model files on first run change with smaller model for right now 
MODEL_NAME = "all-MiniLM-L6-v2"

# If you have slow internet and BGE-M3 fails to download, uncomment this line
# and comment out the line above to use a smaller, faster model for testing:
# MODEL_NAME = "all-MiniLM-L6-v2"

# --- 1. Initialize ChromaDB Client ---
# Using PersistentClient so data stays on disk
client = chromadb.PersistentClient(path=str(CHROMA_DB_PATH))

# --- 2. Initialize the embedding function ---
# The embedding function wraps the SentenceTransformer model so ChromaDB can use it directly.
embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(model_name=MODEL_NAME)

# --- 3. Create or get the collection ---
# We'll store all legal texts in a collection named "pakistani_law"
collection_name = "pakistani_law"
try:
    client.delete_collection(collection_name)  # Delete if exists to avoid duplicate data
except Exception:
    pass  # Collection doesn't exist, that's fine

collection = client.create_collection(
    name=collection_name,
    embedding_function=embedding_fn,
    metadata={"hnsw:space": "cosine"}  # Use cosine similarity
)

# --- 4. Read and chunk the legal text ---
with open(DATA_FILE, "r", encoding="utf-8") as f:
    text = f.read()

# Simple chunking: split by double newlines (paragraphs)
# Keep metadata (citation) attached to each chunk
chunks = []
metadatas = []

# We'll track which chunk belongs to which citation
current_citation = "STATUTE: CrPC 1898, Section 497"
current_source = "CrPC_1898"

# Split the text into blocks
blocks = text.split("\n\n")

for block in blocks:
    block = block.strip()
    if not block:
        continue
    
    # Check if this block contains a case citation (PLD / SCMR)
    if "PLD" in block or "SCMR" in block:
        # Try to extract the citation from the block
        # Simple heuristic: take the first "PLD" or "SCMR" string
        import re
        match = re.search(r'(PLD \d{4} \w+ \d+)|(SCMR \d{4} \w+ \d+)', block)
        if match:
            current_citation = match.group(0)
            current_source = "Case_Law"
        else:
            # If no citation found, keep it as statute
            current_citation = "STATUTE: CrPC 1898, Section 497"
            current_source = "CrPC_1898"
    else:
        # If it's not a case block, treat it as statute text
        current_citation = "STATUTE: CrPC 1898, Section 497"
        current_source = "CrPC_1898"
    
    chunks.append(block)
    metadatas.append({
        "text": block,
        "citation": current_citation,
        "source": current_source,
        "type": "statute" if "STATUTE" in current_citation else "case_law",
        "bench_type": "SC_FULL" if "SC" in current_citation else "STATUTE"
    })

# --- 5. Generate IDs and add to ChromaDB ---
ids = [f"chunk_{i}" for i in range(len(chunks))]

collection.add(
    documents=chunks,  # These will be embedded automatically
    metadatas=metadatas,
    ids=ids
)

# --- 6. Summary ---
print(f"✅ Indexed {len(chunks)} chunks into ChromaDB collection '{collection_name}'")
print(f"📁 Database stored at: {CHROMA_DB_PATH}")

# Quick test: count the items
count = collection.count()
print(f"📊 Total documents in collection: {count}")