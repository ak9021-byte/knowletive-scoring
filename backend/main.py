from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from app.routers import students, scores, attendance
from app.models.student import Student
from app.models.score import Score
from app.models.reward import Reward
from app.models.attendance import Attendance
from sqlalchemy import text

Base.metadata.create_all(bind=engine)

try:
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE daily_scores ADD COLUMN IF NOT EXISTS suggestion TEXT"))
        conn.execute(text("ALTER TABLE students ADD COLUMN IF NOT EXISTS photo TEXT"))
        conn.execute(text("ALTER TABLE daily_scores ADD COLUMN IF NOT EXISTS score_type VARCHAR DEFAULT 'daily'"))
        conn.execute(text("UPDATE daily_scores SET score_type = 'daily' WHERE score_type IS NULL"))
        conn.commit()
except:
    pass

app = FastAPI(title="Knowletive Scoring API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(students.router)
app.include_router(scores.router)
app.include_router(attendance.router)

@app.get("/")
def root():
    return {"message": "Knowletive Scoring API is running 🚀"}