"""
CLI tool to manually trigger the data ingestor.
Run: python -m app.cli.ingest statutes
"""
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))
from app.services.ingestor import DataIngestor

if __name__ == "__main__":
    category = sys.argv[1] if len(sys.argv) > 1 else "statutes"
    ingestor = DataIngestor()
    results = ingestor.scan_and_index(category)
    print(f"\n? Done. {results['success']} files indexed.")
