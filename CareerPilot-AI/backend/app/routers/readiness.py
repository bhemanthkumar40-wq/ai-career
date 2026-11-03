"""
Readiness Router: Explainable Placement Readiness score, driver analysis, and breakdown.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app import models, schemas
from backend.app.auth import get_current_user
from backend.app.ml_engine import ml_engine

router = APIRouter(prefix="/api/readiness", tags=["Readiness"])


@router.get("", response_model=schemas.ReadinessResponse)
def get_readiness_score(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Computes an explainable, multi-factor placement readiness score.
    Combines profile completeness, skill coverage, seniority alignment, and application velocity.
    """
    profile = db.query(models.Profile).filter(models.Profile.user_id == current_user.id).first()
    completeness = profile.completeness_score if profile else 50
    skills = profile.skills if profile else []
    years_exp = profile.years_experience if profile else 2.0

    apps = db.query(models.Application).filter(models.Application.user_id == current_user.id).all()
    num_apps = len(apps)
    active_interviews = len([a for a in apps if a.status == "interview"])

    readiness = ml_engine.compute_placement_readiness(
        profile_completeness=completeness,
        skills=skills,
        years_experience=years_exp,
        num_applications=num_apps,
        active_interviews=active_interviews
    )
    return readiness
