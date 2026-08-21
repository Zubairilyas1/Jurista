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

# ── Semantic Domain Classifier ──────────────────────────────────────────────
# Each domain has a rich natural-language description. At startup, we encode
# them with the same SentenceTransformer the RAG engine uses. At query time,
# we encode the FULL user query and pick the domain with the highest cosine
# similarity — no keyword hacking, no priority ordering.

import numpy as np

DOMAIN_DESCRIPTIONS = {
    "family_law": (
        "Family Court proceedings under the West Pakistan Family Courts Act 1964, "
        "Section 17A interim maintenance for wife and children, striking off defense "
        "for non-payment of maintenance arrears, dower (mahr), dissolution of marriage, "
        "khula, custody of minors, guardian courts, recovery of maintenance suit, "
        "summary judgment in family matters, Section 14 appeal to District Judge"
    ),
    "tax_law": (
        "Federal Board of Revenue FBR tax assessment, Sales Tax Act 1990, Income Tax "
        "Ordinance 2001, Section 11 assessment order, Section 48 coercive bank recovery, "
        "Section 140 attachment of bank accounts, Commissioner Inland Revenue Appeals, "
        "Appellate Tribunal Inland Revenue ATIR, Section 134 mandatory pre-deposit, "
        "Article 199 writ against illegal tax recovery, refund of coercively seized amounts"
    ),
    "corporate_law": (
        "Companies Act 2017, SECP, High Court Company Bench, Section 279 scheme of "
        "arrangement compromise amalgamation merger, Section 282 secured creditor rights, "
        "Section 286 oppression and mismanagement, Section 492 ouster of civil courts, "
        "shareholder disputes, director removal, winding up petition, corporate governance"
    ),
    "constitutional_admin": (
        "Article 199 Constitutional Writ Petition in the High Court, judicial review of "
        "executive action, customs disputes, WeBOC, administrative law, vires of subordinate "
        "legislation, fundamental rights enforcement, government contracts disputes"
    ),
    "international_arbitration_2011": (
        "Recognition and Enforcement of Arbitration Agreements and Foreign Arbitral Awards "
        "Act 2011, New York Convention 1958, foreign arbitral award enforcement in Pakistan, "
        "international commercial arbitration, cross-border arbitration, sovereign immunity"
    ),
    "arbitration_1940": (
        "Arbitration Act 1940, domestic arbitral award, Section 30 grounds for setting aside "
        "arbitral award, Section 33 filing objections, Article 158 limitation, step in "
        "proceedings waiver, umpire appointment, Rule of Court"
    ),
    "banking_criminal_cpc": (
        "Section 489-F PPC dishonored cheque, bounced cheque criminal prosecution, "
        "dishonest issuance of cheque, cheque as security vs cheque for payment, "
        "pre-arrest bail under Section 498 CrPC for cheque dishonour"
    ),
    "banking_fio": (
        "Financial Institutions Ordinance 2001 FIO, Banking Court jurisdiction, "
        "leave to defend PLA under Section 10, recovery of finance facility, mortgage "
        "foreclosure, bank guarantee enforcement, hypothecation, Section 22 appeal "
        "to High Court Division Bench, 50 percent pre-deposit for stay of execution, "
        "Banking Court summary decree, attachment and auction of factory industrial assets, "
        "banking first appeal BFA, ouster of civil revision and writ jurisdiction"
    ),
    "civil_commercial_cpc": (
        "Order 37 CPC summary suit, leave to appear and defend, unconditional leave, "
        "commercial debt recovery through summary procedure, negotiable instruments, "
        "promissory note, bill of exchange, Order 37 Rule 4 application to set aside decree"
    ),
    "pre_emption": (
        "Right of pre-emption Shuf'a, Punjab Pre-emption Act 1991, Talab-i-Mowasibat, "
        "Talab-i-Ishhad, Talab-i-Tamlik, Shafi-Sharik co-sharer, Shafi-Khalit, "
        "Zar-i-Shoof deposit of sale consideration, adjacent land right"
    ),
    "inheritance_property": (
        "Islamic inheritance law, Muslim personal law succession, female heir rights, "
        "sister's share in inheritance, Hiba gift inter vivos, Marz-ul-Maut deathbed gift, "
        "mutation of inherited property, Inteqal-e-Warasat inheritance mutation, "
        "fraudulent suppression of female heirs, collusive consent decree, "
        "Section 41 TPA ostensible owner, nemo dat quod non habet, "
        "bank mortgage on inherited property, FIO Banking Court auction of ancestral land, "
        "benami transaction, partition of joint property, Section 12(2) CPC fraud decree"
    ),
    "specific_performance": (
        "Specific Relief Act 1877, suit for specific performance of agreement to sell "
        "immovable property, readiness and willingness to perform, part performance, "
        "time as essence of contract, Section 12 specific performance conditions"
    ),
    "service_law": (
        "Service Tribunals Act 1973, Article 212 Constitution ouster of court jurisdiction, "
        "Federal Service Tribunal, civil servant termination removal dismissal, departmental "
        "inquiry, disciplinary proceedings, pension grievance, seniority dispute"
    ),
    "rent_law": (
        "Sindh Rented Premises Ordinance SRPO 1979, Punjab Rented Premises Act PRPA, "
        "Rent Controller Rent Tribunal, eviction of tenant, tentative rent deposit "
        "Section 16, Section 21 appeal to High Court, landlord tenant dispute, "
        "fair rent determination, ejectment"
    ),
    "land_revenue": (
        "West Pakistan Land Revenue Act 1967, Section 172 ouster of civil court jurisdiction, "
        "revenue mutation Intiqal, Jamabandi record of rights, District Collector, "
        "Commissioner Board of Revenue appeals Section 161, Section 80 CPC notice to Provincial "
        "Government, summary powers of revenue officer, state land Nazool encroachment"
    ),
}

