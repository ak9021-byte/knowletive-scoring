from sqlalchemy import Column, Integer, Date, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base
from datetime import date

class Score(Base):
    __tablename__ = "daily_scores"

    id          = Column(Integer, primary_key=True, index=True)
    student_id  = Column(Integer, ForeignKey("students.id"), nullable=False)
    date        = Column(Date, default=date.today)
    attendance  = Column(Integer, default=0)
    speak_up    = Column(Integer, default=0)
    activity    = Column(Integer, default=0)
    technical   = Column(Integer, default=0)
    behavior    = Column(Integer, default=0)
    initiative  = Column(Integer, default=0)
    total       = Column(Integer, default=0)
    rank        = Column(Integer, nullable=True)
    suggestion  = Column(Text, nullable=True)

    student = relationship("Student", back_populates="scores")