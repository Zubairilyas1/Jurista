import json
from pathlib import Path

class OverruleGraph:
    def __init__(self, json_path: str = None):
        self.cases = {}
        if json_path is None:
            json_path = Path(__file__).parent.parent.parent / "data" / "overrule_graph.json"
        self.json_path = json_path
        self._load_from_json()

    def _load_from_json(self):
        if self.json_path.exists():
            try:
                with open(self.json_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    self.cases.update(data)
                print(f"?? Loaded {len(self.cases)} cases from {self.json_path}")
            except Exception as e:
                print(f"?? Failed to load overrule graph: {e}")
        else:
            print("?? No overrule graph JSON found ? using hardcoded fallback.")
            self._load_hardcoded()

    def _load_hardcoded(self):
        self.cases = {
            "PLD 2019 SC 445": {
                "status": "GOOD_LAW",
                "bench_type": "SC_FULL",
                "overruled_by": None,
                "note": "Bail is a rule and refusal is an exception."
            },
            "PLD 2021 SC 123": {
                "status": "GOOD_LAW",
                "bench_type": "SC_FULL",
                "overruled_by": None,
                "note": "Balance accused liberty against community interest."
            },
            "PLD 1990 SC 100": {
                "status": "OVERRULED",
                "bench_type": "SC_DIVISION",
                "overruled_by": "PLD 2019 SC 445",
                "note": "Old precedent, no longer valid."
            }
        }

    def get_case_status(self, citation: str):
        if citation in self.cases:
            return self.cases[citation]
        return {
            "status": "GOOD_LAW",
            "bench_type": "UNKNOWN",
            "overruled_by": None,
            "note": "?? UNTRACKED CITATION ? Please verify manually."
        }

    def is_citable(self, citation: str):
        case = self.get_case_status(citation)
        if case["status"] == "OVERRULED":
            return False, f"Overruled by {case['overruled_by']} ? do not cite."
        if case["status"] == "DISTINGUISHED":
            return True, "Valid but distinguished ? cite with caution."
        if case["bench_type"] == "UNKNOWN":
            return True, "Untracked ? verify independently."
        return True, "Good law."
