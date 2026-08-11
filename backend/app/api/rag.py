from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
import json
import requests
import os
from dotenv import load_dotenv, find_dotenv

dotenv_path = find_dotenv()
load_dotenv(dotenv_path, override=True)

from app.core.rag_engine import RAGEngine
from app.core.overrule_graph import OverruleGraph

router = APIRouter(prefix="/api/v1/rag", tags=["RAG"])

rag = RAGEngine()
overrule = OverruleGraph()

class QueryRequest(BaseModel):
    query: str
    top_k: Optional[int] = 5
    history: Optional[List[dict]] = []
    reset_context: bool = False
    domain_filter: Optional[str] = None

class CitationReference(BaseModel):
    citation: str
    validity_status: str
    raw_text: str
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

def generate_with_llm(prompt: str, history: List[dict] = None) -> str:
    if not LLM_API_KEY:
        return None
    url = f"{LLM_API_BASE.rstrip('/')}/chat/completions"
    headers = {
        "Authorization": f"Bearer {LLM_API_KEY}",
        "Content-Type": "application/json"
    }
    
    messages = [{"role": "system", "content": "You are a Senior Pakistani Legal Expert and Advocate. Answer the user's question based on the provided legal texts, or your own expert knowledge if the provided text is insufficient. You handle all areas of Pakistani law, including Criminal (PPC/CrPC), Civil, Family, and Traffic laws. Provide a clear, comprehensive, and practical answer in plain English. Include the relevant law, the offence/issue, and practical advice. Keep it concise but thorough. PROCEDURAL FILINGS MANDATE: Whenever providing a litigation strategy, explicitly list all mandatory Day-1 court applications, procedural attachments, and deposit motions required alongside the main plaint (e.g., Section 28 deposit applications in pre-emption, Order 39 Rules 1 & 2 stay applications, Order 26 Rule 9 application for Local Commission in possession disputes, or Order 7 Rule 6 date-of-knowledge declarations). EVIDENCE LAW MANDATE: Whenever analyzing the burden of proof, especially in transactions involving illiterate, bedridden, or vulnerable donors (such as Marz-ul-Maut gifts), you MUST explicitly cite the Qanun-e-Shahadat Order 1984 (e.g. Articles 114 and 121) to explain who bears the legal burden. STRICT GUARDRAIL 1: If the user asks an ethical, moral, political, or off-topic question, you MUST politely reject it. STRICT GUARDRAIL 2: If the user explicitly asks you to draft a petition, legal document, or fill out a form, you MUST respond by briefly acknowledging it and strictly adding the exact text `[OPEN_PETITION_DRAFTER]` at the very end of your response. Do not draft the entire document yourself."}]
    
    if history:
        for msg in history:
            # Skip UI-only fields or clean up attachment messages
            content = msg.get("content", "")
            messages.append({"role": msg.get("role", "user"), "content": content})
            
    messages.append({"role": "user", "content": prompt})

    payload = {
        "model": LLM_MODEL_NAME,
        "messages": messages,
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

def condense_query(query: str, history: List[dict]) -> str:
    if not LLM_API_KEY or not history:
        return query
    
    url = f"{LLM_API_BASE.rstrip('/')}/chat/completions"
    headers = {
        "Authorization": f"Bearer {LLM_API_KEY}",
        "Content-Type": "application/json"
    }
    
    history_text = "\n".join([f"{m['role'].capitalize()}: {m['content']}" for m in history[-4:]])
    prompt = f"""Given the following conversation history, rewrite the user's latest query to be a standalone search query that can be used to search a vector database for Pakistani legal statutes.
CRITICAL INSTRUCTION: If the user's latest query introduces a completely new legal scenario or case (e.g., shifting from criminal law to contract law, or from gift law to specific performance), IGNORE the conversation history entirely and base the standalone query ONLY on the latest query. Do NOT bleed terms from previous unrelated scenarios into the new search.
Do NOT answer the query, just output the rewritten search query.

Conversation History:
{history_text}

Latest Query: {query}
Standalone Query:"""

    payload = {
        "model": LLM_MODEL_NAME,
        "messages": [
            {"role": "system", "content": "You are a helpful query rewriter."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.1,
        "max_tokens": 100,
    }
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=10)
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"].strip(' "')
    except Exception:
        return query

@router.post("/query", response_model=QueryResponse)
async def legal_query(request: QueryRequest):
    normalized_query = request.query.strip()
    
    if request.reset_context:
        request.history = []
    
    # Condense query if history exists
    if request.history:
        search_query = condense_query(normalized_query, request.history)
        print(f"?? Original Query: {normalized_query}")
        print(f"?? Condensation: {search_query}")
    else:
        search_query = normalized_query
        
    chunks = rag.query(search_query, top_k=request.top_k, domain_filter=request.domain_filter)

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
                    raw_text=chunk["text"],
                    retrieval_score=chunk.get("score")
                )
            )
        else:
            citations_response.append(
                CitationReference(
                    citation=chunk["citation"],
                    validity_status="OVERRULED_FILTERED",
                    raw_text=chunk["text"],
                    retrieval_score=chunk.get("score")
                )
            )

    if not valid_chunks:
        return QueryResponse(
            answer={"Full_Answer": "Only overruled authority found. Please consult a senior advocate."},
            citations=citations_response,
            grounding_status="ONLY_OVERRULED_AUTHORITY_AVAILABLE"
        )

    # Build the legal context from retrieved chunks with explicit indexing
    context_parts = []
    for i, chunk in enumerate(valid_chunks[:5]):
        context_parts.append(f"--- Text [{i+1}] ---\nSource: {chunk['citation']}\n{chunk['text']}")
    legal_context = "\n\n".join(context_parts)
    
    # Build the prompt for the LLM
    prompt = f"""User's question: {request.query}

Relevant legal texts (retrieved from Pakistani law databases):
{legal_context}

Provide a complete, authoritative answer strictly following this format:

1. First, you MUST output a <think>...</think> block. Inside this block, do all of your verbose reasoning and fact-checking. Check if the conversation history contains an attached document (like an FIR). If the user is asking about the attached document, YOU MUST BASE YOUR ANSWER ON THE ATTACHED DOCUMENT IN THE HISTORY, NOT ON THE RETRIEVED LEGAL TEXTS! The retrieved legal texts (listed above) might be irrelevant if the user is just asking you to summarize or analyze the document they attached.
2. Immediately after the </think> tag, output the ABSOLUTE ANSWER to the user's question. This answer MUST be direct, concise, and highly actionable.
3. At the very end of your response, you MUST output exactly 3 suggested follow-up questions for the user under the exact heading "### Suggested Questions". Format them as a bulleted list.

CRITICAL INSTRUCTIONS FOR THE ABSOLUTE ANSWER:
- Act as a Senior High Court Advocate. Provide highly detailed, authoritative legal breakdowns.
- When explaining Penal Codes (e.g., PPC 324 or PPC 302), you MUST explain the exact statutory language. Do not give generic summaries. Explicitly mention nuances like Qisas, Arsh, Daman, or Ta'zir, and whether the crime is Bailable, Non-Bailable, Cognizable, or Compoundable.
- Distinguish clearly between offenses (e.g., explain that PPC 324 is Attempted Murder with up to 10 years, whereas PPC 302 is Actual Murder with Death/Life imprisonment, and explain the punishment for the Hurt caused).
- **LEGAL STRATEGY & ROADMAPS:** If the user asks for advice on how to win a case, defend an offender, or what the possibility of winning is, DO NOT give generic bullet points about "strong evidence" or "witness credibility". You MUST provide a COMPLETE STRATEGIC ROADMAP. Break down exactly what specific evidence is needed (e.g., Medico-Legal Certificates, Crime Scene forensics, cross-examination strategies for Section 161 CrPC statements). Give them a step-by-step masterplan for prosecution or defense. Be brutally honest about the realities of Pakistani courts.
- Answer in plain, clear English. Use bullet points for readability.
- If the user asks about an attached FIR, summarize what the FIR is actually about based on the text provided in the history, and IGNORE the irrelevant retrieved laws.
- Get straight to the point."""

    llm_answer = generate_with_llm(prompt, history=request.history)

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
