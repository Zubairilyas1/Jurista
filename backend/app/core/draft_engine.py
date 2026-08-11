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


    def generate_petition_html(self, data):
        petition_type = data.get("petition_type", "CRPC_497_BAIL")
        language = data.get("language", "english")
        
        court_name = data.get("court", "High Court")
        case_no = data.get("case_number", "______/2026")
        
        from time import strftime, localtime
        date_str = strftime('%B %d, %Y', localtime())
        
        petitioner = data.get("petitioner", "______________________")
        respondent = data.get("respondent", "______________________")
        
        facts = data.get("facts", "The petitioner states as follows:")
        facts_html = "<br/>".join(facts.split("\\n"))
        
        prayer = data.get("prayer", "Grant relief as prayed.")
        prayer_html = "<br/>- ".join(prayer.split("\\n"))
        
        party_type = data.get("party_type", "Petitioner")
        bar_no = data.get("bar_license_no", "________")
        
        # Bilingual Headings
        between_text = "BETWEEN / درمیان" if language == "bilingual" else "BETWEEN"
        versus_text = "Versus / بنام" if language == "bilingual" else "Versus"
        facts_heading = "FACTS / حقائق" if language == "bilingual" else "FACTS"
        legal_heading = "LEGAL GROUNDS / قانونی وجوہات" if language == "bilingual" else "LEGAL GROUNDS"
        prayer_heading = "PRAYER / استدعا" if language == "bilingual" else "PRAYER"
        
        html = '''
        <div style="font-family: 'Times New Roman', serif; max-width: 800px; margin: 0 auto; line-height: 1.6;">
            <h1 style="text-align: center; text-decoration: underline; font-size: 24px;">IN THE COURT OF __COURT_NAME__</h1>
            
            <p><strong>Case No:</strong> __CASE_NO__</p>
            <p><strong>Date:</strong> __DATE__</p>
            
            <h2 style="text-align: center; font-size: 18px;">__BETWEEN_TEXT__</h2>
            <p><strong>Petitioner/Plaintiff:</strong> <span style="font-family: 'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif; font-size: 18px;" dir="rtl">__PETITIONER__</span></p>
            <p style="text-align: center;"><strong>__VERSUS_TEXT__</strong></p>
            <p><strong>Respondent/Defendant:</strong> <span style="font-family: 'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif; font-size: 18px;" dir="rtl">__RESPONDENT__</span></p>
            
            <h2 style="text-decoration: underline; font-size: 18px;">__FACTS_HEADING__</h2>
            <div style="font-family: 'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif; font-size: 18px; text-align: right;" dir="rtl">
                __FACTS_HTML__
            </div>
            
            <h2 style="text-decoration: underline; font-size: 18px; margin-top: 20px;">__LEGAL_HEADING__</h2>
            <ol>
                <li>That the actions of the respondent are contrary to law and violate the fundamental rights of the petitioner.</li>
                <li>That there is no reasonable grounds to believe the petitioner has committed a non-bailable offence.</li>
                <li>That the respondent has acted without jurisdiction and in excess of authority.</li>
                <li>Reliance is placed upon the case of <em>PLD 2019 SC 445</em></li>
            </ol>
            
            <h2 style="text-decoration: underline; font-size: 18px; margin-top: 20px;">__PRAYER_HEADING__</h2>
            <p>It is, therefore, most respectfully prayed that this Honourable Court may graciously be pleased to:</p>
            <p style="margin-left: 20px;">- __PRAYER_HTML__</p>
            
            <br/><br/><br/>
            <p style="text-align: right;">__________________________</p>
            <p style="text-align: right;">Advocate for the __PARTY_TYPE__</p>
            <p style="text-align: right;">Bar License No: __BAR_NO__</p>
        </div>
        '''
        
        # Replace variables
        html = html.replace("__COURT_NAME__", court_name)
        html = html.replace("__CASE_NO__", case_no)
        html = html.replace("__DATE__", date_str)
        html = html.replace("__BETWEEN_TEXT__", between_text)
        html = html.replace("__PETITIONER__", petitioner)
        html = html.replace("__VERSUS_TEXT__", versus_text)
        html = html.replace("__RESPONDENT__", respondent)
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


    def generate_petition_html(self, data):
        petition_type = data.get("petition_type", "CRPC_497_BAIL")
        language = data.get("language", "english")
        
        court_name = data.get("court", "High Court")
        case_no = data.get("case_number", "______/2026")
        
        from time import strftime, localtime
        date_str = strftime('%B %d, %Y', localtime())
        
        petitioner = data.get("petitioner", "______________________")
        respondent = data.get("respondent", "______________________")
        
        facts = data.get("facts", "The petitioner states as follows:")
        facts_html = "<br/>".join(facts.split("\\n"))
        
        prayer = data.get("prayer", "Grant relief as prayed.")
        prayer_html = "<br/>- ".join(prayer.split("\\n"))
        
        party_type = data.get("party_type", "Petitioner")
        bar_no = data.get("bar_license_no", "________")
        
        # Bilingual Headings
        between_text = "BETWEEN / درمیان" if language == "bilingual" else "BETWEEN"
        versus_text = "Versus / بنام" if language == "bilingual" else "Versus"
        facts_heading = "FACTS / حقائق" if language == "bilingual" else "FACTS"
        legal_heading = "LEGAL GROUNDS / قانونی وجوہات" if language == "bilingual" else "LEGAL GROUNDS"
        prayer_heading = "PRAYER / استدعا" if language == "bilingual" else "PRAYER"
        
        html = '''
        <div style="font-family: 'Times New Roman', serif; max-width: 800px; margin: 0 auto; line-height: 1.6;">
            <h1 style="text-align: center; text-decoration: underline; font-size: 24px;">IN THE COURT OF __COURT_NAME__</h1>
            
            <p><strong>Case No:</strong> __CASE_NO__</p>
            <p><strong>Date:</strong> __DATE__</p>
            
            <h2 style="text-align: center; font-size: 18px;">__BETWEEN_TEXT__</h2>
            <p><strong>Petitioner/Plaintiff:</strong> <span style="font-family: 'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif; font-size: 18px;" dir="rtl">__PETITIONER__</span></p>
            <p style="text-align: center;"><strong>__VERSUS_TEXT__</strong></p>
            <p><strong>Respondent/Defendant:</strong> <span style="font-family: 'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif; font-size: 18px;" dir="rtl">__RESPONDENT__</span></p>
            
            <h2 style="text-decoration: underline; font-size: 18px;">__FACTS_HEADING__</h2>
            <div style="font-family: 'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif; font-size: 18px; text-align: right;" dir="rtl">
                __FACTS_HTML__
            </div>
            
            <h2 style="text-decoration: underline; font-size: 18px; margin-top: 20px;">__LEGAL_HEADING__</h2>
            <ol>
                <li>That the actions of the respondent are contrary to law and violate the fundamental rights of the petitioner.</li>
                <li>That there is no reasonable grounds to believe the petitioner has committed a non-bailable offence.</li>
                <li>That the respondent has acted without jurisdiction and in excess of authority.</li>
                <li>Reliance is placed upon the case of <em>PLD 2019 SC 445</em></li>
            </ol>
            
            <h2 style="text-decoration: underline; font-size: 18px; margin-top: 20px;">__PRAYER_HEADING__</h2>
            <p>It is, therefore, most respectfully prayed that this Honourable Court may graciously be pleased to:</p>
            <p style="margin-left: 20px;">- __PRAYER_HTML__</p>
            
            <br/><br/><br/>
            <p style="text-align: right;">__________________________</p>
            <p style="text-align: right;">Advocate for the __PARTY_TYPE__</p>
            <p style="text-align: right;">Bar License No: __BAR_NO__</p>
        </div>
        '''
        
        # Replace variables
        html = html.replace("__COURT_NAME__", court_name)
        html = html.replace("__CASE_NO__", case_no)
        html = html.replace("__DATE__", date_str)
        html = html.replace("__BETWEEN_TEXT__", between_text)
        html = html.replace("__PETITIONER__", petitioner)
        html = html.replace("__VERSUS_TEXT__", versus_text)
        html = html.replace("__RESPONDENT__", respondent)
        html = html.replace("__FACTS_HEADING__", facts_heading)
        html = html.replace("__FACTS_HTML__", facts_html)
        html = html.replace("__LEGAL_HEADING__", legal_heading)
        html = html.replace("__PRAYER_HEADING__", prayer_heading)
        html = html.replace("__PRAYER_HTML__", prayer_html)
        html = html.replace("__PARTY_TYPE__", party_type)
        html = html.replace("__BAR_NO__", bar_no)
        
        return html

    def generate_draft_json(self, context_text: str, document_type: str) -> dict:
        import os
        import json
        from groq import Groq
        
        api_key = os.environ.get("LLM_API_KEY", "")
        if not api_key:
            raise Exception("LLM_API_KEY not found in environment.")
            
        client = Groq(api_key=api_key)
        
        doc_specific_instructions = ""
        if document_type == "Pre-emption Plaint":
            doc_specific_instructions = "STRICT PRE-EMPTION REQUIREMENT: You MUST explicitly aver the 5 Talab-i-Muwathaba particulars in the facts (Date of knowledge, Time of knowledge, Place of knowledge, Source of information/Informer, and Names of two witnesses present). Also explicitly mention Talab-i-Ishhad (Registered Post A.D. within 14 days)."
        elif document_type == "Order 39 Stay Application":
            doc_specific_instructions = "STRICT STAY INJUNCTION REQUIREMENT: You MUST explicitly plead the three ingredients: (1) Prima facie case, (2) Balance of convenience, and (3) Irreparable loss."
        elif document_type == "Section 28 Deposit Application":
            doc_specific_instructions = "STRICT PRE-EMPTION REQUIREMENT: This is an application under Section 28 of the Punjab Pre-emption Act 1991 seeking permission to deposit 1/3rd of the sale price."
            
        system_prompt = f"""You are a Senior Pakistani Legal Draftsman.
Your job is to generate formal, ready-to-file legal documents for Pakistani Civil Courts.
Format: Use formal archaic legal English common in Pakistan (e.g., "Respectfully Sheweth", "The plaintiff humbly submits").
Document Type Requested: {document_type}

{doc_specific_instructions}

You must return EXACTLY and ONLY a valid JSON object matching this schema:
{{
  "court_name": "string (e.g. IN THE COURT OF THE SENIOR CIVIL JUDGE)",
  "parties": "string (e.g. Ali vs. Usman)",
  "facts_and_averments": [
    "string (numbered paragraph 1)",
    "string (numbered paragraph 2)"
  ],
  "cause_of_action": "string (When and how the cause of action accrued)",
  "valuation_and_jurisdiction": "string (Value of suit for court fee and jurisdiction purposes)",
  "legal_grounds": [
    "string (numbered ground 1)",
    "string (numbered ground 2)"
  ],
  "prayer_clause": "string (It is therefore most respectfully prayed...)",
  "verification": "string (Verified on oath at [City] on [Date] that the contents of paras 1 to X are true to the best of my knowledge...)"
}}
Do not wrap the JSON in Markdown backticks. Do not include any other text."""

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Case Details / Instructions:\n{context_text}"}
            ],
            temperature=0.2,
            max_tokens=2500
        )
        
        output_text = response.choices[0].message.content.strip()
        if output_text.startswith("```json"):
            output_text = output_text[7:-3].strip()
        elif output_text.startswith("```"):
            output_text = output_text[3:-3].strip()
            
        try:
            return json.loads(output_text)
        except json.JSONDecodeError as e:
            raise Exception(f"Failed to parse LLM output as JSON: {e}\nRaw Output: {output_text}")
