"""
Jobs Router: Job discovery, multi-filter search, sorting, and saved job management.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_

from backend.app.database import get_db
from backend.app import models, schemas
from backend.app.auth import get_current_user
from backend.app.ml_engine import ml_engine

router = APIRouter(prefix="/api/jobs", tags=["Jobs"])


@router.get("", response_model=List[schemas.JobOut])
def get_jobs(
    q: Optional[str] = Query(None, description="Search keyword in title, company, or description"),
    role: Optional[str] = Query(None, description="Filter by role title or category"),
    work_type: Optional[str] = Query(None, description="Remote, Hybrid, On-site"),
    experience_level: Optional[str] = Query(None, description="Entry-Level, Mid-Level, Senior, Lead"),
    skill: Optional[str] = Query(None, description="Filter by specific skill"),
    min_salary: Optional[int] = Query(None, description="Minimum base salary"),
    sort_by: Optional[str] = Query("match", description="match, salary_desc, salary_asc, newest"),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(models.Job)

    if q:
        search_fmt = f"%{q.strip()}%"
        query = query.filter(
            or_(
                models.Job.title.ilike(search_fmt),
                models.Job.company.ilike(search_fmt),
                models.Job.description.ilike(search_fmt),
                models.Job.location.ilike(search_fmt)
            )
        )

    if role and role.lower() != "all":
        query = query.filter(models.Job.title.ilike(f"%{role.strip()}%"))

    if work_type and work_type.lower() != "all":
        query = query.filter(models.Job.work_type.ilike(work_type.strip()))

    if experience_level and experience_level.lower() != "all":
        query = query.filter(models.Job.experience_level.ilike(experience_level.strip()))

    if min_salary:
        query = query.filter(models.Job.salary_max >= min_salary)

    jobs = query.all()

    # Get user profile for match score calculation
    profile = db.query(models.Profile).filter(models.Profile.user_id == current_user.id).first()
    user_skills = profile.skills if profile else []
    user_exp = profile.years_experience if profile else 2.0
    user_headline = profile.headline if profile else ""

    # Get user's saved job IDs
    saved_ids = {
        sj.job_id for sj in db.query(models.SavedJob).filter(models.SavedJob.user_id == current_user.id).all()
    }

    results = []
    for job in jobs:
        # Filter by skill if requested
        if skill and skill.lower() != "all":
            all_job_skills = [s.lower() for s in (job.required_skills + job.preferred_skills)]
            if skill.lower() not in all_job_skills:
                continue

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
        results.append(job_out)

    # Sort results
    if sort_by == "match":
        results.sort(key=lambda x: x.match_percentage or 0, reverse=True)
    elif sort_by == "salary_desc":
        results.sort(key=lambda x: x.salary_max, reverse=True)
    elif sort_by == "salary_asc":
        results.sort(key=lambda x: x.salary_min)
    elif sort_by == "newest":
        results.sort(key=lambda x: x.id, reverse=True)

    return results


@router.get("/saved", response_model=List[schemas.JobOut])
def get_saved_jobs(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    saved_records = db.query(models.SavedJob).filter(models.SavedJob.user_id == current_user.id).all()
    job_ids = [s.job_id for s in saved_records]
    jobs = db.query(models.Job).filter(models.Job.id.in_(job_ids)).all()

    profile = db.query(models.Profile).filter(models.Profile.user_id == current_user.id).first()
    user_skills = profile.skills if profile else []
    user_exp = profile.years_experience if profile else 2.0

    results = []
    for job in jobs:
        match_info = ml_engine.compute_job_match(
            user_skills=user_skills,
            user_experience=user_exp,
            job_required_skills=job.required_skills,
            job_preferred_skills=job.preferred_skills,
            job_experience_level=job.experience_level,
            job_description=job.description
        )
        results.append(
            schemas.JobOut(
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
                is_saved=True,
                match_percentage=match_info["match_percentage"],
                match_reasons=match_info["match_reasons"],
                missing_skills=match_info["missing_skills"]
            )
        )
    return results


@router.post("/{job_id}/toggle-save")
def toggle_save_job(
    job_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    existing = db.query(models.SavedJob).filter(
        models.SavedJob.user_id == current_user.id,
        models.SavedJob.job_id == job_id
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        return {"status": "unmarked", "is_saved": False, "message": "Job removed from saved list"}
    else:
        new_saved = models.SavedJob(user_id=current_user.id, job_id=job_id)
        db.add(new_saved)
        db.commit()
        return {"status": "saved", "is_saved": True, "message": "Job saved to your bookmarks"}
