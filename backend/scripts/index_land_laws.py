import os
import re
from pathlib import Path
from sentence_transformers import SentenceTransformer
import chromadb
from chromadb.utils import embedding_functions

# --- Configuration ---
DATA_ROOT = Path(__file__).parent.parent / "data" / "raw" / "vehicle_statutes" / "pending"
CHROMA_DB_PATH = Path(__file__).parent.parent / "data" / "chroma_db"
MODEL_NAME = "all-MiniLM-L6-v2"

print("?? Initializing ChromaDB...")
client = chromadb.PersistentClient(path=str(CHROMA_DB_PATH))
embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(model_name=MODEL_NAME)
collection = client.get_collection(name="pakistani_law", embedding_function=embedding_fn)

def add_chunks(chunks, metadatas, ids):
    if not chunks:
        return
    # Add in batches to prevent payload limits
    batch_size = 100
    for i in range(0, len(chunks), batch_size):
        collection.add(
            documents=chunks[i:i+batch_size],
            metadatas=metadatas[i:i+batch_size],
            ids=ids[i:i+batch_size]
        )
    print(f"  ? Added {len(chunks)} chunks")

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
            print("  ?? PDF text extraction returned very little text. Trying PyPDF...")
            from pypdf import PdfReader
            reader = PdfReader(file_path)
            full_text = ""
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    full_text += text + "\n\n"

        chunks = []
        metadatas = []
        ids = []

        # Split into sections
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
                        "type": "land_statutes",
                        "citation": f"{source_name} - Part {idx+1}"
                    })
                    ids.append(f"{source_name.replace(' ', '_')}_{idx}")
        else:
            for idx, sec in enumerate(sections):
                sec = sec.strip()
                if len(sec) < 50:
                    continue
                chunks.append(sec)
                title = sec[:50].replace(chr(10), ' ').strip()
                metadatas.append({
                    "source": source_name,
                    "type": "land_statutes",
                    "citation": f"{source_name} - {title}"
                })
                ids.append(f"{source_name.replace(' ', '_')}_sec_{idx}")

        add_chunks(chunks, metadatas, ids)
    except Exception as e:
        print(f"  ?? Error processing PDF {file_path.name}: {e}")

def main():
    print(f"?? Scanning for new PDFs in {DATA_ROOT}...")
    pdf_files = DATA_ROOT.glob("*.pdf")
    count_before = collection.count()
    print(f"Current documents in ChromaDB: {count_before}")
    
    for pdf_file in pdf_files:
        source_name = pdf_file.stem.replace("_", " ").replace("-", " ")
        process_pdf(pdf_file, source_name)
        
    count_after = collection.count()
    print(f"\n? Indexing complete! New documents added: {count_after - count_before}")
    print(f"Total documents in ChromaDB: {count_after}")

if __name__ == "__main__":
    main()
