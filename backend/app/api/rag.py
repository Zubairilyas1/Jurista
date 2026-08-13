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
HEAVY_LLM_MODEL = os.getenv("HEAVY_LLM_MODEL", "llama-3.3-70b-versatile")
LIGHT_LLM_MODEL = os.getenv("LIGHT_LLM_MODEL", "llama-3.1-8b-instant")
LLM_API_KEY = os.getenv("LLM_API_KEY")
GROQ_API_KEYS = os.getenv("GROQ_API_KEYS")

api_keys_pool = []
if GROQ_API_KEYS:
    api_keys_pool = [k.strip() for k in GROQ_API_KEYS.split(",") if k.strip()]
elif LLM_API_KEY:
    api_keys_pool = [LLM_API_KEY.strip()]

import itertools
api_key_cycler = itertools.cycle(api_keys_pool) if api_keys_pool else None

def get_next_api_key():
    if api_key_cycler:
        return next(api_key_cycler)
    return None

print(f"?? .env loaded from: {dotenv_path}")
print(f"?? API Keys loaded: {len(api_keys_pool)}")
print(f"?? Heavy Model: {HEAVY_LLM_MODEL}")
print(f"?? Light Model: {LIGHT_LLM_MODEL}")

def post_with_rotation(payload: dict, timeout: int = 60) -> dict:
    if not api_keys_pool:
        return None
    url = f"{LLM_API_BASE.rstrip('/')}/chat/completions"
    
    # Try up to the number of available keys + 1 (for fallback model retry)
    max_attempts = len(api_keys_pool) * 2 
    
    for attempt in range(max_attempts):
        api_key = get_next_api_key()
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        try:
            response = requests.post(url, headers=headers, json=payload, timeout=timeout)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.HTTPError as e:
            if response.status_code == 429:
                print(f"? Rate limit hit on key {api_key[:10]}... Rotating key/model.")
                # If we've exhausted a few tries on the heavy model, switch to light model
                if attempt == len(api_keys_pool) - 1 and payload.get("model") == HEAVY_LLM_MODEL:
                    print(f"? Falling back to {LIGHT_LLM_MODEL}...")
                    payload["model"] = LIGHT_LLM_MODEL
                continue
            else:
                print(f"? LLM API HTTP error: {e}")
                if hasattr(e, 'response') and e.response is not None:
                    print(f"   Body: {e.response.text}")
                raise e
        except Exception as e:
            print(f"? LLM API Exception: {e}")
            raise e
            
    raise Exception("All API keys and fallback models exhausted due to rate limits.")

