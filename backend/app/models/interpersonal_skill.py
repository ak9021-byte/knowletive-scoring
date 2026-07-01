from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class InterpersonalSkill(Base):
    __tablename__ = "interpersonal_skills"

    id              = Column(Integer, primary_key=True, index=True)
    student_id      = Column(Integer, ForeignKey("students.id"), nullable=False)
    week            = Column(Integer, nullable=False)
    communication   = Column(Integer, default=0)
    dressing        = Column(Integer, default=0)
    gestures        = Column(Integer, default=0)
    time_management = Column(Integer, default=0)
    posture         = Column(Integer, default=0)
    teamwork        = Column(Integer, default=0)
    confidence      = Column(Integer, default=0)
    leadership      = Column(Integer, default=0)

    student = relationship("Student", back_populates="interpersonal_skills")