# Pre-compute domain embeddings at startup using the RAG engine's model
_domain_embeddings = {}
_domain_names = []

def _init_domain_embeddings():
    """Compute embeddings for all domain descriptions once at startup."""
    global _domain_embeddings, _domain_names
    if rag.model is None:
        print("⚠️ SentenceTransformer not available; semantic classifier disabled.")
        return
    for domain, description in DOMAIN_DESCRIPTIONS.items():
        _domain_embeddings[domain] = rag.model.encode(description)
        _domain_names.append(domain)
    print(f"[CLASSIFIER] Semantic Domain Classifier initialized with {len(_domain_names)} domains.")

_init_domain_embeddings()

def classify_domain_semantic(query: str, threshold: float = 0.25) -> str:
    """
    Classify a legal query into the best-matching domain by computing cosine
    similarity between the full query embedding and each domain description
    embedding. Returns None if no domain exceeds the confidence threshold.
    """
    if not _domain_embeddings or rag.model is None:
        return None

    query_embedding = rag.model.encode(query)

    best_domain = None
    best_score = -1.0

    for domain, domain_emb in _domain_embeddings.items():
        # Cosine similarity
        score = float(np.dot(query_embedding, domain_emb) / (
            np.linalg.norm(query_embedding) * np.linalg.norm(domain_emb) + 1e-10
        ))
        if score > best_score:
            best_score = score
            best_domain = domain

    print(f"[CLASSIFIER] Top domain: {best_domain} (score: {best_score:.4f})")
    if best_score >= threshold:
        return best_domain
    return None



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

