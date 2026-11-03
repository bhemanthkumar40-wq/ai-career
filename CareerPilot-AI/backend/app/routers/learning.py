"""
Learning Plan Router: Skill gap prioritization, learning roadmaps, and progress tracking.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app import models, schemas
from backend.app.auth import get_current_user

router = APIRouter(prefix="/api/learning-plan", tags=["Learning Plan"])


@router.get("", response_model=List[schemas.LearningItemOut])
def get_learning_plan(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    items = db.query(models.LearningItem).filter(models.LearningItem.user_id == current_user.id).all()
    
    # If no items exist yet, generate smart starter items based on common high-demand gaps
    if not items:
        starter_topics = [
            {
                "skill_name": "Docker & Containerization",
                "priority": "critical",
                "estimated_hours": 12,
                "category": "Cloud & Infrastructure",
                "recommended_resource": "Docker Getting Started Guide & containerizing a FastAPI + React application",
                "status": "in_progress"
            },
            {
                "skill_name": "TypeScript Advanced Types & Generics",
                "priority": "high",
                "estimated_hours": 8,
                "category": "Frontend Architecture",
                "recommended_resource": "TypeScript Handbook: Generics, Utility Types, and Strict Typing",
                "status": "not_started"
            },
            {
                "skill_name": "CI/CD Pipeline Automation (GitHub Actions)",
                "priority": "medium",
                "estimated_hours": 6,
                "category": "DevOps & Delivery",
                "recommended_resource": "Configuring automated test runners and build verification workflows",
                "status": "not_started"
            }
        ]
        created = []
        for t in starter_topics:
            item = models.LearningItem(
                user_id=current_user.id,
                skill_name=t["skill_name"],
                priority=t["priority"],
                estimated_hours=t["estimated_hours"],
                category=t["category"],
                recommended_resource=t["recommended_resource"],
                status=t["status"]
            )
            db.add(item)
            created.append(item)
        db.commit()
        return created

    return items


@router.post("", response_model=schemas.LearningItemOut)
def add_learning_item(
    item_in: schemas.LearningItemCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_item = models.LearningItem(
        user_id=current_user.id,
        skill_name=item_in.skill_name,
        priority=item_in.priority.lower(),
        estimated_hours=item_in.estimated_hours,
        category=item_in.category,
        recommended_resource=item_in.recommended_resource or "Documentation & build practical project",
        status="not_started"
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item


@router.put("/{item_id}", response_model=schemas.LearningItemOut)
def update_learning_item(
    item_id: int,
    item_in: schemas.LearningItemUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    item = db.query(models.LearningItem).filter(
        models.LearningItem.id == item_id,
        models.LearningItem.user_id == current_user.id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Learning plan item not found")

    if item_in.status is not None:
        item.status = item_in.status.lower()
    if item_in.priority is not None:
        item.priority = item_in.priority.lower()
    if item_in.estimated_hours is not None:
        item.estimated_hours = item_in.estimated_hours

    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}")
def delete_learning_item(
    item_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    item = db.query(models.LearningItem).filter(
        models.LearningItem.id == item_id,
        models.LearningItem.user_id == current_user.id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Learning plan item not found")

    db.delete(item)
    db.commit()
    return {"status": "success", "message": "Learning item removed"}
