from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime
from app.models.interpersonal_skill import InterpersonalSkill



class Student(Base):
    __tablename__ = "students"

    id        = Column(Integer, primary_key=True, index=True)
    name      = Column(String, nullable=False)
    email     = Column(String, unique=True, nullable=False)
    level     = Column(String, default="Beginner")
    photo     = Column(Text, nullable=True)
    joined_at = Column(DateTime, default=datetime.utcnow)

    scores  = relationship("Score", back_populates="student")
    rewards = relationship("Reward", back_populates="student")
    attendance = relationship("Attendance", back_populates="student")
    interpersonal_skills = relationship("InterpersonalSkill", back_populates="student")