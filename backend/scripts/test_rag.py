import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.core.rag_engine import RAGEngine

def test_query():
    rag = RAGEngine()
    query = "What is the limitation period for filing a suit for specific performance of a contract under the Limitation Act?"
    print(f"\n--- QUERY: {query} ---\n")
    results = rag.query(query, top_k=3)
    for i, r in enumerate(results):
        print(f"Result {i+1}:")
        print(f"Source: {r.get('source')} | Citation: {r.get('citation')}")
        print(f"Score: {r.get('score')}")
        print(f"Text: {r.get('text')[:300]}...\n")

if __name__ == "__main__":
    test_query()
