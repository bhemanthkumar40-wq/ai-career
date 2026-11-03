"""
SQLAlchemy database models for CareerPilot AI.
"""

from datetime import datetime
import json
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Float
from sqlalchemy.orm import relationship
from backend.app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="user", cascade="all, delete-orphan")
    saved_jobs = relationship("SavedJob", back_populates="user", cascade="all, delete-orphan")
    learning_items = relationship("LearningItem", back_populates="user", cascade="all, delete-orphan")


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    headline = Column(String(255), default="Aspiring Professional")
    education = Column(String(255), default="Bachelor of Science in Computer Science")
    years_experience = Column(Float, default=2.0)
    # Stored as JSON string list
    skills_json = Column(Text, default="[]")
    preferred_roles_json = Column(Text, default="[]")
    preferred_location = Column(String(255), default="San Francisco, CA (or Remote)")
    salary_min = Column(Integer, default=95000)
    salary_max = Column(Integer, default=140000)
    work_preference = Column(String(50), default="Remote")  # Remote, Hybrid, On-site
    resume_text = Column(Text, default="")
    completeness_score = Column(Integer, default=65)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="profile")

    @property
    def skills(self):
        try:
            return json.loads(self.skills_json) if self.skills_json else []
        except Exception:
            return []

    @skills.setter
    def skills(self, val):
        self.skills_json = json.dumps(val if isinstance(val, list) else [])

    @property
    def preferred_roles(self):
        try:
            return json.loads(self.preferred_roles_json) if self.preferred_roles_json else []
        except Exception:
            return []

    @preferred_roles.setter
    def preferred_roles(self, val):
        self.preferred_roles_json = json.dumps(val if isinstance(val, list) else [])


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), index=True, nullable=False)
    company = Column(String(255), nullable=False)
    location = Column(String(255), nullable=False)
    work_type = Column(String(50), default="Remote")  # Remote, Hybrid, On-site
    experience_level = Column(String(50), default="Mid-Level")  # Entry-Level, Mid-Level, Senior, Lead
    salary_min = Column(Integer, default=90000)
    salary_max = Column(Integer, default=135000)
    description = Column(Text, nullable=False)
    department = Column(String(100), default="Engineering")
    required_skills_json = Column(Text, default="[]")
    preferred_skills_json = Column(Text, default="[]")
    posted_date = Column(String(50), default="Recently posted")
    is_sample = Column(Boolean, default=True)  # Clearly labels sample data

    saved_by = relationship("SavedJob", back_populates="job", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="job")

    @property
    def required_skills(self):
        try:
            return json.loads(self.required_skills_json) if self.required_skills_json else []
        except Exception:
            return []

    @required_skills.setter
    def required_skills(self, val):
        self.required_skills_json = json.dumps(val if isinstance(val, list) else [])

    @property
    def preferred_skills(self):
        try:
            return json.loads(self.preferred_skills_json) if self.preferred_skills_json else []
        except Exception:
            return []

    @preferred_skills.setter
    def preferred_skills(self, val):
        self.preferred_skills_json = json.dumps(val if isinstance(val, list) else [])


class SavedJob(Base):
    __tablename__ = "saved_jobs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="saved_jobs")
    job = relationship("Job", back_populates="saved_by")


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=True)
    company_name = Column(String(255), nullable=False)
    job_title = Column(String(255), nullable=False)
    status = Column(String(50), default="saved")  # saved, applied, interview, offer, rejected
    applied_date = Column(String(50), default="")
    follow_up_date = Column(String(50), default="")
    notes = Column(Text, default="")
    salary_offered = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="applications")
    job = relationship("Job", back_populates="applications")


class LearningItem(Base):
    __tablename__ = "learning_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    skill_name = Column(String(100), nullable=False)
    priority = Column(String(50), default="high")  # critical, high, medium
    estimated_hours = Column(Integer, default=10)
    category = Column(String(100), default="Technical Skill")
    recommended_resource = Column(String(255), default="Official documentation & hands-on mini projects")
    status = Column(String(50), default="not_started")  # not_started, in_progress, completed
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="learning_items")
