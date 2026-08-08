import os
import re
from io import BytesIO
from PIL import Image
import numpy as np
import fitz
import easyocr

class OCRPipeline:
    def __init__(self):
        self.reader = easyocr.Reader(['en', 'ur'], gpu=False)

    def process_file(self, file_bytes, filename):
        print(f"?? Received file: {filename}")
        print(f"?? File size: {len(file_bytes)} bytes")
        hex_preview = file_bytes[:32].hex()
        print(f"?? First 32 bytes (hex): {hex_preview}")
        ascii_preview = file_bytes[:32].decode('latin-1', errors='replace')
        print(f"?? ASCII preview: {ascii_preview}")

        if file_bytes.startswith(b'%PDF'):
            print("? Detected as PDF")
            try:
                images = self._pdf_to_images(file_bytes)
            except Exception as e:
                print(f"?? PDF conversion failed: {e}")
                try:
                    images = [Image.open(BytesIO(file_bytes)).convert('RGB')]
                    print("? Fallback as image succeeded")
                except Exception as img_err:
                    raise ValueError(f"File is neither a valid PDF nor a valid image. PDF error: {e}, Image error: {img_err}")
        else:
            print("?? Not a PDF, trying as image")
            try:
                images = [Image.open(BytesIO(file_bytes)).convert('RGB')]
                print("? Image opened successfully")
            except Exception as img_err:
                raise ValueError(f"File is not a valid image: {img_err}")

        all_lines = []
        full_text = ""

        for img in images:
            img_np = np.array(img)
            try:
                results = self.reader.readtext(img_np)
                for bbox, text, confidence in results:
                    # Convert numpy types to native Python types for JSON serialization
                    bbox_list = [[float(coord) for coord in point] for point in bbox]
                    all_lines.append({
                        "text": text,
                        "confidence": float(confidence),
                        "bbox": bbox_list
                    })
                    full_text += text + "\n"
            except Exception as e:
                print(f"?? OCR on image failed: {e}")
                continue

        summary = self._extract_summary(full_text)
        return {
            "text": full_text,
            "lines": all_lines,
            "summary": summary
        }

    def _pdf_to_images(self, file_bytes):
        if not file_bytes.startswith(b'%PDF'):
            raise ValueError("File does not appear to be a valid PDF (missing %PDF header)")
        pdf_document = fitz.open(stream=file_bytes, filetype="pdf")
        images = []
        for page_num in range(pdf_document.page_count):
            page = pdf_document[page_num]
            pix = page.get_pixmap(dpi=200)
            img_data = pix.tobytes("png")
            img = Image.open(BytesIO(img_data))
            images.append(img)
        pdf_document.close()
        return images

    def _extract_summary(self, text):
        parties = []
        sections = []
        events = []

        lines = text.split('\n')
        for line in lines:
            line_lower = line.lower()
            if 'petitioner' in line_lower or 'plaintiff' in line_lower:
                if ':' in line:
                    party = line.split(':', 1)[1].strip()
                else:
                    match = re.search(r'(?:Petitioner|Plaintiff)\s*[:]?\s*(.*)', line, re.I)
                    if match:
                        party = match.group(1).strip()
                    else:
                        party = line.strip()
                if party:
                    parties.append(party)
            elif 'respondent' in line_lower or 'defendant' in line_lower:
                if ':' in line:
                    party = line.split(':', 1)[1].strip()
                else:
                    match = re.search(r'(?:Respondent|Defendant)\s*[:]?\s*(.*)', line, re.I)
                    if match:
                        party = match.group(1).strip()
                    else:
                        party = line.strip()
                if party:
                    parties.append(party)

        ppc = re.findall(r'(?:PPC|Pakistan Penal Code)\s*[:]?\s*(\d+)', text, re.I)
        if ppc:
            sections.extend([f"PPC {s}" for s in ppc])
        crpc = re.findall(r'(?:CrPC|Criminal Procedure Code)\s*[:]?\s*(\d+)', text, re.I)
        if crpc:
            sections.extend([f"CrPC {s}" for s in crpc])

        dates = re.findall(r'\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b', text)
        for d in dates:
            events.append(f"Date: {d}")

        return {
            "parties": parties,
            "sections": sections,
            "events": events
        }
