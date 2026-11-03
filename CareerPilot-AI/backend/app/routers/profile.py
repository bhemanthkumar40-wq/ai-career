"""
Profile Router: Manage candidate career profile, preferences, and local resume parsing.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app import models, schemas
from backend.app.auth import get_current_user
from backend.app.ml_engine import ml_engine

router = APIRouter(prefix="/api/profile", tags=["Profile"])


def calculate_completeness(profile: models.Profile) -> int:
    """Calculates profile completeness percentage based on key field occupancy."""
    score = 0
    if profile.headline and len(profile.headline.strip()) > 5:
        score += 15
    if profile.education and len(profile.education.strip()) > 3:
        score += 15
    if profile.years_experience > 0:
        score += 10
    if profile.skills and len(profile.skills) >= 5:
        score += 25
    elif profile.skills and len(profile.skills) >= 2:
        score += 15
    if profile.preferred_roles and len(profile.preferred_roles) > 0:
        score += 15
    if profile.resume_text and len(profile.resume_text.strip()) > 50:
        score += 20
    return min(100, score)


@router.get("", response_model=schemas.ProfileOut)
def get_user_profile(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(models.Profile).filter(models.Profile.user_id == current_user.id).first()
    if not profile:
        profile = models.Profile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


@router.put("", response_model=schemas.ProfileOut)
def update_user_profile(
    profile_in: schemas.ProfileUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(models.Profile).filter(models.Profile.user_id == current_user.id).first()
    if not profile:
        profile = models.Profile(user_id=current_user.id)
        db.add(profile)

    if profile_in.headline is not None:
        profile.headline = profile_in.headline
    if profile_in.education is not None:
        profile.education = profile_in.education
    if profile_in.years_experience is not None:
        profile.years_experience = profile_in.years_experience
    if profile_in.skills is not None:
        profile.skills = [ml_engine.normalize_skill(s) for s in profile_in.skills if s.strip()]
    if profile_in.preferred_roles is not None:
        profile.preferred_roles = profile_in.preferred_roles
    if profile_in.preferred_location is not None:
        profile.preferred_location = profile_in.preferred_location
    if profile_in.salary_min is not None:
        profile.salary_min = profile_in.salary_min
    if profile_in.salary_max is not None:
        profile.salary_max = profile_in.salary_max
    if profile_in.work_preference is not None:
        profile.work_preference = profile_in.work_preference
    if profile_in.resume_text is not None:
        profile.resume_text = profile_in.resume_text

    profile.completeness_score = calculate_completeness(profile)
    db.commit()
    db.refresh(profile)
    return profile


@router.post("/parse-resume", response_model=schemas.ResumeParseResponse)
def parse_resume(
    req: schemas.ResumeParseRequest,
    current_user: models.User = Depends(get_current_user)
):
    """
    Parses resume text locally using explainable rule-based pattern matching.
    Returns extracted items for candidate review before committing to profile.
    """
    parsed = ml_engine.parse_resume_text(req.resume_text)
    return parsed
