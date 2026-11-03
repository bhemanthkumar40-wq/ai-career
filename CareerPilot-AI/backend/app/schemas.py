"""
Pydantic schemas for data validation and API request/response serialization.
"""

from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field


# User & Auth Schemas
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, description="Password must be at least 6 characters")
    full_name: str = Field(min_length=2, description="Full name of the user")


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"


class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    is_demo: bool

    class Config:
        from_attributes = True


# Profile Schemas
class ProfileUpdate(BaseModel):
    headline: Optional[str] = None
    education: Optional[str] = None
    years_experience: Optional[float] = None
    skills: Optional[List[str]] = None
    preferred_roles: Optional[List[str]] = None
    preferred_location: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    work_preference: Optional[str] = None
    resume_text: Optional[str] = None


class ProfileOut(BaseModel):
    id: int
    user_id: int
    headline: str
    education: str
    years_experience: float
    skills: List[str]
    preferred_roles: List[str]
    preferred_location: str
    salary_min: int
    salary_max: int
    work_preference: str
    resume_text: str
    completeness_score: int

    class Config:
        from_attributes = True


class ResumeParseRequest(BaseModel):
    resume_text: str = Field(..., min_length=20, description="Pasted or uploaded resume text")


class ResumeParseResponse(BaseModel):
    extracted_headline: str
    extracted_education: str
    extracted_years_experience: float
    extracted_skills: List[str]
    extracted_roles: List[str]
    summary_preview: str
    confidence_note: str


# Job Schemas
class JobOut(BaseModel):
    id: int
    title: str
    company: str
    location: str
    work_type: str
    experience_level: str
    salary_min: int
    salary_max: int
    description: str
    department: str
    required_skills: List[str]
    preferred_skills: List[str]
    posted_date: str
    is_sample: bool
    is_saved: Optional[bool] = False
    match_percentage: Optional[int] = None
    match_reasons: Optional[List[str]] = None
    missing_skills: Optional[List[str]] = None

    class Config:
        from_attributes = True


# Application Schemas
class ApplicationCreate(BaseModel):
    job_id: Optional[int] = None
    company_name: str
    job_title: str
    status: str = "saved"  # saved, applied, interview, offer, rejected
    applied_date: Optional[str] = ""
    follow_up_date: Optional[str] = ""
    notes: Optional[str] = ""
    salary_offered: Optional[int] = None


class ApplicationUpdate(BaseModel):
    status: Optional[str] = None
    applied_date: Optional[str] = None
    follow_up_date: Optional[str] = None
    notes: Optional[str] = None
    salary_offered: Optional[int] = None


class ApplicationOut(BaseModel):
    id: int
    user_id: int
    job_id: Optional[int]
    company_name: str
    job_title: str
    status: str
    applied_date: str
    follow_up_date: str
    notes: str
    salary_offered: Optional[int]

    class Config:
        from_attributes = True


# Learning Plan Schemas
class LearningItemCreate(BaseModel):
    skill_name: str
    priority: str = "high"  # critical, high, medium
    estimated_hours: int = 10
    category: str = "Technical Skill"
    recommended_resource: Optional[str] = ""


class LearningItemUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    estimated_hours: Optional[int] = None


class LearningItemOut(BaseModel):
    id: int
    user_id: int
    skill_name: str
    priority: str
    estimated_hours: int
    category: str
    recommended_resource: str
    status: str

    class Config:
        from_attributes = True


# Match Analysis & Placement Readiness
class MatchAnalyzeRequest(BaseModel):
    job_description: str = Field(..., min_length=20)
    target_role: Optional[str] = ""


class MatchAnalyzeResponse(BaseModel):
    overall_match: int
    matched_skills: List[str]
    missing_skills: List[str]
    experience_alignment: str
    strengths: List[str]
    actionable_improvements: List[str]
    confidence_level: str
    is_simulation_note: str


class ReadinessFactor(BaseModel):
    name: str
    score: int
    max_score: int
    impact: str  # High Positive, Moderate, Needs Attention
    description: str


class ReadinessResponse(BaseModel):
    overall_readiness_score: int
    tier: str  # Ready for Market, High Potential, Skill Building Phase
    summary: str
    factors: List[ReadinessFactor]
    positive_drivers: List[str]
    growth_areas: List[str]
    projected_interview_probability: str
    disclaimer: str


# Chat Assistant Schemas
class ChatMessage(BaseModel):
    role: str  # user, assistant, system
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    mode: Optional[str] = "general"  # resume_review, interview_prep, career_path, job_match


class ChatResponse(BaseModel):
    response: str
    model_used: str
    is_gemini_active: bool
    suggestions: List[str]
