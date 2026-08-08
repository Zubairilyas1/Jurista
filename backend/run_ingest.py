import sys
import os
sys.path.insert(0, os.path.abspath('.'))

from app.services.ingestor import DataIngestor

print("Initializing Ingestor...")
ingestor = DataIngestor()
print("Scanning and Indexing vehicle statutes...")
results = ingestor.scan_and_index(category="vehicle_statutes")
print("Results:", results)
