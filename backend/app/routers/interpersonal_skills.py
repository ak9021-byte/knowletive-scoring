from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from app.models.interpersonal_skill import InterpersonalSkill
from app.models.student import Student
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/skills", tags=["Interpersonal Skills"])

class SkillEntry(BaseModel):
    student_id:      int
    week:            int
    communication:   int = 0
    dressing:        int = 0
    gestures:        int = 0
    time_management: int = 0
    posture:         int = 0
    teamwork:        int = 0
    confidence:      int = 0
    leadership:      int = 0

class SkillResponse(BaseModel):
    id:              int
    student_id:      int
    week:            int
    communication:   int
    dressing:        int
    gestures:        int
    time_management: int
    posture:         int
    teamwork:        int
    confidence:      int
    leadership:      int

    class Config:
        from_attributes = True

@router.post("/", response_model=SkillResponse)
def save_skill_entry(payload: SkillEntry, db: Session = Depends(get_db)):
    existing = db.query(InterpersonalSkill).filter(
        InterpersonalSkill.student_id == payload.student_id,
        InterpersonalSkill.week == payload.week,
    ).first()
    if existing:
        for field, val in payload.dict(exclude={"student_id", "week"}).items():
            setattr(existing, field, val)
        db.commit()
        db.refresh(existing)
        return existing
    entry = InterpersonalSkill(**payload.dict())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

@router.get("/student/{student_id}", response_model=List[SkillResponse])
def get_skills_by_student(student_id: int, db: Session = Depends(get_db)):
    return (
        db.query(InterpersonalSkill)
        .filter(InterpersonalSkill.student_id == student_id)
        .order_by(InterpersonalSkill.week)
        .all()
    )

@router.get("/week/{week}", response_model=List[dict])
def get_skills_by_week(week: int, db: Session = Depends(get_db)):
    results = (
        db.query(InterpersonalSkill, Student.name)
        .join(Student, InterpersonalSkill.student_id == Student.id)
        .filter(InterpersonalSkill.week == week)
        .all()
    )
    return [
        {
            "id": s.id, "student_id": s.student_id, "student_name": name,
            "week": s.week, "communication": s.communication, "dressing": s.dressing,
            "gestures": s.gestures, "time_management": s.time_management,
            "posture": s.posture, "teamwork": s.teamwork, "confidence": s.confidence,
            "leadership": s.leadership,
            "total": s.communication + s.dressing + s.gestures + s.time_management + s.posture + s.teamwork + s.confidence + s.leadership,
        }
        for s, name in results
    ]

@router.get("/all", response_model=List[dict])
def get_all_skills(db: Session = Depends(get_db)):
    results = (
        db.query(InterpersonalSkill, Student.name)
        .join(Student, InterpersonalSkill.student_id == Student.id)
        .order_by(InterpersonalSkill.student_id, InterpersonalSkill.week)
        .all()
    )
    return [
        {
            "id": s.id, "student_id": s.student_id, "student_name": name,
            "week": s.week, "communication": s.communication, "dressing": s.dressing,
            "gestures": s.gestures, "time_management": s.time_management,
            "posture": s.posture, "teamwork": s.teamwork, "confidence": s.confidence,
            "leadership": s.leadership,
            "total": s.communication + s.dressing + s.gestures + s.time_management + s.posture + s.teamwork + s.confidence + s.leadership,
        }
        for s, name in results
    ]

@router.delete("/{skill_id}")
def delete_skill_entry(skill_id: int, db: Session = Depends(get_db)):
    entry = db.query(InterpersonalSkill).filter(InterpersonalSkill.id == skill_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(entry)
    db.commit()
    return {"message": "Deleted"}