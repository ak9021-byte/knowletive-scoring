from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from database import Base


class ProjectUpdate(Base):
    __tablename__ = "project_updates"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    project_name = Column(String, nullable=False)
    date = Column(String, nullable=False)          # "YYYY-MM-DD"
    time = Column(String, nullable=False)          # "HH:MM"
    image = Column(Text, nullable=True)            # base64 data URL
    github_link = Column(String, nullable=True)
    deployment_link = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())