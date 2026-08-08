from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
import json
import requests
import os
from dotenv import load_dotenv, find_dotenv

dotenv_path = find_dotenv()
load_dotenv(dotenv_path)

from app.core.rag_engine import RAGEngine
from app.core.overrule_graph import OverruleGraph

router = APIRouter(prefix="/api/v1/rag", tags=["RAG"])

rag = RAGEngine()
overrule = OverruleGraph()

class QueryRequest(BaseModel):
    query: str
    top_k: Optional[int] = 5

class CitationReference(BaseModel):
    citation: str
    validity_status: str
    retrieval_score: Optional[float] = None

class QueryResponse(BaseModel):
    answer: dict
    citations: List[CitationReference]
    grounding_status: str

LLM_API_BASE = os.getenv("LLM_API_BASE", "https://api.groq.com/openai/v1")
LLM_MODEL_NAME = os.getenv("LLM_MODEL_NAME", "llama-3.3-70b-versatile")
LLM_API_KEY = os.getenv("LLM_API_KEY")

print(f"?? .env loaded from: {dotenv_path}")
print(f"?? LLM_API_KEY loaded: {'? Yes' if LLM_API_KEY else '? NO'}")
print(f"?? Base URL: {LLM_API_BASE}")
print(f"?? Model: {LLM_MODEL_NAME}")

def generate_with_llm(prompt: str) -> str:
    if not LLM_API_KEY:
        return None
    url = f"{LLM_API_BASE.rstrip('/')}/chat/completions"
    headers = {
        "Authorization": f"Bearer {LLM_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": LLM_MODEL_NAME,
        "messages": [
            {"role": "system", "content": "You are a Pakistani Traffic and Motor Vehicle Legal Assistant. Answer the user's question about driving, vehicles, or traffic offenses based ONLY on the provided legal texts. Provide a clear, comprehensive, and practical answer in plain English. Include the relevant law, the offence, the punishment (like fines or points), and any practical advice. Keep it concise but thorough."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.3,
        "max_tokens": 800,
        "stream": False
    }
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=60)
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"]
    except Exception as e:
        print(f"? LLM API error: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"   Status: {e.response.status_code}")
            print(f"   Body: {e.response.text[:500]}")
        return None

@router.post("/query", response_model=QueryResponse)
async def legal_query(request: QueryRequest):
    normalized_query = request.query.strip()
    chunks = rag.query(normalized_query, top_k=request.top_k)

    if not chunks:
        return QueryResponse(
            answer={"Full_Answer": "No reliable authority found. Please rephrase your question or upload more legal texts."},
            citations=[],
            grounding_status="NO_RELIABLE_AUTHORITY_FOUND"
        )

    valid_chunks = []
    citations_response = []
    for chunk in chunks:
        citable, note = overrule.is_citable(chunk["citation"])
        if citable:
            valid_chunks.append(chunk)
            citations_response.append(
                CitationReference(
                    citation=chunk["citation"],
                    validity_status="GOOD_LAW",
                    retrieval_score=chunk.get("score")
                )
            )
        else:
            citations_response.append(
                CitationReference(
                    citation=chunk["citation"],
                    validity_status="OVERRULED_FILTERED",
                    retrieval_score=chunk.get("score")
                )
            )

    if not valid_chunks:
        return QueryResponse(
            answer={"Full_Answer": "Only overruled authority found. Please consult a senior advocate."},
            citations=citations_response,
            grounding_status="ONLY_OVERRULED_AUTHORITY_AVAILABLE"
        )

    # Build the legal context from retrieved chunks
    legal_context = "\n\n".join([chunk["text"] for chunk in valid_chunks[:5]])
    
    # Build the prompt for the LLM
    prompt = f"""User's question: {request.query}

Relevant legal texts (retrieved from Pakistani Traffic and Vehicle laws):
{legal_context}

Based ONLY on the above texts, provide a complete answer that:
1. Identifies the specific vehicle law/ordinance (citation) that applies.
2. Explains what the traffic/vehicle offence is.
3. States the punishment (fine amount, imprisonment, impoundment, etc.).
4. Gives practical advice for the driver/user.

Write in plain, clear English. Keep it concise but thorough.
Do NOT include any extra information not found in the provided texts."""

    llm_answer = generate_with_llm(prompt)

    if not llm_answer:
        llm_answer = "The LLM service is currently unavailable. Please review the applicable law below."

    # Build the final answer object (single field)
    answer_obj = {
        "Full_Answer": llm_answer
    }

    return QueryResponse(
        answer=answer_obj,
        citations=citations_response,
        grounding_status="GROUNDED"
    )
