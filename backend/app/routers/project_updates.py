import io
from datetime import date as date_type
from typing import Optional, List

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from openpyxl import Workbook

from database import get_db
from app.models.project_update import ProjectUpdate
from app.models.student import Student

router = APIRouter(prefix="/project-updates", tags=["Project Updates"])


class ProjectUpdateCreate(BaseModel):
    student_id: int
    project_name: str
    work_done: str
    hours_spent: float = 0
    blockers: Optional[str] = None


@router.post("/")
def create_update(payload: ProjectUpdateCreate, db: Session = Depends(get_db)):
    update = ProjectUpdate(
        student_id=payload.student_id,
        project_name=payload.project_name,
        work_done=payload.work_done,
        hours_spent=payload.hours_spent,
        blockers=payload.blockers,
        date=date_type.today(),
    )
    db.add(update)
    db.commit()
    db.refresh(update)
    return update


@router.get("/student/{student_id}")
def get_student_updates(student_id: int, db: Session = Depends(get_db)):
    updates = (
        db.query(ProjectUpdate)
        .filter(ProjectUpdate.student_id == student_id)
        .order_by(ProjectUpdate.created_at.desc())
        .all()
    )
    return updates


@router.get("/all")
def get_all_updates(db: Session = Depends(get_db)):
    results = (
        db.query(ProjectUpdate, Student.name)
        .join(Student, Student.id == ProjectUpdate.student_id)
        .order_by(ProjectUpdate.date.desc(), ProjectUpdate.created_at.desc())
        .all()
    )
    return [
        {
            "id": u.ProjectUpdate.id,
            "student_id": u.ProjectUpdate.student_id,
            "student_name": u.name,
            "project_name": u.ProjectUpdate.project_name,
            "work_done": u.ProjectUpdate.work_done,
            "hours_spent": u.ProjectUpdate.hours_spent,
            "blockers": u.ProjectUpdate.blockers,
            "date": str(u.ProjectUpdate.date),
        }
        for u in results
    ]


@router.get("/export")
def export_excel(db: Session = Depends(get_db)):
    results = (
        db.query(ProjectUpdate, Student.name)
        .join(Student, Student.id == ProjectUpdate.student_id)
        .order_by(ProjectUpdate.date.desc(), ProjectUpdate.created_at.desc())
        .all()
    )

    wb = Workbook()
    ws = wb.active
    ws.title = "Project Updates"

    headers = ["Date", "Student Name", "Project Name", "Work Done", "Hours Spent", "Blockers"]
    ws.append(headers)

    for u in results:
        ws.append([
            str(u.ProjectUpdate.date),
            u.name,
            u.ProjectUpdate.project_name,
            u.ProjectUpdate.work_done,
            u.ProjectUpdate.hours_spent,
            u.ProjectUpdate.blockers or "",
        ])

    widths = [14, 22, 22, 45, 12, 35]
    for i, w in enumerate(widths, start=1):
        ws.column_dimensions[chr(64 + i)].width = w

    stream = io.BytesIO()
    wb.save(stream)
    stream.seek(0)

    return StreamingResponse(
        stream,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=project_updates.xlsx"},
    )