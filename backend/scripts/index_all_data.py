import os
import re
import re
import json
import pandas as pd
from pathlib import Path
from sentence_transformers import SentenceTransformer
import chromadb
from chromadb.utils import embedding_functions

# --- Configuration ---
DATA_ROOT = Path(__file__).parent.parent / "data" / "raw"
CHROMA_DB_PATH = Path(__file__).parent.parent / "data" / "chroma_db"

# Use the same model as before
MODEL_NAME = "all-MiniLM-L6-v2"

# --- Initialize ChromaDB ---
client = chromadb.PersistentClient(path=str(CHROMA_DB_PATH))
embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(model_name=MODEL_NAME)

# Delete existing collection to start fresh
collection_name = "pakistani_law"
try:
    client.delete_collection(collection_name)
except Exception:
    pass
collection = client.create_collection(
    name=collection_name,
    embedding_function=embedding_fn,
    metadata={"hnsw:space": "cosine"}
)

# --- Helper: Add chunks to ChromaDB ---
def add_chunks(chunks, metadatas, ids):
    if not chunks:
        return
    collection.add(
        documents=chunks,
        metadatas=metadatas,
        ids=ids
    )
    print(f"  ? Added {len(chunks)} chunks")

# ============================================================
# 1. PROCESS JSONL FILES (CrPC, CPC, PPC, Qanoon-e-Shahadat)
# ============================================================
def process_jsonl(file_path, source_name):
    print(f"?? Processing {source_name} from {file_path.name}...")
    chunks = []
    metadatas = []
    ids = []
    
    with open(file_path, 'r', encoding='utf-8') as f:
        for line_num, line in enumerate(f):
            try:
                data = json.loads(line.strip())
                section_id = data.get("id", f"{source_name}_{line_num}")
                text = data.get("text", "").strip()
                if not text:
                    continue
                
                chunks.append(text)
                metadatas.append({
                    "source": source_name,
                    "section": section_id,
                    "type": "statute",
                    "citation": f"{source_name} ? {section_id}"
                })
                ids.append(f"{source_name}_{section_id}_{line_num}")
            except json.JSONDecodeError:
                print(f"  ?? Skipping invalid JSON line {line_num}")
    
    add_chunks(chunks, metadatas, ids)

# ============================================================
# 2. PROCESS SINGLE JSON FILE (969 laws from Hugging Face)
# ============================================================
def process_big_json(file_path):
    print(f"?? Processing big JSON: {file_path.name}...")
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    chunks = []
    metadatas = []
    ids = []
    
    for idx, entry in enumerate(data):
        file_name = entry.get("file_name", f"law_{idx}")
        content = entry.get("text", "").strip()   # note: key is "text", not "content"
        if not content:
            continue
        
        # Extract a proper title from the first few lines
        lines = content.split('\n')
        title = file_name.replace(".pdf", "").replace("_", " ").strip()
        for line in lines[:20]:
            line = line.strip()
            # Look for ALL CAPS act name pattern (common)
            if re.search(r'^[A-Z][A-Z\s]+\s+(ACT|ORDINANCE|RULE|REGULATION)', line, re.I):
                # Take the whole line up to 100 chars as title
                title = line[:100].strip()
                break
            # Also look for "THE ... ACT" pattern
            match = re.search(r'THE\s+([A-Z\s]+)\s+ACT', line, re.I)
            if match:
                title = match.group(0).strip()
                break
            # Look for "ORDINANCE" pattern
            match = re.search(r'THE\s+([A-Z\s]+)\s+ORDINANCE', line, re.I)
            if match:
                title = match.group(0).strip()
                break
        
        # Split content into paragraphs
        paragraphs = content.split("\n\n")
        for p_idx, para in enumerate(paragraphs):
            para = para.strip()
            if len(para) < 50:
                continue
            chunks.append(para)
            metadatas.append({
                "source": title,
                "file_name": file_name,
                "type": "statute",
                "citation": f"{title} ? Part {p_idx+1}"
            })
            ids.append(f"bigjson_{idx}_{p_idx}")
    
    add_chunks(chunks, metadatas, ids)

# ============================================================
# 3. PROCESS PARQUET (Supreme Court Judgments)
# ============================================================
def process_parquet(file_path, source_name):
    print(f"?? Processing {source_name} from {file_path.name}...")
    try:
        df = pd.read_parquet(file_path)
    except Exception as e:
        print(f"  ?? Could not read parquet: {e}")
        return
    
    chunks = []
    metadatas = []
    ids = []
    
    text_col = None
    citation_col = None
    for col in df.columns:
        if "text" in col.lower() or "judgment" in col.lower():
            text_col = col
        if "citation" in col.lower() or "case" in col.lower():
            citation_col = col
    
    if text_col is None:
        print(f"  ?? No text column found in {file_path.name}. Skipping.")
        return
    
    for idx, row in df.iterrows():
        text = str(row[text_col]) if pd.notna(row[text_col]) else ""
        if len(text) < 100:
            continue
        
        citation = str(row[citation_col]) if citation_col and pd.notna(row[citation_col]) else f"SC_Judgment_{idx}"
        
        paragraphs = text.split("\n\n")
        for p_idx, para in enumerate(paragraphs):
            para = para.strip()
            if len(para) < 100:
                continue
            chunks.append(para)
            metadatas.append({
                "source": source_name,
                "citation": citation,
                "type": "case_law",
                "bench_type": "SC_FULL"
            })
            ids.append(f"{source_name}_{idx}_{p_idx}")
    
    add_chunks(chunks, metadatas, ids)

