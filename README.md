
<div align="center">

```text
      _____  __  __  _____   _____  _____  _______  __      
     |___  ||  ||  ||  __ \ |_   _||  ___||__   __|/  \     
        | | |  ||  || |__) |  | |  | |__     | |  / /\ \    
    _   | | |  ||  ||  _  /   | |  \__  \    | | / ____ \   
    | |__| | |__||__| | | \ \ _| |_  ___| |   | |/ /    \ \  
     \____/  \____/  |_|  \_\_____||_____/   |_|/_/      \_\ 
```

**Bilingual AI Legal Intelligence Platform for Pakistani Advocates**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/Neon-PostgreSQL-336791?style=flat-square&logo=postgresql)](https://neon.tech/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)](https://docker.com/)

</div>

---

## 📖 Overview

**Jurista** is an enterprise-grade AI legal assistant engineered specifically for the Pakistani legal system. Moving beyond generic chatbots, Jurista introduces **Case Workspaces** - isolated memory contexts (`brain.md`) that retain facts, documents, and historical intelligence for individual litigation cases. 

Whether you are drafting a Bail Petition under the CrPC, cross-referencing the Qanun-e-Shahadat Order (QSO), or simulating courtroom arguments, Jurista orchestrates a suite of specialized AI modules to accelerate your legal workflow.

## 🏗️ Architecture & How It Works

Jurista operates on a decoupled microservices architecture:

1. **The Case Brain (Memory Core):** Every project/case is provisioned a localized `brain.md` file in the database. A background **Gemini Asynchronous Worker** continuously summarizes new inputs, chats, and OCR scans into this file. This prevents the LLM context window from overflowing while maintaining a permanent, evolving memory of the case facts.
2. **Dynamic UI Routing:** The Next.js frontend uses App Router dynamics (`/workspace/[caseId]`) to conditionally render specific legal modules (like Petition Drafter or Moot Court) based on the specific toggles enabled for that case.
3. **Strict RAG (Retrieval-Augmented Generation):** The backend employs Qdrant to search embedded Pakistani case law, ensuring all generated advice strictly cites authentic statutes and avoids hallucinatory foreign laws (e.g., explicitly excluding Indian penal codes).

## 🚀 Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router, React Server Components)
- **Styling:** Tailwind CSS, Framer Motion (Authentic minimal SaaS design)
- **Icons:** Lucide React
- **State & Data:** React Hooks, native `fetch` API caching

### Backend
- **Framework:** FastAPI (Python 3.11)
- **Database:** PostgreSQL (Neon Serverless) via SQLAlchemy ORM
- **Vector DB:** Qdrant (for semantic legal search)
- **Caching & Queues:** Redis (Celery integration ready)
- **AI Engine:** Google Gemini (1.5 / 2.0 Flash)

### DevOps & Infrastructure
- **Containerization:** Docker & Docker Compose
- **CI/CD:** GitHub Actions (Split CI & CD pipelines)

---

## 🛠️ Key Legal Modules

* 🗂️ **Case Mission Control:** Global dashboard with productivity analytics and active case tracking.
* 💬 **Legal Copilot (RAG):** Chat directly with your case files and Pakistani jurisprudence.
* 📄 **OCR Engine:** Extract actionable facts from raw, scanned FIRs and handwritten notes.
* ⚖️ **Moot Court Simulator:** Stress-test your arguments against an AI opposing counsel.
* 🛡️ **Opponent Analyzer:** Scan opposing briefs for logic loopholes and overruled precedents.
* 📝 **Petition Drafter:** Auto-generate structured court pleadings with dynamic variables.

---

## 🚦 Getting Started

### Prerequisites
- Node.js (v20+)
- Python (3.11+)
- Docker & Docker Compose
- A [Neon PostgreSQL](https://neon.tech/) connection string
- A [Google Gemini AI](https://aistudio.google.com/) API Key

### 1. Clone & Configure
```bash
git clone https://github.com/Zubairilyas1/Jurista.git
cd Jurista

# Create environment file
cp .env.example .env
```
Update `.env` with your credentials:
```env
DATABASE_URL=postgresql://neondb_owner:YOUR_NEON_PASSWORD@ep-...aws.neon.tech/neondb?sslmode=require
REDIS_URL=redis://localhost:6379/0
QDRANT_HOST=localhost
GEMINI_API_KEY=your_gemini_key_here
```

### 2. Run the Backend (FastAPI + Docker)
The easiest way to spin up the required databases is via Docker Compose:
```bash
docker-compose up -d postgres redis qdrant
```
Then start the FastAPI application:
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
```
*API Docs available at: `http://localhost:8001/docs`*

### 3. Run the Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```
*Application available at: `http://localhost:3000`*

---

## 📡 Core API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| **GET** | `/api/v1/projects/` | Retrieve all active case workspaces |
| **POST** | `/api/v1/projects/` | Provision a new case and initialize its AI brain |
| **PUT** | `/api/v1/projects/{id}` | Rename/update case metadata |
| **DELETE**| `/api/v1/projects/{id}` | Permanently destroy a case and its isolated memory |
| **POST** | `/api/v1/chat` | Send queries to the RAG legal copilot |
| **POST** | `/api/v1/drafter/draft` | Generate structured legal petitions |
| **POST** | `/api/v1/ocr/process` | Upload imagery for fact extraction |

---

## 🔄 CI/CD Pipeline

Jurista is configured with enterprise-grade GitHub Actions:
- **`ci.yml`**: Automatically triggers on all Pull Requests and pushes. Installs Node.js & Python environments, runs `npm run build` for Next.js, and validates FastAPI syntax to prevent regressions.
- **`deploy.yml`**: Triggers on pushes to the `main` branch. Connects to the production server via SSH and automatically rebuilds the Docker stack.

---

<div align="center">
  <sub>Built for the Future of Pakistani Law.</sub>
</div>
