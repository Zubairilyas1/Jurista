import re

file_path = r"d:\Projects\Future\Jurista\backend\app\core\draft_engine.py"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

new_method = """
    def generate_petition_html(self, data):
        petition_type = data.get("petition_type", "CRPC_497_BAIL")
        template = self.templates.get(petition_type, self.templates["CRPC_497_BAIL"])
        
        court_name = data.get("court", "High Court")
        case_no = data.get("case_number", "______/2026")
        date_str = strftime('%B %d, %Y', localtime())
        
        petitioner = data.get("petitioner", "______________________")
        respondent = data.get("respondent", "______________________")
        
        facts = data.get("facts", "The petitioner states as follows:")
        facts_html = "<br/>".join(facts.split("\\n"))
        
        prayer = data.get("prayer", "Grant relief as prayed.")
        prayer_html = "<br/>- ".join(prayer.split("\\n"))
        
        party_type = data.get("party_type", "Petitioner")
        bar_no = data.get("bar_license_no", "________")
        
        html = f\"\"\"
        <div style="font-family: 'Times New Roman', serif; max-width: 800px; margin: 0 auto; line-height: 1.6;">
            <h1 style="text-align: center; text-decoration: underline; font-size: 24px;">IN THE COURT OF {court_name}</h1>
            
            <p><strong>Case No:</strong> {case_no}</p>
            <p><strong>Date:</strong> {date_str}</p>
            
            <h2 style="text-align: center; font-size: 18px;">BETWEEN</h2>
            <p><strong>Petitioner/Plaintiff:</strong> <span style="font-family: 'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif; font-size: 18px;" dir="rtl">{{petitioner}}</span></p>
            <p style="text-align: center;"><strong>Versus</strong></p>
            <p><strong>Respondent/Defendant:</strong> <span style="font-family: 'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif; font-size: 18px;" dir="rtl">{{respondent}}</span></p>
            
            <h2 style="text-decoration: underline; font-size: 18px;">FACTS</h2>
            <div style="font-family: 'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif; font-size: 18px; text-align: right;" dir="rtl">
                {{facts_html}}
            </div>
            
            <h2 style="text-decoration: underline; font-size: 18px; margin-top: 20px;">LEGAL GROUNDS</h2>
            <ol>
                <li>That the actions of the respondent are contrary to law and violate the fundamental rights of the petitioner.</li>
                <li>That there is no reasonable grounds to believe the petitioner has committed a non-bailable offence.</li>
                <li>That the respondent has acted without jurisdiction and in excess of authority.</li>
                <li>Reliance is placed upon the case of <em>PLD 2019 SC 445</em></li>
            </ol>
            
            <h2 style="text-decoration: underline; font-size: 18px; margin-top: 20px;">PRAYER</h2>
            <p>It is, therefore, most respectfully prayed that this Honourable Court may graciously be pleased to:</p>
            <p style="margin-left: 20px;">- {prayer_html}</p>
            
            <br/><br/><br/>
            <p style="text-align: right;">__________________________</p>
            <p style="text-align: right;">Advocate for the {party_type}</p>
            <p style="text-align: right;">Bar License No: {bar_no}</p>
        </div>
        \"\"\"
        
        # safely replace variables
        html = html.replace("{{petitioner}}", petitioner)
        html = html.replace("{{respondent}}", respondent)
        html = html.replace("{{facts_html}}", facts_html)
        
        return html
"""

content += new_method

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Patched draft_engine.py")
