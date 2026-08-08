"""
Data Ingestor Service ? automatically indexes PDFs/TXTs from pending folders.
Extracts document title from first page when possible.
"""
import os
import shutil
import json
import re
from pathlib import Path
from datetime import datetime
from typing import Optional
import pdfplumber
from pypdf import PdfReader
from sentence_transformers import SentenceTransformer
import chromadb
from chromadb.utils import embedding_functions

class DataIngestor:
    def __init__(self):
        self.data_root = Path(__file__).parent.parent.parent / "data" / "raw"
        self.chroma_path = self.data_root.parent / "chroma_db"
        self.model_name = "all-MiniLM-L6-v2"
        
        self.client = chromadb.PersistentClient(path=str(self.chroma_path))
        self.embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(model_name=self.model_name)
        try:
            self.collection = self.client.get_collection("pakistani_law")
        except:
            self.collection = self.client.create_collection(
                name="pakistani_law",
                embedding_function=self.embedding_fn,
                metadata={"hnsw:space": "cosine"}
            )

    def process_file(self, file_path: Path, category: str = "statutes") -> dict:
        result = {"success": False, "chunks": 0, "error": None}
        try:
            ext = file_path.suffix.lower()
            if ext == ".pdf":
                text = self._extract_pdf_text(file_path)
            elif ext == ".txt":
                text = self._extract_txt(file_path)
            else:
                raise ValueError(f"Unsupported file type: {ext}")
            
            if not text or len(text) < 100:
                raise ValueError("Extracted text is too short or empty")
            
            # Extract a meaningful title from the text
            title = self._extract_title(text, file_path)
            
            chunks = self._chunk_text(text)
            
            metadatas = []
            ids = []
            for idx, chunk in enumerate(chunks):
                metadatas.append({
                    "source": title,
                    "type": category,
                    "citation": f"{title} ? Section {idx+1}",
                    "file_name": file_path.name,
                    "indexed_at": datetime.now().isoformat()
                })
                ids.append(f"{title}_{idx}_{datetime.now().timestamp()}")
            
            self.collection.add(
                documents=chunks,
                metadatas=metadatas,
                ids=ids
            )
            result["success"] = True
            result["chunks"] = len(chunks)
        except Exception as e:
            result["error"] = str(e)
        return result

    def _extract_pdf_text(self, file_path: Path) -> str:
        full_text = ""
        try:
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    text = page.extract_text()
                    if text:
                        full_text += text + "\n\n"
        except:
            try:
                reader = PdfReader(file_path)
                for page in reader.pages:
                    text = page.extract_text()
                    if text:
                        full_text += text + "\n\n"
            except Exception as e:
                raise ValueError(f"Failed to extract PDF text: {e}")
        return full_text

    def _extract_txt(self, file_path: Path) -> str:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()

    def _extract_title(self, text: str, file_path: Path) -> str:
        """
        Try to extract a meaningful title from the first few lines of text.
        Look for patterns like "Elections Act", "Representation of the People Act", etc.
        If nothing found, fall back to the filename.
        """
        lines = text.split('\n')
        # Look through first 30 lines
        for line in lines[:30]:
            line = line.strip()
            # Common act title patterns
            if re.search(r'(Elections Act|Representation of the People Act|Ordinance|Act \d+ of \d{4})', line, re.I):
                # Extract the full act name (until a comma or period)
                match = re.search(r'((?:Elections Act|Representation of the People Act|Ordinance|Act \d+ of \d{4})[^,.\n]*)', line, re.I)
                if match:
                    return match.group(1).strip()
            # Also look for "THE ... ACT/ORDINANCE" pattern (common in Pakistan laws)
            if re.search(r'THE\s+([A-Z\s]+)\s+(ACT|ORDINANCE)', line, re.I):
                match = re.search(r'THE\s+([A-Z\s]+)\s+(ACT|ORDINANCE)', line, re.I)
                if match:
                    return match.group(1).strip() + " " + match.group(2).title()
        # Fallback: use filename (clean it up)
        return file_path.stem.replace("_", " ").replace("-", " ")

    def _chunk_text(self, text: str) -> list:
        sections = re.split(r'(?i)(?=Section |SECTION |Art\. |Article |THE SCHEDULE)', text)
        if len(sections) > 1:
            return [s.strip() for s in sections if len(s.strip()) > 50]
        paragraphs = text.split("\n\n")
        return [p.strip() for p in paragraphs if len(p.strip()) > 100]

    def scan_and_index(self, category: str = "vehicle_statutes") -> dict:
        pending_dir = self.data_root / category / "pending"
        indexed_dir = self.data_root / category / "indexed"
        failed_dir = self.data_root / category / "failed"
        
        pending_dir.mkdir(parents=True, exist_ok=True)
        indexed_dir.mkdir(parents=True, exist_ok=True)
        failed_dir.mkdir(parents=True, exist_ok=True)
        
        files = list(pending_dir.glob("*.*"))
        results = {"total": len(files), "success": 0, "failed": 0, "details": []}
        
        for file_path in files:
            print(f"?? Processing: {file_path.name}")
            result = self.process_file(file_path, category)
            if result["success"]:
                dest = indexed_dir / file_path.name
                shutil.move(str(file_path), str(dest))
                results["success"] += 1
                results["details"].append({"file": file_path.name, "status": "success", "chunks": result["chunks"]})
                print(f"  ? {file_path.name} -> {result['chunks']} chunks")
            else:
                dest = failed_dir / file_path.name
                shutil.move(str(file_path), str(dest))
                results["failed"] += 1
                results["details"].append({"file": file_path.name, "status": "failed", "error": result["error"]})
                print(f"  ? {file_path.name} failed: {result['error']}")
        
        print(f"\n?? Scan complete: {results['success']} success, {results['failed']} failed")
        return results
