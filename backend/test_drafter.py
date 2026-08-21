import asyncio
import json
import os
from dotenv import load_dotenv
load_dotenv()
from app.api.drafter import LLMDraftRequest, generate_draft_json_endpoint

scenario_4_text = """My client is a co-sharer (Shafi-i-Shrik) in an agricultural estate in District Multan, Punjab. A co-owner sold 15 Kanals of joint land to an outsider via a Registered Sale Deed dated January 10, 2024, without offering it to my client first. My client learned of this sale on March 1, 2024, at 2:00 PM while sitting at a local Dera when a village elder mentioned it. My client immediately declared his intention to pre-empt the land (Talab-i-Muwathaba) in front of two witnesses present at the Dera.
On March 7, 2024, my client sent a written notice of Talab-i-Ishhad via Registered Post with Acknowledgement Due (A.D.) to the buyer, attested by the two witnesses. On April 15, 2024, my client filed a Suit for Pre-emption in the Civil Court."""

async def test():
    req = LLMDraftRequest(document_type="Pre-emption Plaint", context_text=scenario_4_text)
    print("Sending request to LLM Drafter...")
    res = await generate_draft_json_endpoint(req)
    print(json.dumps(res, indent=2))

if __name__ == "__main__":
    asyncio.run(test())
