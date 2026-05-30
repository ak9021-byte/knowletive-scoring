from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from app.routers import students, scores
from app.models.student import Student
from app.models.score import Score
from app.models.reward import Reward
from sqlalchemy import text

Base.metadata.create_all(bind=engine)

# Add suggestion column if not exists
try:
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE daily_scores ADD COLUMN IF NOT EXISTS suggestion TEXT"))
        conn.commit()
except:
    pass

app = FastAPI(title="Knowletive Scoring API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(students.router)
app.include_router(scores.router)

@app.get("/")
def root():
    return {"message": "Knowletive Scoring API is running 🚀"}