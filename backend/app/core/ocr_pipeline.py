import os
import json
import base64
from io import BytesIO
from PIL import Image
import fitz
import requests
from dotenv import load_dotenv, find_dotenv

class OCRPipeline:
    def __init__(self):
        load_dotenv(find_dotenv(), override=True)
        self.api_key = os.getenv("GEMINI_API_KEY")

    def process_file(self, file_bytes, filename):
        print(f"?? Received file: {filename}")
        
        if file_bytes.startswith(b'%PDF'):
            print("? Detected as PDF")
            try:
                images = self._pdf_to_images(file_bytes)
                if not images:
                    raise ValueError("PDF had no pages.")
                # For simplicity, process the first page
                img = images[0]
            except Exception as e:
                raise ValueError(f"Failed to process PDF: {e}")
        else:
            print("?? Detected as Image")
            try:
                img = Image.open(BytesIO(file_bytes)).convert('RGB')
            except Exception as img_err:
                raise ValueError(f"File is not a valid image: {img_err}")

        # Convert image to Base64
        buffered = BytesIO()
        # Resize if too large to save tokens/time (Gemini handles 1200px well)
        img.thumbnail((1600, 1600))
        img.save(buffered, format="JPEG", quality=85)
        base64_image = base64.b64encode(buffered.getvalue()).decode('utf-8')

        return self._extract_with_vision(base64_image)

    def _pdf_to_images(self, file_bytes):
        pdf_document = fitz.open(stream=file_bytes, filetype="pdf")
        images = []
        for page_num in range(min(1, pdf_document.page_count)): # Only first page for now
            page = pdf_document[page_num]
            pix = page.get_pixmap(dpi=150)
            img_data = pix.tobytes("jpeg")
            img = Image.open(BytesIO(img_data))
            images.append(img)
        pdf_document.close()
        return images

    def _extract_with_vision(self, base64_image):
        default_response = {
            "text": "Gemini Vision extraction failed or API key missing.",
            "lines": [],
            "summary": {
                "parties": [],
                "sections": [],
                "events": []
            }
        }

        if not self.api_key:
            print("? GEMINI_API_KEY missing. Cannot run Vision OCR.")
            return default_response

        prompt = """You are an expert Pakistani Legal Data Extractor and native Urdu speaker. 
Look at this legal document (FIR, Court Order, etc.). It contains handwritten-style Nastaliq Urdu and some English.

Your task is to do BOTH OCR transcription and Data Extraction natively from the image:

1. "clean_text": Transcribe the entire document into clean, readable, grammatically correct Urdu (and English where applicable). This is the most important step! Fix any illegible parts by inferring from context.
2. "parties": Identify the actual names of the Plaintiff/Complainant (مستغیث) and Defendant/Accused (ملزم). Do NOT just write "مستغیث"; write their actual name!
3. "sections": Identify Penal Codes. If you see 'ت پ', it means PPC. If you see 'ض ف', it means CrPC. Format them like "PPC 324" or "CrPC 154".
4. "events": Identify important Dates (e.g., "14-04-2024").

You MUST return ONLY a valid JSON object matching this exact structure:
{
  "clean_text": "the full, perfectly readable transcribed urdu text goes here...",
  "parties": ["Name 1", "Name 2"],
  "sections": ["PPC 324"],
  "events": ["Date: 14-04-2024"]
}
"""

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key={self.api_key}"
        
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt},
                        {
                            "inline_data": {
                                "mime_type": "image/jpeg",
                                "data": base64_image
                            }
                        }
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.1,
                "response_mime_type": "application/json"
            }
        }

        try:
            print(f"? Sending Image to Gemini 1.5 Pro Vision...")
            response = requests.post(url, json=payload, timeout=60)
            response.raise_for_status()
            
            data = response.json()
            content = data["candidates"][0]["content"]["parts"][0]["text"]
            
            result = json.loads(content)
            
            return {
                "text": result.get("clean_text", "No text transcribed."),
                "lines": [],
                "summary": {
                    "parties": result.get("parties", []),
                    "sections": result.get("sections", []),
                    "events": result.get("events", [])
                }
            }
        except Exception as e:
            print(f"? Gemini Vision Extraction Failed: {e}")
            if hasattr(e, 'response') and e.response is not None:
                print(f"Status: {e.response.status_code}, Body: {e.response.text}")
            return default_response
