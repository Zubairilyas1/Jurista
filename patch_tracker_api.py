import re

file_path = r"d:\Projects\Future\Jurista\backend\app\api\tracker.py"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

new_endpoint = """
class ManualCase(BaseModel):
    case_number: str
    parties: str
    court: str
    judge: str = "Unknown"
    hearing_date: str

@router.post("/add")
async def add_manual_case(case_data: ManualCase, db: Session = Depends(get_db)):
    try:
        data_dict = {
            "case_number": case_data.case_number,
            "parties": case_data.parties,
            "court": case_data.court,
            "judge": case_data.judge,
            "hearing_date": case_data.hearing_date
        }
        deadline = tracker.compute_deadline(case_data.hearing_date)
        tracker.store_case(db, data_dict, deadline)
        return {"status": "success", "message": f"Case {case_data.case_number} added successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
"""

if "class ManualCase" not in content:
    content = content + "\n" + new_endpoint

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Patched tracker.py to add manual case insertion")
