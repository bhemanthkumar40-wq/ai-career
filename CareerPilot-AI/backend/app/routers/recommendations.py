"""
Recommendations Router: ML-powered explainable job matching and custom job-description analyzer.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app import models, schemas
from backend.app.auth import get_current_user
from backend.app.ml_engine import ml_engine

router = APIRouter(prefix="/api/recommendations", tags=["Recommendations"])


@router.get("", response_model=List[schemas.JobOut])
def get_recommendations(
    limit: int = 6,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns top job matches for current user profile, scored with explainable scikit-learn
    TF-IDF vectors and explicit skill intersection weights.
    """
    profile = db.query(models.Profile).filter(models.Profile.user_id == current_user.id).first()
    user_skills = profile.skills if profile else []
    user_exp = profile.years_experience if profile else 2.0
    user_headline = profile.headline if profile else ""

    jobs = db.query(models.Job).all()
    saved_ids = {
        sj.job_id for sj in db.query(models.SavedJob).filter(models.SavedJob.user_id == current_user.id).all()
    }

    scored_jobs = []
    for job in jobs:
        match_info = ml_engine.compute_job_match(
            user_skills=user_skills,
            user_experience=user_exp,
            job_required_skills=job.required_skills,
            job_preferred_skills=job.preferred_skills,
            job_experience_level=job.experience_level,
            job_description=job.description,
            user_headline=user_headline
        )
        job_out = schemas.JobOut(
            id=job.id,
            title=job.title,
            company=job.company,
            location=job.location,
            work_type=job.work_type,
            experience_level=job.experience_level,
            salary_min=job.salary_min,
            salary_max=job.salary_max,
            description=job.description,
            department=job.department,
            required_skills=job.required_skills,
            preferred_skills=job.preferred_skills,
            posted_date=job.posted_date,
            is_sample=job.is_sample,
            is_saved=(job.id in saved_ids),
            match_percentage=match_info["match_percentage"],
            match_reasons=match_info["match_reasons"],
            missing_skills=match_info["missing_skills"]
        )
        scored_jobs.append(job_out)

    scored_jobs.sort(key=lambda x: x.match_percentage or 0, reverse=True)
    return scored_jobs[:limit]


@router.post("/analyze-description", response_model=schemas.MatchAnalyzeResponse)
def analyze_job_description(
    req: schemas.MatchAnalyzeRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Analyzes an external pasted job description against the candidate's profile.
    Produces matched skills, missing skills, and tailored improvement actions.
    """
    profile = db.query(models.Profile).filter(models.Profile.user_id == current_user.id).first()
    user_skills = profile.skills if profile else []
    user_exp = profile.years_experience if profile else 2.0

    analysis = ml_engine.analyze_job_description_match(
        job_description=req.job_description,
        user_skills=user_skills,
        user_experience=user_exp
    )
    return analysis
