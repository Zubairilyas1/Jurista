from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import all routers
from app.api import rag, drafter, ocr, tracker, settings

app = FastAPI(title="Jurista PakLaw-AI", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(rag.router)
app.include_router(drafter.router)
app.include_router(ocr.router)
app.include_router(tracker.router)
app.include_router(settings.router)

@app.get("/health")
async def health_check():
    return {"status": "ok", "app": "Jurista PakLaw-AI"}

