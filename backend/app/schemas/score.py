from pydantic import BaseModel
from datetime import date
from typing import Optional

class ScoreCreate(BaseModel):
    student_id: int
    date: date
    attendance: int
    speak_up: int
    activity: int
    technical: int
    behavior: int
    initiative: int
    total: Optional[int] = 0
    suggestion: Optional[str] = None
    score_type: Optional[str] = "daily"  # "daily", "weekly", "monthly"

class ScoreResponse(ScoreCreate):
    id: int
    total: int
    rank: Optional[int]
    suggestion: Optional[str]
    score_type: Optional[str]

    class Config:
        from_attributes = True