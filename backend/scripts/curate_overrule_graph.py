import json
from pathlib import Path
import chromadb
from collections import Counter

def main():
    # Connect to ChromaDB
    db_path = Path(__file__).parent.parent / "data" / "chroma_db"
    client = chromadb.PersistentClient(path=str(db_path))
    collection = client.get_collection("pakistani_law")

    # Get all case law chunks
    try:
        # ChromaDB's get() with where filter
        results = collection.get(
            where={"type": "case_law"},
            include=["metadatas"]
        )
    except Exception as e:
        print(f"Error fetching data: {e}")
        return

    if not results or not results['metadatas']:
        print("No case law chunks found.")
        return

    # Extract citations
    citations = []
    for meta in results['metadatas']:
        cit = meta.get('citation')
        if cit:
            citations.append(cit)

    # Count frequencies
    counter = Counter(citations)
    sorted_citations = counter.most_common()

    # Build graph entries
    graph = {}
    for cit, count in sorted_citations:
        graph[cit] = {
            "status": "GOOD_LAW",  # default
            "bench_type": "SC_FULL",  # placeholder, can be refined
            "overruled_by": None,
            "note": f"Cited {count} times ? verify manually."
        }

    # Write to JSON
    output_path = Path(__file__).parent.parent / "data" / "overrule_graph.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(graph, f, indent=2, ensure_ascii=False)

    print(f"? Overrule graph saved to {output_path}")
    print(f"   Total unique citations: {len(graph)}")

if __name__ == "__main__":
    main()
