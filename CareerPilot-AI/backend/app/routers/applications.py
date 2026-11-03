"""
Applications Router: Application pipeline tracking, status transitions, and follow-ups.
"""

from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app import models, schemas
from backend.app.auth import get_current_user

router = APIRouter(prefix="/api/applications", tags=["Applications"])


@router.get("", response_model=List[schemas.ApplicationOut])
def get_applications(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(models.Application).filter(models.Application.user_id == current_user.id).all()


@router.post("", response_model=schemas.ApplicationOut)
def create_application(
    app_in: schemas.ApplicationCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_app = models.Application(
        user_id=current_user.id,
        job_id=app_in.job_id,
        company_name=app_in.company_name,
        job_title=app_in.job_title,
        status=app_in.status.lower(),
        applied_date=app_in.applied_date or datetime.utcnow().strftime("%Y-%m-%d"),
        follow_up_date=app_in.follow_up_date or "",
        notes=app_in.notes or "",
        salary_offered=app_in.salary_offered
    )
    db.add(new_app)
    db.commit()
    db.refresh(new_app)
    return new_app


@router.put("/{app_id}", response_model=schemas.ApplicationOut)
def update_application(
    app_id: int,
    app_in: schemas.ApplicationUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    app = db.query(models.Application).filter(
        models.Application.id == app_id,
        models.Application.user_id == current_user.id
    ).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    if app_in.status is not None:
        app.status = app_in.status.lower()
    if app_in.applied_date is not None:
        app.applied_date = app_in.applied_date
    if app_in.follow_up_date is not None:
        app.follow_up_date = app_in.follow_up_date
    if app_in.notes is not None:
        app.notes = app_in.notes
    if app_in.salary_offered is not None:
        app.salary_offered = app_in.salary_offered

    db.commit()
    db.refresh(app)
    return app


@router.delete("/{app_id}")
def delete_application(
    app_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    app = db.query(models.Application).filter(
        models.Application.id == app_id,
        models.Application.user_id == current_user.id
    ).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    db.delete(app)
    db.commit()
    return {"status": "success", "message": "Application removed"}