# ============================================================
# 4. PROCESS PDF (all PDFs in statutes folder)
# ============================================================
def process_pdf(file_path, source_name):
    print(f"?? Processing {source_name} from {file_path.name}...")
    try:
        import pdfplumber
        with pdfplumber.open(file_path) as pdf:
            full_text = ""
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    full_text += text + "\n\n"
        
        if len(full_text) < 500:
            print("  ?? PDF text extraction returned very little text. Trying raw text extraction...")
            try:
                from pypdf import PdfReader
                reader = PdfReader(file_path)
                full_text = ""
                for page in reader.pages:
                    text = page.extract_text()
                    if text:
                        full_text += text + "\n\n"
            except Exception as e:
                print(f"  ?? Fallback extraction failed: {e}")

        chunks = []
        metadatas = []
        ids = []

        import re
        sections = re.split(r'(?i)(?=Section |SECTION |Art\. |Article |THE SCHEDULE)', full_text)
        if len(sections) <= 1:
            print("  ?? No sections found. Splitting by paragraphs...")
            paragraphs = full_text.split("\n\n")
            for idx, para in enumerate(paragraphs):
                para = para.strip()
                if len(para) > 100:
                    chunks.append(para)
                    metadatas.append({
                        "source": source_name,
                        "type": "statute",
                        "citation": f"{source_name} ? Part {idx+1}"
                    })
                    ids.append(f"{source_name}_{idx}")
        else:
            for idx, sec in enumerate(sections):
                sec = sec.strip()
                if len(sec) < 50:
                    continue
                chunks.append(sec)
                metadatas.append({
                    "source": source_name,
                    "type": "statute",
                    "citation": f"{source_name} ? {sec[:40].replace(chr(10), ' ').strip()}"
                })
                ids.append(f"{source_name}_{idx}")

        add_chunks(chunks, metadatas, ids)
    except ImportError:
        print("  ?? pdfplumber not installed. Install with: pip install pdfplumber")
    except Exception as e:
        print(f"  ?? Error processing PDF: {e}")

# ============================================================
# 5. PROCESS TXT FILES (Manual text versions)
# ============================================================
def process_txt(file_path, source_name):
    print(f"?? Processing {source_name} from {file_path.name}...")
    with open(file_path, 'r', encoding='utf-8') as f:
        full_text = f.read()

    chunks = []
    metadatas = []
    ids = []

    import re
    sections = re.split(r'(?i)(?=Section |SECTION |Art\. |Article |THE SCHEDULE)', full_text)
    
    if len(sections) <= 1:
        paragraphs = full_text.split("\n\n")
        for idx, para in enumerate(paragraphs):
            para = para.strip()
            if len(para) > 100:
                chunks.append(para)
                metadatas.append({
                    "source": source_name,
                    "type": "statute",
                    "citation": f"{source_name} ? Part {idx+1}"
                })
                ids.append(f"{source_name}_{idx}")
    else:
        for idx, sec in enumerate(sections):
            sec = sec.strip()
            if len(sec) < 50:
                continue
            chunks.append(sec)
            metadatas.append({
                "source": source_name,
                "type": "statute",
                "citation": f"{source_name} ? {sec[:40].replace(chr(10), ' ').strip()}"
            })
            ids.append(f"{source_name}_{idx}")

    add_chunks(chunks, metadatas, ids)

# ============================================================
# MAIN: Process all files
# ============================================================
def main():
    print("?? Starting unified indexing...\n")
    
    # 1. JSONL files (statutes)
    jsonl_files = {
        "CrPC": DATA_ROOT / "statutes" / "CrPC.jsonl",
        "CPC": DATA_ROOT / "statutes" / "CPC.jsonl",
        "PPC": DATA_ROOT / "statutes" / "PPC.jsonl",
        "QanoonEShahadat": DATA_ROOT / "statutes" / "QanoonEShahadat.jsonl",
    }
    for name, path in jsonl_files.items():
        if path.exists():
            process_jsonl(path, name)
        else:
            print(f"?? File not found: {path}")
    
    # 2. Big JSON (969 laws)
    big_json_path = DATA_ROOT / "statutes" / "pakistan_laws.json"
    if big_json_path.exists():
        process_big_json(big_json_path)
    else:
        print(f"?? File not found: {big_json_path}")
    
    # 3. Parquet (Supreme Court judgments)
    sc_parquet = DATA_ROOT / "case_law" / "supreme_court_judgments.parquet"
    if sc_parquet.exists():
        process_parquet(sc_parquet, "Supreme_Court")
    else:
        print(f"?? File not found: {sc_parquet}")
    
    # 4. ALL PDF files in the statutes folder
    pdf_files = DATA_ROOT.glob("statutes/*.pdf")
    for pdf_file in pdf_files:
        # Skip if it's the limitation act PDF (already handled, but we can skip or include)
        # if pdf_file.name.lower() == "limitation_act.pdf":
        #     continue
        source_name = pdf_file.stem.replace("_", " ").replace("-", " ")
        process_pdf(pdf_file, source_name)
    
    # 5. TXT files (Manual text versions)
    txt_files = DATA_ROOT.glob("statutes/*.txt")
    for txt_file in txt_files:
        # Skip if it's the limitation act txt (already handled)
        if txt_file.name.lower() == "limitation-act.txt":
            continue
        process_txt(txt_file, txt_file.stem)
    
    count = collection.count()
    print(f"\n? Indexing complete! Total documents in ChromaDB: {count}")

if __name__ == "__main__":
    main()





