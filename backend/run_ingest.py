import sys
import os
sys.path.insert(0, os.path.abspath('.'))

from app.services.ingestor import DataIngestor

print("Initializing Ingestor...")
ingestor = DataIngestor()

print("Scanning and Indexing case_law...")
results_cl = ingestor.scan_and_index(category="case_law")
print("Results:", results_cl)

print("Scanning and Indexing statutes...")
results_st = ingestor.scan_and_index(category="statutes")
print("Results:", results_st)
