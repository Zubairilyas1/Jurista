import re

file_path = r"d:\Projects\Future\Jurista\backend\app\core\draft_engine.py"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace generate_petition_html
new_method = """
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
"""

content = re.sub(r"    def generate_petition_html\(self, data\):[\s\S]*?(?=\n\n|\Z)", new_method.strip('\n'), content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Patched draft_engine.py for bilingual and bugfix")
