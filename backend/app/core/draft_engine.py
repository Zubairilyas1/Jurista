print("LOADING draft_engine.py from:", __file__)
from time import strftime, localtime
from docx import Document
from docx.shared import Pt, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
from io import BytesIO

class DraftEngine:
    def __init__(self):
        self.templates = {
            "CRPC_497_BAIL": {
                "name": "Bail Petition (CrPC 497)",
                "court_format": "IN THE COURT OF {court_name}",
                "prayer_template": "It is, therefore, most respectfully prayed that this Honourable Court may graciously be pleased to: {prayer_points}"
            },
            "CPC_ORDER39_STAY": {
                "name": "Stay Petition (CPC Order 39)",
                "court_format": "IN THE COURT OF {court_name}",
                "prayer_template": "It is, therefore, most respectfully prayed that this Honourable Court may graciously be pleased to: {prayer_points}"
            },
            "ART199_WRIT": {
                "name": "Writ Petition (Article 199)",
                "court_format": "IN THE HIGH COURT OF {court_name}",
                "prayer_template": "It is, therefore, most respectfully prayed that this Honourable Court may graciously be pleased to: {prayer_points}"
            }
        }

    def generate_petition(self, data):
        petition_type = data.get("petition_type", "CRPC_497_BAIL")
        template = self.templates.get(petition_type, self.templates["CRPC_497_BAIL"])
        
        doc = Document()
        
        # 1. Court Header
        court_header = doc.add_heading(template["court_format"].format(court_name=data.get("court", "Supreme Court of Pakistan")), level=1)
        court_header.alignment = WD_ALIGN_PARAGRAPH.CENTER
        
        # 2. Case Number & Date (using time instead of datetime)
        doc.add_paragraph(f"Case No: {data.get('case_number', '______/2025')}")
        doc.add_paragraph(f"Date: {strftime('%B %d, %Y', localtime())}")
        doc.add_paragraph()
        
        # 3. Parties Block
        doc.add_heading("BETWEEN", level=2)
        doc.add_paragraph(f"Petitioner/Plaintiff: {data.get('petitioner', '______________________')}")
        doc.add_paragraph(f"     Versus")
        doc.add_paragraph(f"Respondent/Defendant: {data.get('respondent', '______________________')}")
        doc.add_paragraph()
        
        # 4. Facts
        doc.add_heading("FACTS", level=2)
        facts = data.get('facts', 'The petitioner states as follows:')
        facts = facts.replace('\n', '\n\n')
        doc.add_paragraph(facts)
        doc.add_paragraph()
        
        # 5. Legal Grounds
        doc.add_heading("LEGAL GROUNDS", level=2)
        doc.add_paragraph("1. That the actions of the respondent are contrary to law and violate the fundamental rights of the petitioner.")
        doc.add_paragraph("2. That there is no reasonable grounds to believe the petitioner has committed a non-bailable offence.")
        doc.add_paragraph("3. That the respondent has acted without jurisdiction and in excess of authority.")
        p = doc.add_paragraph("4. Reliance is placed upon the case of ")
        p.add_run("PLD 2019 SC 445").italic = True
        doc.add_paragraph()
        
        # 6. Prayer
        doc.add_heading("PRAYER", level=2)
        prayer_text = data.get('prayer', 'Grant bail to the petitioner, or pass any other order deemed fit.')
        prayer_points = prayer_text.replace('\n', '\n     - ')
        doc.add_paragraph(f"It is, therefore, most respectfully prayed that this Honourable Court may graciously be pleased to:\n     - {prayer_points}")
        
        # 7. Signature
        doc.add_paragraph()
        doc.add_paragraph()
        doc.add_paragraph("__________")
        doc.add_paragraph(f"Advocate for the {data.get('party_type', 'Petitioner')}")
        doc.add_paragraph(f"Bar License No: {data.get('bar_license_no', '________')}")
        
        # Save
        file_stream = BytesIO()
        doc.save(file_stream)
        file_stream.seek(0)
        return file_stream

