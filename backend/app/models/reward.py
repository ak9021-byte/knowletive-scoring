from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
from datetime import date

class Reward(Base):
    __tablename__ = "rewards"

    id         = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    type       = Column(String)   # daily / weekly / monthly
    title      = Column(String)   # Student of the Day, Top Performer etc.
    date       = Column(Date, default=date.today)

    student = relationship("Student", back_populates="rewards")