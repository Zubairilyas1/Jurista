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
        self.chroma_path = self.data_root.parent / "chroma_db_v4"
        self.model_name = "all-MiniLM-L6-v2"
        
        self.client = chromadb.PersistentClient(path="./data/chroma_db_v5")
        self.model = SentenceTransformer(self.model_name)
        try:
            self.collection = self.client.get_collection("pakistani_law")
        except:
            self.collection = self.client.create_collection(
                name="pakistani_law",
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
            
            text = self._clean_text(text)
            
            if not text or len(text) < 100:
                raise ValueError("Extracted text is too short or empty")
            
            # Extract a meaningful title from the text
            title = self._extract_title(text, file_path)
            
            # Extract Domain if present
            domain_match = re.search(r'(?i)Domain:\s*([^\n]+)', text)
            domain_prefix = f"[Domain: {domain_match.group(1).strip()}]\n" if domain_match else ""
            
            chunks = self._chunk_text(text)
            
            # Prepend domain prefix to chunks
            if domain_prefix:
                chunks = [domain_prefix + c for c in chunks]
            
            metadatas = []
            ids = []
            for idx, chunk in enumerate(chunks):
                meta = {
                    "source": title,
                    "type": category,
                    "citation": f"{title} ? Section {idx+1}",
                    "file_name": file_path.name,
                    "indexed_at": datetime.now().isoformat()
                }
                if domain_match:
                    meta["domain"] = domain_match.group(1).strip()
                metadatas.append(meta)
                ids.append(f"{title}_{idx}_{datetime.now().timestamp()}")
            
            embeddings = self.model.encode(chunks).tolist()
            
            self.collection.add(
                documents=chunks,
                embeddings=embeddings,
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

    def _clean_text(self, text: str) -> str:
        # Replace special invisible characters and weird spacing from bad OCR/PDFs
        text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f\ufffd]', ' ', text)

        # Un-glue common words like safetyhelmet -> safety helmet
        text = text.replace('safetyhelmet', 'safety helmet')
        text = text.replace('crashhelmet', 'crash helmet')
        text = text.replace('withouthelmet', 'without helmet')
        # Normalize spaces but preserve newlines
        text = re.sub(r'[ \t\r\f\v]+', ' ', text)
        # Fix missing spaces after punctuation
        text = re.sub(r'([a-z])\.([A-Z])', r'\1. \2', text)
        return text

    def _extract_txt(self, file_path: Path) -> str:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()

    def _extract_title(self, text: str, file_path: Path) -> str:
        """
        Try to extract a meaningful authentic title from the text.
        """
        lines = text.split('\n')
        # Look through first 50 lines
        for line in lines[:50]:
            line = line.strip()
            # Aggressive match for authentic Pakistani laws: "THE [NAME] ORDINANCE/ACT, 20XX"
            match = re.search(r'THE\s+([A-Za-z\s]+)\s+(ACT|ORDINANCE|RULES),\s*(\d{4})', line, re.I)
            if match:
                return f"The {match.group(1).title().strip()} {match.group(2).title()}, {match.group(3)}"
            
            # Match "National Highways Safety Ordinance, 2000" etc.
            match = re.search(r'([A-Za-z\s]+)\s+(ACT|ORDINANCE|RULES),\s*(\d{4})', line, re.I)
            if match:
                return f"{match.group(1).title().strip()} {match.group(2).title()}, {match.group(3)}"

        # Fallback: use filename (clean it up)
        return file_path.stem.replace("_", " ").replace("-", " ").title()

    def _chunk_text(self, text: str) -> list:
        from langchain_text_splitters import RecursiveCharacterTextSplitter
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
            is_separator_regex=False,
        )
        chunks = text_splitter.split_text(text)
        return [c.strip() for c in chunks if len(c.strip()) > 50]

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
