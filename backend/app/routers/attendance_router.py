from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from app.models.attendance import Attendance
from app.models.student import Student
from app.schemas.attendance import AttendanceCreate, AttendanceResponse, BulkAttendanceCreate
from typing import List
from datetime import date

router = APIRouter(prefix="/attendance", tags=["Attendance"])


@router.get("/", response_model=List[AttendanceResponse])
def get_all_attendance(db: Session = Depends(get_db)):
    return db.query(Attendance).all()


@router.get("/date/{date}", response_model=List[dict])
def get_attendance_by_date(date: date, db: Session = Depends(get_db)):
    results = (
        db.query(Attendance, Student.name)
        .join(Student, Attendance.student_id == Student.id)
        .filter(Attendance.date == date)
        .all()
    )
    return [
        {
            "id": a.id,
            "student_id": a.student_id,
            "student_name": name,
            "date": str(a.date),
            "status": a.status,
        }
        for a, name in results
    ]


@router.get("/student/{student_id}", response_model=List[AttendanceResponse])
def get_student_attendance(student_id: int, db: Session = Depends(get_db)):
    return (
        db.query(Attendance)
        .filter(Attendance.student_id == student_id)
        .order_by(Attendance.date)
        .all()
    )


@router.get("/summary", response_model=List[dict])
def get_attendance_summary(db: Session = Depends(get_db)):
    students = db.query(Student).all()
    result = []
    for s in students:
        records = db.query(Attendance).filter(Attendance.student_id == s.id).all()
        present = sum(1 for r in records if r.status == "present")
        absent  = sum(1 for r in records if r.status == "absent")
        holiday = sum(1 for r in records if r.status == "holiday")
        marked  = present + absent + holiday
        pct     = round((present / marked) * 100) if marked > 0 else 0
        result.append({
            "student_id": s.id,
            "student_name": s.name,
            "present": present,
            "absent": absent,
            "holiday": holiday,
            "marked": marked,
            "pct": pct,
        })
    return result


@router.post("/mark", response_model=AttendanceResponse)
def mark_attendance(payload: AttendanceCreate, db: Session = Depends(get_db)):
    # Check if already exists for this student+date
    existing = db.query(Attendance).filter(
        Attendance.student_id == payload.student_id,
        Attendance.date == payload.date,
    ).first()

    if existing:
        existing.status = payload.status
        db.commit()
        db.refresh(existing)
        return existing

    record = Attendance(**payload.dict())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.post("/mark-bulk")
def mark_bulk_attendance(payload: BulkAttendanceCreate, db: Session = Depends(get_db)):
    updated = []
    for rec in payload.records:
        existing = db.query(Attendance).filter(
            Attendance.student_id == rec.student_id,
            Attendance.date == payload.date,
        ).first()
        if existing:
            existing.status = rec.status
            updated.append(existing)
        else:
            new_rec = Attendance(
                student_id=rec.student_id,
                date=payload.date,
                status=rec.status,
            )
            db.add(new_rec)
            updated.append(new_rec)
    db.commit()
    return {"message": f"{len(updated)} records saved", "date": str(payload.date)}


@router.delete("/{attendance_id}")
def delete_attendance(attendance_id: int, db: Session = Depends(get_db)):
    record = db.query(Attendance).filter(Attendance.id == attendance_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    db.delete(record)
    db.commit()
    return {"message": "Deleted"}