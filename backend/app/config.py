import os

class Settings:
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    QDRANT_HOST: str = os.getenv("QDRANT_HOST", "localhost")
    QDRANT_PORT: int = int(os.getenv("QDRANT_PORT", "6333"))
    MODEL_PATH: str = os.getenv("MODEL_PATH", "BAAI/bge-m3")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "llama3:8b")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://user:pass@localhost:5432/jurista")

settings = Settings()
