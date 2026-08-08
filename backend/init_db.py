import sys
import os
sys.path.append(os.path.dirname(__file__))
from app.database import Base, engine

print("Creating database tables...")
Base.metadata.create_all(bind=engine)
print("? Tables created successfully.")
