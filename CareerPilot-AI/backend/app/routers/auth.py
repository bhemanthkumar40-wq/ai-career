"""
Authentication Router: User registration, login, demo access, and current user info.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app import models, schemas
from backend.app.auth import verify_password, get_password_hash, create_access_token, get_current_user
from backend.app.config import settings

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=schemas.TokenResponse)
def register(user_in: schemas.UserRegister, db: Session = Depends(get_db)):
    """
    Register a new user account with hashed password and initialized career profile.
    """
    existing_user = db.query(models.User).filter(models.User.email == user_in.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists. Please log in instead."
        )

    # Hash password securely
    hashed_pwd = get_password_hash(user_in.password)
    new_user = models.User(
        email=user_in.email.lower(),
        hashed_password=hashed_pwd,
        full_name=user_in.full_name,
        is_demo=False
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create empty starter profile
    starter_profile = models.Profile(
        user_id=new_user.id,
        headline="Software Engineer",
        education="Bachelor of Science",
        years_experience=1.5,
        skills=["Python", "JavaScript", "Git"],
        preferred_roles=["Full Stack Engineer", "Backend Engineer"],
        preferred_location="Remote / Hybrid",
        salary_min=85000,
        salary_max=125000,
        work_preference="Remote",
        resume_text="",
        completeness_score=50
    )
    db.add(starter_profile)
    db.commit()

    # Generate token
    token = create_access_token({"sub": str(new_user.id)})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": new_user
    }


@router.post("/login", response_model=schemas.TokenResponse)
def login(user_in: schemas.UserLogin, db: Session = Depends(get_db)):
    """
    Authenticate email and password.
    """
    user = db.query(models.User).filter(models.User.email == user_in.email.lower()).first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please check your credentials or use the Demo User option.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token({"sub": str(user.id)})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }


@router.post("/demo-login", response_model=schemas.TokenResponse)
def demo_login(db: Session = Depends(get_db)):
    """
    Instantly authenticates as the pre-configured CareerPilot Demo User.
    Allows instant exploration without typing credentials.
    """
    demo_user = db.query(models.User).filter(models.User.email == settings.DEMO_USER_EMAIL.lower()).first()
    
    # If database has not been seeded yet, auto-seed the demo user
    if not demo_user:
        hashed_pwd = get_password_hash(settings.DEMO_USER_PASSWORD)
        demo_user = models.User(
            email=settings.DEMO_USER_EMAIL.lower(),
            hashed_password=hashed_pwd,
            full_name="Alex Morgan (Demo Candidate)",
            is_demo=True
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)

        # Seed rich demo profile
        demo_profile = models.Profile(
            user_id=demo_user.id,
            headline="Full Stack Software Engineer | Python, React, FastAPI",
            education="B.S. in Computer Science - University of California",
            years_experience=2.5,
            skills=["Python", "FastAPI", "React", "TypeScript", "SQL", "Git", "Docker", "REST API", "Tailwind CSS"],
            preferred_roles=["Full Stack Engineer", "Backend Engineer", "Software Engineer"],
            preferred_location="San Francisco, CA (or Remote)",
            salary_min=110000,
            salary_max=145000,
            work_preference="Remote",
            resume_text=(
                "Alex Morgan\nFull Stack Developer with 2.5 years experience building web applications.\n"
                "Technologies: Python, FastAPI, React, TypeScript, SQL, Docker, Git.\n"
                "Experience: Software Engineer at CloudScale Tech (2024-Present). Built RESTful microservices, reduced API latency by 35%.\n"
                "Education: B.S. in Computer Science (2020-2024)."
            ),
            completeness_score=85
        )
        db.add(demo_profile)
        db.commit()

    token = create_access_token({"sub": str(demo_user.id)})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": demo_user
    }


@router.get("/me", response_model=schemas.UserOut)
def get_current_user_info(current_user: models.User = Depends(get_current_user)):
    """
    Return profile info for current authenticated user.
    """
    return current_user