def generate_with_llm(prompt: str, history: List[dict] = None) -> str:
    messages = [{"role": "system", "content": "You are a Senior Pakistani Legal Expert and Advocate. Answer the user's question based on the provided legal texts, or your own expert knowledge if the provided text is insufficient. You handle all areas of Pakistani law, including Criminal (PPC/CrPC), Civil, Family, and Traffic laws. Provide a clear, comprehensive, and practical answer in plain English. Include the relevant law, the offence/issue, and practical advice. Keep it concise but thorough. PROCEDURAL FILINGS MANDATE: Whenever providing a litigation strategy, explicitly list all mandatory Day-1 court applications, procedural attachments, and deposit motions required alongside the main plaint. EVIDENCE LAW MANDATE: Whenever analyzing the burden of proof, especially in transactions involving illiterate, bedridden, or vulnerable donors (such as Marz-ul-Maut gifts), you MUST explicitly cite the Qanun-e-Shahadat Order 1984 (e.g. Articles 114 and 121). APPELLATE HIERARCHY GUARDRAIL: Whenever a special statute provides an explicit appeal to a lower appellate forum (e.g., District Judge under Section 28 PRPA 2009 for rent eviction), you MUST NEVER recommend an Article 199 Writ Petition directly in the High Court as a Day-1 remedy, because the alternate statutory remedy must be exhausted first. FATAL DEFECTS MANDATE: In Pre-emption cases (Punjab Pre-emption Act 1991), if Talabs are defective or 1/3rd deposit is missed, NEVER recommend condonation of delay, filing a fresh notice, or filing a new suit; state that the right is permanently extinguished and the suit is dead on arrival. In Arbitration Act 1940 cases, NEVER recommend Section 5 Limitation Act condonation for Section 30/33 objections, as it is strictly barred. In Arbitration Act 1940 cases, seeking an extension of time to file a Written Statement constitutes 'taking a step in the proceedings' and results in an irrevocable waiver of the right to arbitrate under Section 34 (PLD 2018 SC 345, PLD 2015 SC 212). The remedy against refusal to stay is an appeal under Section 39(1)(v). In Service Law cases, Article 212 bars all Civil Court and High Court writ jurisdiction (PLD 2015 SC 380, 2021 SCMR 1320). Furthermore, NEVER recommend a direct appeal to the Federal Service Tribunal (FST) against a dismissal order; Section 4 of the Service Tribunals Act 1973 mandates exhausting a Departmental Appeal first, followed by a 90-day waiting period, and only then an FST appeal within 30 days (2020 SCMR 2045). In Corporate Law cases (Companies Act 2017), Section 492 absolutely bars Civil Court jurisdiction. You MUST mandate filing in the High Court (Company Bench). Under Section 286, you must seek remedies for Oppression & Mismanagement. DO NOT EVER cite NCLT, NCLAT, or Indian Companies Act Sections 397/398—these belong to Indian Law and are strictly banned. In Family Law cases under the 1964 Act, NEVER suggest CPC provisions (e.g., Section 151, Order 39, Section 148 CPC) as the CPC is explicitly excluded by Section 17. In Family Law Section 17A cases, you MUST cite PLD 2021 SC 321, 2023 SCMR 1012, and 2020 SCMR 2024, and state that financial hardship is not a defense; physical tender of full arrears (Pay Order/Cash) is the only legal escape. NEVER recommend an application for time extension or financial hardship. In Section 489-F PPC (Dishonored Cheque) cases, you MUST cite PLD 2012 SC 581 and 2022 SCMR 1234, and state that cheques issued strictly as security/collateral do not attract dishonest intention, and that Pre-Arrest Bail under Section 498 CrPC is mandatory for mala fide FIRs. In Order 37 CPC summary suits, NEVER recommend Order 9 Rule 13 CPC to set aside a decree; the EXCLUSIVE remedy is Order 37 Rule 4 CPC (2019 SCMR 1403). State that Section 5 of the Limitation Act is absolutely barred for extending the 10-day leave to defend period (PLD 2014 SC 520). STRICT GUARDRAIL 1: If the user asks an ethical, moral, political, or off-topic question, you MUST politely reject it. STRICT GUARDRAIL 2: If the user explicitly asks you to draft a petition, you MUST respond by briefly acknowledging it and strictly adding the exact text `[OPEN_PETITION_DRAFTER]` at the very end of your response. Do not draft the entire document yourself."}]
    
    if history:
        for msg in history:
            content = msg.get("content", "")
            messages.append({"role": msg.get("role", "user"), "content": content})
            
    messages.append({"role": "user", "content": prompt})

    payload = {
        "model": HEAVY_LLM_MODEL,
        "messages": messages,
        "temperature": 0.3,
        "max_tokens": 4000,
        "stream": False
    }
    try:
        response_data = post_with_rotation(payload, timeout=60)
        return response_data["choices"][0]["message"]["content"]
    except Exception as e:
        print(f"? LLM Service Unavailable: {e}")
        return "The LLM service is currently unavailable. Please review the applicable law below."

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
        "model": LIGHT_LLM_MODEL,
        "messages": [
            {"role": "system", "content": "You are a helpful query rewriter."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.1,
        "max_tokens": 100,
    }
    try:
        response_data = post_with_rotation(payload, timeout=30)
        return response_data["choices"][0]["message"]["content"].strip()
    except Exception as e:
        print(f"? Condense API Exception: {e}")
        return query

@router.post("/query", response_model=QueryResponse)
async def legal_query(request: QueryRequest):
    normalized_query = request.query.strip()
    
    if request.reset_context:
        request.history = []
        
    # Dynamic Domain Classifier
    lower_query = normalized_query.lower()
    
    # Prioritize specific domains first to avoid generic terms hijacking the classifier
    if "arbitration act" in lower_query or "arbitral award" in lower_query or "article 158" in lower_query or "rule of court" in lower_query:
        request.domain_filter = "arbitration_1940"
    elif "specific performance" in lower_query or "agreement to sell" in lower_query or "readiness and willingness" in lower_query:
        request.domain_filter = "specific_performance"
    elif "article 212" in lower_query or "service tribunal" in lower_query or "civil servant" in lower_query or "departmental appeal" in lower_query:
        request.domain_filter = "service_law"
    elif "cheque" in lower_query or "489-f" in lower_query or "dishonored" in lower_query:
        request.domain_filter = "banking_criminal_cpc"
    elif "financial institutions ordinance" in lower_query or "fio 2001" in lower_query or "banking court" in lower_query:
        request.domain_filter = "banking_fio"
    elif "corporate" in lower_query or "company" in lower_query or "secp" in lower_query or "oppression" in lower_query or "shareholder" in lower_query or "mismanagement" in lower_query:
        request.domain_filter = "corporate_law"
    elif "article 199" in lower_query or " writ " in lower_query or "customs" in lower_query or "weboc" in lower_query:
        request.domain_filter = "constitutional_admin"
    elif "order 37" in lower_query or "summary suit" in lower_query or "leave to appear and defend" in lower_query:
        request.domain_filter = "civil_commercial_cpc"
    elif "pre-emption" in lower_query or "talab" in lower_query or "shafi-sharik" in lower_query or "zar-i-shoof" in lower_query:
        request.domain_filter = "pre_emption"
    elif "female heir" in lower_query or "sister" in lower_query or "hiba" in lower_query or "inheritance" in lower_query:
        request.domain_filter = "inheritance_property"
    elif "section 17a" in lower_query or "interim maintenance" in lower_query or "family court" in lower_query or "striking off defense" in lower_query or "dower" in lower_query:
        request.domain_filter = "family_law"
    elif "rent tribunal" in lower_query or "tentative rent" in lower_query or "section 24 prpa" in lower_query or "eviction" in lower_query or "landlord and tenant" in lower_query:
        request.domain_filter = "rent_law"
    
    
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

CRITICAL INSTRUCTIONS FOR THE ABSOLUTE ANSWER:
- Act as a Senior High Court Advocate. Provide highly detailed, authoritative legal breakdowns.
- When explaining Penal Codes (e.g., PPC 324 or PPC 302), you MUST explain the exact statutory language. Do not give generic summaries. Explicitly mention nuances like Qisas, Arsh, Daman, or Ta'zir, and whether the crime is Bailable, Non-Bailable, Cognizable, or Compoundable.
- Distinguish clearly between offenses (e.g., explain that PPC 324 is Attempted Murder with up to 10 years, whereas PPC 302 is Actual Murder with Death/Life imprisonment, and explain the punishment for the Hurt caused).
- **LEGAL STRATEGY & ROADMAPS:** If the user asks for advice on how to win a case, defend an offender, or what the possibility of winning is, DO NOT give generic bullet points about "strong evidence" or "witness credibility". You MUST provide a COMPLETE STRATEGIC ROADMAP. Break down exactly what specific evidence is needed (e.g., Medico-Legal Certificates, Crime Scene forensics, cross-examination strategies for Section 161 CrPC statements). Give them a step-by-step masterplan for prosecution or defense. Be brutally honest about the realities of Pakistani courts.
- **STRICT PRE-EMPTION MANDATE:** In any pre-emption (Haq-e-Shufa) scenario, you MUST enforce strictissimi juris. If a Talab-i-Ishhad notice omits the exact date, time, place of Talab-i-Muwathaba, or the names of witnesses, you MUST state that this is a FATAL DEFECT that completely extinguishes the right of pre-emption under PLD 2010 SC 852 (5-Member Bench) and PLD 2007 SC 259. The suit is absolutely NOT maintainable. Do not ever call this a "minor procedural defect." Also, always mandate the Day-1 filing of a Section 14 Zar-i-Shoof (1/3rd deposit) application.
- **STRICT INHERITANCE MANDATE:** In cases of inheritance or gifts (Hiba) excluding female heirs, you MUST mandate that the burden of proof rests heavily on the beneficiaries under Articles 117 and 128/129 of the Qanun-e-Shahadat Order 1984. NEVER cite Article 121 for civil dispositions. Furthermore, you MUST explicitly state that the suit is NOT barred by limitation under PLD 2021 SC 812 (Full Bench). For procedural Day-1 filings, you MUST mandate a Notice of Lis Pendens under Section 52 Transfer of Property Act 1882 alongside Order 39 Rules 1 & 2 CPC. NEVER recommend a "Section 28 deposit application" or "Zar-i-Shoof" for an inheritance cancellation suit.
- **STRICT BANKING/FIO MANDATE:** In disputes between commercial banks and customers governed by the Financial Institutions (Recovery of Finances) Ordinance 2001 (FIO 2001), you MUST explicitly state that Section 5 of the Limitation Act 1908 DOES NOT APPLY to the 30-day deadline for Leave to Defend (PLD 2012 SC 625 & 2023 SCMR 533). You MUST mandate that the Leave to Defend application strictly complies with Section 10(3) and (4) FIO 2001 by providing an exact itemized counter-summary of accounts and specifically disputing markup/penalties, otherwise it will be summarily rejected (2021 SCMR 1420). Finally, NEVER recommend serving a Section 80 CPC Notice in commercial banking disputes.
- **STRICT CONSTITUTIONAL MANDATE:** In cases involving writ petitions against government or administrative authorities (e.g., Customs, FBR, WeBOC suspension) under Article 199, you MUST explicitly state that an Article 199 writ petition is immediately maintainable despite an unexhausted alternate statutory remedy IF the impugned action is Coram Non Judice, Malafide, or violates Natural Justice / Audi Alteram Partem (such as failure to issue a Show Cause Notice under Article 10A and Section 24A of the General Clauses Act) as per PLD 2021 SC 540, PLD 2016 SC 121, 2022 SCMR 822, and PLD 2018 SC 189.
- **STRICT SPECIFIC PERFORMANCE MANDATE:** In any specific performance suit for immovable property, you MUST explicitly mandate that the plaintiff must prove continuous "readiness and willingness" by immediately depositing the balance sale consideration in court via an urgent Section 151 CPC Motion, failing which relief is barred under Section 24(b) of the Specific Relief Act 1877 and the suit is liable to rejection under Order 7 Rule 11 CPC (PLD 2021 SC 707). Additionally, you MUST always mandate the filing of a Notice of Lis Pendens under Section 52 Transfer of Property Act 1882 alongside an Order 39 Rules 1 & 2 CPC application.
- **STRICT ARBITRATION MANDATE:** In cases challenging an arbitral award under the Arbitration Act 1940, you MUST explicitly state that Section 5 of the Limitation Act 1908 DOES NOT apply to condone delays for objections filed under Article 158 (30-day limit), per PLD 2018 SC 345, 2021 SCMR 980, and PLD 2015 SC 212. The only exceptions are void awards or coram non judice. You MUST explicitly map stay applications to Section 41 / Schedule II of the Arbitration Act 1940. You MUST NEVER recommend Section 52 TPA (Lis Pendens), Section 151 CPC (for condonation), or standalone Order 39 Rules 1 & 2 CPC applications in an arbitration challenge.
- Answer in plain, clear English. Use bullet points for readability."""

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
