from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,   # ✅ fixes SSL disconnection from Neon
    pool_recycle=300,     # ✅ recycle connections every 5 mins
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    from app.models.student import Student
    from app.models.score import Score
    from app.models.reward import Reward
    Base.metadata.create_all(bind=engine)
    print("All tables created!")