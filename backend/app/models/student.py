from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime


class Student(Base):
    __tablename__ = "students"

    id        = Column(Integer, primary_key=True, index=True)
    name      = Column(String, nullable=False)
    email     = Column(String, unique=True, nullable=False)
    level     = Column(String, default="Beginner")
    joined_at = Column(DateTime, default=datetime.utcnow)

    scores  = relationship("Score", back_populates="student")
    rewards = relationship("Reward", back_populates="student")
    attendance = relationship("Attendance", back_populates="student")