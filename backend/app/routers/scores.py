from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from app.models.score import Score
from app.models.student import Student
from app.models.reward import Reward
from app.schemas.score import ScoreCreate, ScoreResponse
from typing import List
from datetime import date

router = APIRouter(prefix="/scores", tags=["Scores"])

@router.post("/", response_model=ScoreResponse)
def submit_score(payload: ScoreCreate, db: Session = Depends(get_db)):
    # ✅ Duplicate check — only block if it's a real score (not a suggestion)
    is_suggestion = payload.total == 0 and payload.suggestion is not None

    if not is_suggestion:
        existing = db.query(Score).filter(
            Score.student_id == payload.student_id,
            Score.date == payload.date
        ).first()
        if existing and existing.total > 0:
            raise HTTPException(
                status_code=400,
                detail="Score already submitted for this student today!"
            )

    total = (
        payload.attendance + payload.speak_up + payload.activity +
        payload.technical + payload.behavior + payload.initiative
    )
    data = payload.dict()
    data["total"] = total
    score = Score(**data)
    db.add(score)
    db.commit()
    db.refresh(score)

    # ✅ Auto update student level (only for real scores)
    if not is_suggestion:
        update_student_level(payload.student_id, db)

        # ✅ Auto save Student of the Day
        today = date.today()
        top = (
            db.query(Student.name, Score.total, Score.student_id)
            .join(Score, Score.student_id == Student.id)
            .filter(Score.date == today, Score.total > 0)
            .order_by(Score.total.desc())
            .first()
        )
        if top:
            existing_reward = db.query(Reward).filter(
                Reward.date == today,
                Reward.type == "daily",
                Reward.title == "Student of the Day"
            ).first()
            if existing_reward:
                existing_reward.student_id = top.student_id
            else:
                reward = Reward(
                    student_id=top.student_id,
                    type="daily",
                    title="Student of the Day",
                    date=today
                )
                db.add(reward)
            db.commit()

    return score

@router.get("/leaderboard/today", response_model=List[dict])
def today_leaderboard(db: Session = Depends(get_db)):
    today = date.today()
    results = (
        db.query(Student.name, Score.total)
        .join(Score, Score.student_id == Student.id)
        .filter(Score.date == today)
        .order_by(Score.total.desc())
        .limit(10)
        .all()
    )
    return [{"name": r.name, "total": r.total, "rank": i+1}
            for i, r in enumerate(results)]

@router.get("/student-of-the-day")
def student_of_the_day(db: Session = Depends(get_db)):
    today = date.today()
    result = (
        db.query(Student.name, Score.total)
        .join(Score, Score.student_id == Student.id)
        .filter(Score.date == today)
        .order_by(Score.total.desc())
        .first()
    )
    if not result:
        raise HTTPException(status_code=404, detail="No scores today")
    return {"student_of_the_day": result.name, "score": result.total}

@router.get("/weekly/{student_id}")
def weekly_scores(student_id: int, db: Session = Depends(get_db)):
    scores = (
        db.query(Score)
        .filter(Score.student_id == student_id)
        .order_by(Score.date.desc())
        .limit(7)
        .all()
    )
    return scores

@router.get("/my-scores/{student_id}")
def my_scores(student_id: int, db: Session = Depends(get_db)):
    scores = (
        db.query(Score)
        .filter(Score.student_id == student_id)
        .order_by(Score.date.desc())
        .all()
    )
    return scores