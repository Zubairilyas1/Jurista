import os
import re
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from dotenv import find_dotenv, set_key

router = APIRouter(prefix="/api/v1/settings", tags=["Settings"])

class SettingsPayload(BaseModel):
    LLM_API_KEY: str | None = None
    LLM_MODEL_NAME: str | None = None
    TWILIO_ACCOUNT_SID: str | None = None
    TWILIO_AUTH_TOKEN: str | None = None
    TWILIO_WHATSAPP_FROM: str | None = None
    TWILIO_WHATSAPP_TO: str | None = None

def mask_secret(secret: str) -> str:
    if not secret or len(secret) < 8:
        return ""
    return secret[:4] + "*" * (len(secret) - 8) + secret[-4:]

@router.get("/")
async def get_settings():
    """Returns the current settings, masking sensitive keys."""
    # Read directly from env instead of os.environ to ensure we get latest file contents if changed
    dotenv_path = find_dotenv()
    if not dotenv_path:
        # Fallback if no .env file exists
        return {}

    settings = {}
    with open(dotenv_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" in line:
                key, val = line.split("=", 1)
                key = key.strip()
                val = val.strip().strip("'").strip('"')
                settings[key] = val

    return {
        "LLM_API_KEY": mask_secret(settings.get("LLM_API_KEY", "")),
        "LLM_MODEL_NAME": settings.get("LLM_MODEL_NAME", "llama-3.3-70b-versatile"),
        "TWILIO_ACCOUNT_SID": settings.get("TWILIO_ACCOUNT_SID", ""),
        "TWILIO_AUTH_TOKEN": mask_secret(settings.get("TWILIO_AUTH_TOKEN", "")),
        "TWILIO_WHATSAPP_FROM": settings.get("TWILIO_WHATSAPP_FROM", ""),
        "TWILIO_WHATSAPP_TO": settings.get("TWILIO_WHATSAPP_TO", ""),
        "DATABASE_URL": mask_secret(settings.get("DATABASE_URL", "")),
    }

@router.post("/")
async def update_settings(payload: SettingsPayload):
    """Updates the .env file with new settings."""
    dotenv_path = find_dotenv()
    if not dotenv_path:
        # Create it if it doesn't exist
        dotenv_path = os.path.join(os.getcwd(), ".env")
        with open(dotenv_path, "w") as f:
            pass

    # Only update fields that are not masked (i.e. if user sends *****, ignore it)
    update_dict = payload.dict(exclude_unset=True)
    
    for key, value in update_dict.items():
        if value and "*" not in value:
            # Safely set the key using dotenv
            set_key(dotenv_path, key, value)
            # Also update running environment
            os.environ[key] = value

    return {"status": "success", "message": "Settings updated successfully"}
