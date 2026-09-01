import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv(), override=True)

# Neon PostgreSQL fallback to SQLite
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///jurista.db")
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Connection pooling optimized for Neon (if Postgres)
connect_args = {}
if "sqlite" in DATABASE_URL:
    connect_args["check_same_thread"] = False

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def init_db():
    # Import all models here to register them with Base
    import app.models.case
    Base.metadata.create_all(bind=engine)
    print("Database tables initialized successfully.")

# Expose legacy models for existing scripts
from app.models.case import Case, Deadline, Alert
