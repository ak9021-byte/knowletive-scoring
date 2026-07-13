from pydantic import BaseModel
from datetime import date as date_type, datetime
from typing import List

class StudyMaterialCreate(BaseModel):
    date: date_type
    topic_name: str
    video_recorded: str = ""
    video_access: str = ""
    programs_given: int = 0
    programs_submitted: int = 0
    notes: List[str] = []

class StudyMaterialUpdate(StudyMaterialCreate):
    pass

class StudyMaterialResponse(StudyMaterialCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True