from pydantic import BaseModel, EmailStr
from datetime import datetime, date
from typing import Optional

class StudentCreate(BaseModel):
    name: str
    email: EmailStr

class StudentResponse(BaseModel):
    id: int
    name: str
    email: str
    level: str
    joined_at: datetime

    class Config:
        from_attributes = True

class RewardCreate(BaseModel):
    student_id: int
    type: str
    title: str
    date: Optional[date] = None

class RewardResponse(BaseModel):
    id: int
    student_id: int
    type: str
    title: str
    date: date

    class Config:
        from_attributes = True