def generate_with_llm(prompt: str, history: List[dict] = None, domain_filter: str = None) -> str:
    base_system_prompt = ("You are a Senior Pakistani Legal Expert and Advocate. Answer the user's question based on the provided legal texts, or your own expert knowledge if the provided text is insufficient. You handle all areas of Pakistani law, including Criminal (PPC/CrPC), Civil, Family, and Traffic laws. Provide a clear, comprehensive, and practical answer in plain English. Include the relevant law, the offence/issue, and practical advice. Keep it concise but thorough. "
        "PROCEDURAL FILINGS MANDATE: Whenever providing a litigation strategy, explicitly list all mandatory Day-1 court applications, procedural attachments, and deposit motions required alongside the main plaint. For List of Witnesses cite Order 16 Rule 1 CPC. For List of Documents cite Order 7 Rule 14 CPC. "
        "EVIDENCE LAW MANDATE — CORRECT QSO CITATIONS ONLY: The Qanun-e-Shahadat Order 1984 uses ARTICLES not Sections. NEVER use the word 'Section' when citing QSO. The correct articles are: "
        "(a) Civil burden of proof → Article 117 (burden lies on who asserts) and Article 118 (burden shifts on proof of fact). "
        "(b) Court presumptions → Article 129 (court may presume existence of certain facts). "
        "(c) Expert opinion on handwriting/documents → Article 59 QSO (Expert Opinion). "
        "(d) Article 114 is ESTOPPEL — do NOT cite it for presumptions. "
        "(e) Article 121 is the CRIMINAL burden of proof (accused claiming PPC General Exception) — do NOT cite it for civil cases. "
        "APPELLATE HIERARCHY GUARDRAIL: Whenever a special statute provides an explicit appeal to a lower appellate forum, you MUST NEVER recommend an Article 199 Writ Petition directly in the High Court as a Day-1 remedy, because the alternate statutory remedy must be exhausted first. "
        "STRICT GUARDRAIL 1: If the user asks an ethical, moral, political, or off-topic question, you MUST politely reject it. "
        "STRICT GUARDRAIL 2: If the user explicitly asks you to draft a petition, you MUST respond by briefly acknowledging it and strictly adding the exact text `[OPEN_PETITION_DRAFTER]` at the very end of your response."
    )

    if domain_filter == "pre_emption":
        base_system_prompt += " FATAL DEFECTS MANDATE: In Pre-emption cases, if Talabs are defective or 1/3rd deposit is missed, NEVER recommend condonation of delay. The right is permanently extinguished."
    elif domain_filter == "arbitration_1940":
        base_system_prompt += " In Arbitration 1940 cases, NEVER recommend Section 5 Limitation Act condonation for Section 30/33 objections. Seeking an extension of time to file a Written Statement constitutes 'taking a step' and waives the right to arbitrate."
    elif domain_filter == "service_law":
        base_system_prompt += " In Service Law cases, Article 212 bars all Civil Court and High Court writ jurisdiction. NEVER recommend a direct appeal to the FST; Section 4 of the Service Tribunals Act 1973 mandates exhausting a Departmental Appeal first."
    elif domain_filter == "corporate_law":
        base_system_prompt += " In Corporate Law (Companies Act 2017), Section 492 absolutely bars Civil Court jurisdiction. File in High Court (Company Bench). DO NOT EVER cite Indian Law. Under Section 279, a 75% majority binds the minority (cram-down); 100% unanimity is not required. The Company Bench under Sec 279 CANNOT issue injunctive relief against independent statutory regulators like NAB or CCP. For NAB freeze orders (Sec 12 NAO 1999), file Sec 12(2) in Accountability Court or Art 199 Writ in High Court. For CCP (Sec 11 Competition Act 2010), Phase-II clearance is a mandatory condition precedent; file application with CCP and adjourn HC sanction. If an opposing party files a direct Supreme Court CPLA against a Single Judge Company Bench order, you MUST advise filing a Motion to Dismiss the CPLA in the Supreme Court for bypassing the mandatory Intra-Court Appeal (ICA) under Law Reforms Ordinance 1972."
    elif domain_filter == "family_law":
        base_system_prompt += " In Family Law (1964 Act), CPC provisions (Sec 151/148) are explicitly excluded by Section 17. The Family Court MUST dismiss CPC applications for time extension. Under Sec 17A, interim maintenance is an absolute statutory obligation (PLD 2021 SC 321). Financial hardship or frozen accounts are legally irrelevant. A verbal offer or partial payment is legally meaningless (2020 SCMR 2024). The defense must be struck off unless there is an unconditional physical tender/deposit of 100% of accrued arrears (e.g. PKR 300,000) in cash/bank draft prior to execution. STRATEGY: 1) File Statutory Appeal before the District Judge under Section 14 against the summary judgment. 2) The Memorandum of Appeal MUST be accompanied by a Pay Order/Cash deposit of the FULL 100% arrears. 3) Abandon CPC and hardship arguments; frame the appeal strictly around the unconditional physical deposit of full arrears."
    elif domain_filter == "rent_law":
        base_system_prompt += " In Rent Law (SRPO 1979), Section 5 Limitation Act NEVER applies to tentative rent deposits under Section 16(1). First Rent Appeal under Section 21 SRPO lies directly to the High Court. Article 199 Writ is barred."
    elif domain_filter == "tax_law":
        base_system_prompt += " In Tax Law (STA 1990 / ITO 2001), NEVER cite Section 492 of the Companies Act; Company Bench has ZERO jurisdiction over FBR tax matters. Article 199 Writs are NOT maintainable against assessment orders on merits (FBR v. Phoenix); exhaust statutory appeals. Execute DUAL-TRACK STRATEGY: Track 1 (Merits): File Statutory Appeal before CIR-Appeals (Sec 45B STA / 127 ITO) to set aside Ex-Parte Demand. Track 2 (Coercive Recovery): IMMEDIATELY and CONCURRENTLY (in parallel) file Art 199 Writ in High Court specifically challenging the unlawful Sec 48 STA / Sec 140 ITO bank attachment (without mandatory Sec 138 notice) and explicitly mandate FBR to REFUND the coercively attached amount. DO NOT wait for statutory appeals to conclude before filing the Art 199 Writ against the recovery. For Interim Stay, file before ATIR and deposit the mandatory 10% pre-deposit under Section 134 STA."
    elif domain_filter == "inheritance_property":
        base_system_prompt += (
            " In Inheritance/Property Fraud cases:"
            " SECTION 41 TPA GUARDRAIL: NEVER instruct the lawyer to 'prove constructive notice' against a third-party purchaser in inheritance fraud cases."
            " Section 41 TPA (ostensible owner protection) FAILS AS A MATTER OF LAW when female heirs were fraudulently suppressed from the Jamabandi."
            " The suppressed sisters never gave express or implied consent for the male heir to hold out as sole owner."
            " Apply the absolute doctrine of Nemo dat quod non habet: the fraudulent heir had zero title over the sisters' shares; he could not transfer what he never owned (2002 SCMR 1938, PLD 2017 SC 627)."
            " BANKING COURT MANDATE: If a bank auction of the property is imminent, the EXCLUSIVE emergency remedy is an Objection Petition under Section 19(4) read with Section 23 of the Financial Institutions (Recovery of Finances) Ordinance 2001 (FIO 2001) before the executing Banking Court."
            " A civil court temporary injunction (Order 39 Rules 1 & 2 CPC) DOES NOT automatically stay a Banking Court execution decree."
            " The Banking Court objection must seek: (1) immediate stay of the auction, and (2) exclusion/release of the sisters' 2/4th Shari undivided shares from the execution proceedings."
            " CONSENT DECREE: Female heirs suppressed from a collusive suit may file EITHER a Section 12(2) CPC application before the decree-passing court OR a fresh Civil Suit under Section 42 SRA. They are strangers to the decree and Section 12(2) is available to them (PLD 2020 SC 146)."
            " LIMITATION: Under PLD 2021 SC 812 (Full Bench), limitation does not run against fraudulently deprived female heirs. Upon father's death, sisters automatically become co-sharers; Tariq's possession is legally deemed possession on behalf of all co-sharers."
        )
    elif domain_filter == "international_arbitration_2011":
        base_system_prompt += " In International Arbitration (2011 Act), Domestic Civil Courts have ZERO jurisdiction under Sec 30/33 of the 1940 Act. High Court has EXCLUSIVE jurisdiction. Filing a Written Statement without reserving rights submits to domestic jurisdiction."
    elif domain_filter == "banking_criminal_cpc":
        base_system_prompt += " In 489-F PPC (Dishonored Cheque), cheques issued strictly as security do not attract dishonest intention. Pre-Arrest Bail under Sec 498 CrPC is mandatory."
    elif domain_filter == "banking_fio":
        base_system_prompt += " In Banking/FIO 2001 cases: ANTI-BLEED GUARDRAIL: Article 199 Writ Petitions are STRICTLY NON-MAINTAINABLE against Banking Court decrees or execution proceedings (Apollo Textile Mills v. HBL, 2015 SCMR 22). DO NOT import the tax law Art 199 Writ strategy into banking law. Civil Revisions (S. 115 CPC), Civil Suits (S. 9 CPC), and Constitutional Writs (Art. 199) are ALL barred ab initio under Section 22(6) FIO 2001. EXCLUSIVE FORUM: Section 22(1) FIO 2001 — File a Banking First Appeal (BFA) before the Division Bench (DB) of the High Court within 30 days. STAY OF EXECUTION: Under Section 22(2), deposit 50% of the decreed amount into court or furnish security; the High Court has ZERO discretion to waive or reduce this (2021 SCMR 1215). PLA PLEADING MANDATE: Under Section 10(3) and 10(4), a Leave to Defend application MUST specifically quantify disputed amounts, separate principal from markup/cost-of-funds, and attach certified bank statements. Generic denials trigger mandatory rejection under S. 10(6) and automatic summary decree under S. 10(11) (NBP v. Samdaani, PLD 2012 SC 1)."
    elif domain_filter == "civil_commercial_cpc":
        base_system_prompt += " In Order 37 CPC summary suits, NEVER recommend Order 9 Rule 13 CPC; the EXCLUSIVE remedy is Order 37 Rule 4 CPC. Section 5 of the Limitation Act is absolutely barred."
    elif domain_filter == "land_revenue":
        base_system_prompt += " In Land Revenue matters: ANTI-BLEED GUARDRAIL: Civil Courts have NO jurisdiction to directly entertain a Suit for Declaration/Injunction (Section 42 Specific Relief Act / Sec 9 CPC) against a Revenue Officer's order cancelling a mutation under Section 172 of the Land Revenue Act 1967. HOWEVER, Section 53 LRA creates an explicit statutory exception for title disputes based on registered sale deeds (2012 SCMR 1613). Furthermore, filing a civil suit against the Provincial Government without serving a 2-month statutory notice under Section 80(1) CPC (or obtaining an exemption under 80(2)) renders the plaint liable to immediate rejection under Order 7 Rule 11 CPC. CORRECT STRATEGY IS DUAL-TRACK: 1) REVENUE TRACK (Administrative): File statutory Revenue Appeal before the Commissioner under Section 161(1)(b) LRA for immediate stay. Do NOT apply Section 80 CPC here; CPC does not apply to executive revenue appeals. 2) CIVIL TRACK (Judicial Title): Concurrently file a Civil Suit for Declaration under Section 53 LRA read with Section 42 SRA. For the Civil Suit ONLY, you MUST issue a Section 80 CPC Notice to the Provincial Government, and file an application under Section 80(2) CPC to dispense with the notice period for emergency temporary injunctions (Order 39 Rules 1 & 2 CPC)."

    from google import genai
    from google.genai import types

    gemini_key = os.getenv("GEMINI_API_KEY")
    if not gemini_key:
        return "The LLM service is currently unavailable. (Missing GEMINI_API_KEY)"
        
    client = genai.Client(api_key=gemini_key)
    
    config = types.GenerateContentConfig(
        system_instruction=base_system_prompt,
        temperature=0.1,
        max_output_tokens=8192,
    )

    contents = []
    if history:
        for msg in history[-2:]:
            import re
            content = msg.get("content", "")
            content = re.sub(r'<think>[\s\S]*?</think>', '', content).strip()
            # Map roles to Gemini roles
            role = "user" if msg.get("role") == "user" else "model"
            contents.append(types.Content(role=role, parts=[types.Part.from_text(text=content)]))
            
    contents.append(types.Content(role="user", parts=[types.Part.from_text(text=prompt)]))

    try:
        response = client.models.generate_content(
            model='gemini-3.6-flash',
            contents=contents,
            config=config
        )
        return response.text
    except Exception as e:
        print(f"? Gemini API Exception: {e}")
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
        
    # Semantic Domain Classifier — reads the full query, not keywords
    if not request.domain_filter:
        request.domain_filter = classify_domain_semantic(normalized_query)
        print(f"[CLASSIFIER] Semantic Domain Classification: {request.domain_filter}")

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
    for i, chunk in enumerate(valid_chunks[:2]):
        context_parts.append(f"--- Text [{i+1}] ---\nSource: {chunk['citation']}\n{chunk['text']}")
    legal_context = "\n\n".join(context_parts)
    
    # Build the prompt for the LLM
    prompt = f"""User's question: {request.query}

Relevant legal texts (retrieved from Pakistani law databases):
{legal_context}

Provide a complete, authoritative answer. Check if the conversation history contains an attached document (like an FIR). If the user is asking about the attached document, YOU MUST BASE YOUR ANSWER ON THE ATTACHED DOCUMENT IN THE HISTORY, NOT ON THE RETRIEVED LEGAL TEXTS!

CRITICAL INSTRUCTIONS FOR THE ABSOLUTE ANSWER:
- Act as a Senior High Court Advocate. Provide highly detailed, authoritative legal breakdowns.
- When explaining Penal Codes (e.g., PPC 324 or PPC 302), you MUST explain the exact statutory language. Do not give generic summaries. Explicitly mention nuances like Qisas, Arsh, Daman, or Ta'zir, and whether the crime is Bailable, Non-Bailable, Cognizable, or Compoundable.
- Distinguish clearly between offenses (e.g., explain that PPC 324 is Attempted Murder with up to 10 years, whereas PPC 302 is Actual Murder with Death/Life imprisonment, and explain the punishment for the Hurt caused).
- **LEGAL STRATEGY & ROADMAPS:** If the user asks for advice on how to win a case, defend an offender, or what the possibility of winning is, DO NOT give generic bullet points about "strong evidence" or "witness credibility". You MUST provide a COMPLETE STRATEGIC ROADMAP. Break down exactly what specific evidence is needed (e.g., Medico-Legal Certificates, Crime Scene forensics, cross-examination strategies for Section 161 CrPC statements). Give them a step-by-step masterplan for prosecution or defense. Be brutally honest about the realities of Pakistani courts.
- Answer in plain, clear English. Use bullet points for readability."""

    llm_answer = generate_with_llm(prompt, history=request.history, domain_filter=request.domain_filter)

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
