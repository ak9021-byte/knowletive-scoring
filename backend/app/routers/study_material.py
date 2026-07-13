from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from app.models.study_material import StudyMaterial
from app.schemas.study_material import StudyMaterialCreate, StudyMaterialUpdate, StudyMaterialResponse
from typing import List

router = APIRouter(prefix="/study", tags=["Study Material"])


@router.get("/", response_model=List[StudyMaterialResponse])
def get_all_entries(db: Session = Depends(get_db)):
    return db.query(StudyMaterial).order_by(StudyMaterial.date.desc()).all()


@router.post("/", response_model=StudyMaterialResponse)
def create_entry(payload: StudyMaterialCreate, db: Session = Depends(get_db)):
    record = StudyMaterial(**payload.dict())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.put("/{entry_id}", response_model=StudyMaterialResponse)
def update_entry(entry_id: int, payload: StudyMaterialUpdate, db: Session = Depends(get_db)):
    record = db.query(StudyMaterial).filter(StudyMaterial.id == entry_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    for field, value in payload.dict().items():
        setattr(record, field, value)
    db.commit()
    db.refresh(record)
    return record


@router.delete("/{entry_id}")
def delete_entry(entry_id: int, db: Session = Depends(get_db)):
    record = db.query(StudyMaterial).filter(StudyMaterial.id == entry_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    db.delete(record)
    db.commit()
    return {"message": "Deleted"}