import re
import os
import smtplib
from email.mime.text import MIMEText
from datetime import datetime, timedelta
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
from twilio.rest import Client
from sqlalchemy.orm import Session
from app.database import SessionLocal, Case, Deadline, Alert

class CauseListTracker:
    def __init__(self):
        self.twilio_sid = os.getenv("TWILIO_ACCOUNT_SID")
        self.twilio_token = os.getenv("TWILIO_AUTH_TOKEN")
        self.twilio_from = os.getenv("TWILIO_WHATSAPP_FROM")
        self.twilio_to = os.getenv("TWILIO_WHATSAPP_TO")
        self.smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", 587))
        self.smtp_user = os.getenv("SMTP_USER")
        self.smtp_pass = os.getenv("SMTP_PASSWORD")
        self.alert_email = os.getenv("ALERT_EMAIL")

    def fetch_cause_list(self, date_str=None):
        if date_str is None:
            date_str = datetime.now().strftime("%Y-%m-%d")
        # Replace with actual High Court cause list URL
        url = f"https://www.lhc.gov.pk/cause-list/{date_str}"
        print(f"?? Fetching cause list from: {url}")
        try:
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                page = browser.new_page()
                page.goto(url, wait_until="networkidle")
                html = page.content()
                browser.close()
                return html
        except Exception as e:
            print(f"? Failed to fetch cause list: {e}")
            return None

    def parse_cause_list(self, html):
        soup = BeautifulSoup(html, "html.parser")
        cases = []
        # Adapt selectors to actual cause list table structure
        rows = soup.select("table tr")
        for row in rows:
            cols = row.find_all("td")
            if len(cols) >= 5:
                case = {
                    "case_number": cols[0].text.strip(),
                    "parties": cols[1].text.strip(),
                    "court": cols[2].text.strip(),
                    "judge": cols[3].text.strip(),
                    "hearing_date": cols[4].text.strip()
                }
                cases.append(case)
        return cases

    def compute_deadline(self, event_date_str, act_type="appeal"):
        try:
            event_date = datetime.strptime(event_date_str, "%Y-%m-%d")
        except:
            event_date = datetime.now()
        if act_type == "appeal":
            return event_date + timedelta(days=90)
        elif act_type == "suit":
            return event_date + timedelta(days=1095)
        elif act_type == "execution":
            return event_date + timedelta(days=365)
        else:
            return event_date + timedelta(days=90)

    def send_whatsapp_alert(self, message, to_number=None):
        if not self.twilio_sid or not self.twilio_token:
            print("?? Twilio credentials missing.")
            return
        if to_number is None:
            to_number = self.twilio_to
        client = Client(self.twilio_sid, self.twilio_token)
        try:
            msg = client.messages.create(
                body=message,
                from_=self.twilio_from,
                to=to_number
            )
            print(f"? WhatsApp alert sent: {msg.sid}")
        except Exception as e:
            print(f"? WhatsApp send failed: {e}")

    def send_email_alert(self, subject, body, to_email=None):
        if to_email is None:
            to_email = self.alert_email
        if not to_email or not self.smtp_user or not self.smtp_pass:
            print("?? Email credentials missing.")
            return
        msg = MIMEText(body)
        msg["Subject"] = subject
        msg["From"] = self.smtp_user
        msg["To"] = to_email
        try:
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_pass)
                server.sendmail(self.smtp_user, [to_email], msg.as_string())
            print(f"? Email alert sent to {to_email}")
        except Exception as e:
            print(f"? Email send failed: {e}")

    def store_case(self, db: Session, case_data, deadline_date):
        # Check if case already exists
        existing = db.query(Case).filter(Case.case_number == case_data["case_number"]).first()
        if existing:
            print(f"Case {case_data['case_number']} already exists, updating...")
            # Update fields if needed
            existing.parties = case_data["parties"]
            existing.court = case_data["court"]
            existing.judge = case_data["judge"]
            # Parse hearing date
            try:
                existing.hearing_date = datetime.strptime(case_data["hearing_date"], "%Y-%m-%d")
            except:
                existing.hearing_date = datetime.now()
            db.commit()
            return existing
        else:
            new_case = Case(
                case_number=case_data["case_number"],
                parties=case_data["parties"],
                court=case_data["court"],
                judge=case_data["judge"],
                hearing_date=datetime.strptime(case_data["hearing_date"], "%Y-%m-%d") if case_data["hearing_date"] else datetime.now()
            )
            db.add(new_case)
            db.commit()
            db.refresh(new_case)
            # Create deadline entry
            deadline = Deadline(
                case_id=new_case.id,
                deadline_type="appeal",  # could be dynamic later
                due_date=deadline_date,
                alert_sent=False
            )
            db.add(deadline)
            db.commit()
            return new_case

    def process_daily_cause_list(self):
        html = self.fetch_cause_list()
        if not html:
            return []
        cases = self.parse_cause_list(html)
        print(f"?? Found {len(cases)} cases.")
        db = SessionLocal()
        stored_count = 0
        for case in cases:
            deadline = self.compute_deadline(datetime.now().strftime("%Y-%m-%d"))
            self.store_case(db, case, deadline)
            stored_count += 1
            # Send alerts for first 3 as demo
            if stored_count <= 3:
                message = f"Case: {case['case_number']}\nParties: {case['parties']}\nHearing: {case['hearing_date']}\nDeadline: {deadline.strftime('%Y-%m-%d')}"
                self.send_whatsapp_alert(message)
                self.send_email_alert("Cause List Alert", message)
        db.close()
        return cases
