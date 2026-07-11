from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from database import Base


class ProjectUpdate(Base):
    __tablename__ = "project_updates"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    project_name = Column(String, nullable=False)
    technology = Column(String, nullable=True)
    date = Column(String, nullable=False)
    time = Column(String, nullable=False)
    image = Column(Text, nullable=True)
    github_link = Column(String, nullable=True)
    deployment_link = Column(String, nullable=True)
    approved = Column(Boolean, default=False)
    faculty_remark = Column(String, nullable=True)
    reviewer_name = Column(String, nullable=True)   
    created_at = Column(DateTime(timezone=True), server_default=func.now())