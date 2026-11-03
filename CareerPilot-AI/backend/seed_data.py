"""
Database Seeding Script for CareerPilot AI.
Populates realistic sample tech jobs, demo user, profile, applications, and learning roadmap.
Clearly labels all synthetic sample data.
"""

import sys
import os
from sqlalchemy.orm import Session

# Add project root to Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app.database import SessionLocal, Base, engine
from backend.app import models
from backend.app.auth import get_password_hash
from backend.app.config import settings

SAMPLE_JOBS = [
    {
        "title": "Full Stack Engineer (Python & React)",
        "company": "Apex Cloud Systems",
        "location": "San Francisco, CA (Remote)",
        "work_type": "Remote",
        "experience_level": "Mid-Level",
        "salary_min": 115000,
        "salary_max": 145000,
        "description": "Apex Cloud is seeking a Full Stack Engineer to architect data-rich dashboards and scalable microservices. You will collaborate directly with product designers to ship responsive React frontends and high-throughput FastAPI backend endpoints.",
        "department": "Engineering",
        "required_skills": ["Python", "FastAPI", "React", "TypeScript", "SQL"],
        "preferred_skills": ["Docker", "Tailwind CSS", "Redis", "Unit Testing"],
        "posted_date": "2 days ago",
        "is_sample": True
    },
    {
        "title": "Backend API Developer",
        "company": "Horizon Financial Data",
        "location": "New York, NY (Hybrid)",
        "work_type": "Hybrid",
        "experience_level": "Mid-Level",
        "salary_min": 120000,
        "salary_max": 150000,
        "description": "Design and maintain resilient data ingestion pipelines and REST APIs serving institutional investors. Strong command of relational databases and asynchronous Python or Node.js required.",
        "department": "Core Infrastructure",
        "required_skills": ["Python", "FastAPI", "PostgreSQL", "REST API", "Git"],
        "preferred_skills": ["Docker", "Kubernetes", "AWS", "CI/CD"],
        "posted_date": "3 days ago",
        "is_sample": True
    },
    {
        "title": "Frontend Engineer (React & Modern UI)",
        "company": "Lumina Creative Studio",
        "location": "Austin, TX (Remote)",
        "work_type": "Remote",
        "experience_level": "Mid-Level",
        "salary_min": 105000,
        "salary_max": 135000,
        "description": "Craft pixel-perfect, accessible user interfaces for our design workflow platform. You will work closely with UX researchers to implement fluid animations, micro-interactions, and robust state machines.",
        "department": "Product Experience",
        "required_skills": ["React", "JavaScript", "TypeScript", "Tailwind CSS", "HTML", "CSS"],
        "preferred_skills": ["Next.js", "Redux", "Jest", "Figma"],
        "posted_date": "Just now",
        "is_sample": True
    },
    {
        "title": "Junior-to-Mid Software Engineer",
        "company": "Vanguard Health Tech",
        "location": "Boston, MA (On-site)",
        "work_type": "On-site",
        "experience_level": "Entry-Level",
        "salary_min": 85000,
        "salary_max": 110000,
        "description": "Join our collaborative engineering cohort building patient-care coordination software. Comprehensive mentorship provided with rotations across web frontend, data pipelines, and security compliance.",
        "department": "Clinical Systems",
        "required_skills": ["Python", "JavaScript", "SQL", "Git"],
        "preferred_skills": ["FastAPI", "React", "Linux"],
        "posted_date": "4 days ago",
        "is_sample": True
    },
    {
        "title": "Machine Learning & Data Applications Engineer",
        "company": "Synthetix Intelligence",
        "location": "Seattle, WA (Remote)",
        "work_type": "Remote",
        "experience_level": "Senior",
        "salary_min": 140000,
        "salary_max": 180000,
        "description": "Deploy explainable machine learning models and LLM-assisted workflows to production. Build ETL pipelines using Pandas, scikit-learn, and vector indexing services.",
        "department": "AI Labs",
        "required_skills": ["Python", "Machine Learning", "Scikit-Learn", "Pandas", "SQL"],
        "preferred_skills": ["FastAPI", "Docker", "PyTorch", "Prompt Engineering"],
        "posted_date": "5 days ago",
        "is_sample": True
    },
    {
        "title": "DevOps & Cloud Systems Engineer",
        "company": "Stratus Systems",
        "location": "Chicago, IL (Hybrid)",
        "work_type": "Hybrid",
        "experience_level": "Mid-Level",
        "salary_min": 125000,
        "salary_max": 155000,
        "description": "Automate infrastructure deployment, monitor service reliability, and manage containerized environments across multi-region cloud clusters.",
        "department": "Platform Reliability",
        "required_skills": ["Docker", "Kubernetes", "Linux", "Git", "CI/CD"],
        "preferred_skills": ["AWS", "Terraform", "Python", "Prometheus"],
        "posted_date": "1 week ago",
        "is_sample": True
    }
]


def seed_sample_database(db: Session):
    """Populates initial sample database records if not already present."""
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)

    # 1. Seed Jobs
    existing_jobs_count = db.query(models.Job).count()
    if existing_jobs_count == 0:
        for job_data in SAMPLE_JOBS:
            j = models.Job(
                title=job_data["title"],
                company=job_data["company"],
                location=job_data["location"],
                work_type=job_data["work_type"],
                experience_level=job_data["experience_level"],
                salary_min=job_data["salary_min"],
                salary_max=job_data["salary_max"],
                description=job_data["description"],
                department=job_data["department"],
                required_skills=job_data["required_skills"],
                preferred_skills=job_data["preferred_skills"],
                posted_date=job_data["posted_date"],
                is_sample=True
            )
            db.add(j)
        db.commit()
        print(f"✓ Seeded {len(SAMPLE_JOBS)} sample job listings.")

    # 2. Seed Demo User
    demo_email = settings.DEMO_USER_EMAIL.lower()
    demo_user = db.query(models.User).filter(models.User.email == demo_email).first()
    if not demo_user:
        hashed_pwd = get_password_hash(settings.DEMO_USER_PASSWORD)
        demo_user = models.User(
            email=demo_email,
            hashed_password=hashed_pwd,
            full_name="Alex Morgan (Demo Candidate)",
            is_demo=True
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)

        # 3. Seed Demo Profile
        profile = models.Profile(
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
                "Alex Morgan - Full Stack Software Engineer\n"
                "Email: alex.morgan@example.com | Portfolio: github.com/alexmorgan\n\n"
                "SUMMARY:\n"
                "Software Engineer with 2.5 years of hands-on experience building performant web applications using Python, FastAPI, and React. Strong focus on clean architecture, responsive UI, and RESTful APIs.\n\n"
                "EXPERIENCE:\n"
                "Software Engineer - CloudScale Tech (2024 - Present)\n"
                "- Engineered 12+ RESTful FastAPI microservices handling 2M+ monthly requests.\n"
                "- Built responsive React dashboards using TypeScript and Tailwind CSS, increasing user session length by 24%.\n"
                "- Integrated Dockerized CI/CD testing pipelines in GitHub Actions.\n\n"
                "Junior Developer - DataPulse Labs (2023 - 2024)\n"
                "- Developed interactive data visualizations and backend database queries in SQLite and PostgreSQL.\n\n"
                "EDUCATION:\n"
                "Bachelor of Science in Computer Science (2019 - 2023)"
            ),
            completeness_score=85
        )
        db.add(profile)
        db.commit()

        # 4. Seed Demo Applications
        jobs = db.query(models.Job).all()
        if jobs:
            apps = [
                models.Application(
                    user_id=demo_user.id,
                    job_id=jobs[0].id,
                    company_name=jobs[0].company,
                    job_title=jobs[0].title,
                    status="interview",
                    applied_date="2026-10-18",
                    follow_up_date="2026-11-06",
                    notes="Completed technical take-home project. System architecture interview scheduled with VP of Engineering.",
                    salary_offered=135000
                ),
                models.Application(
                    user_id=demo_user.id,
                    job_id=jobs[1].id,
                    company_name=jobs[1].company,
                    job_title=jobs[1].title,
                    status="applied",
                    applied_date="2026-10-25",
                    follow_up_date="2026-11-08",
                    notes="Applied via direct referral. Recruiter indicated initial review is underway."
                ),
                models.Application(
                    user_id=demo_user.id,
                    job_id=jobs[2].id,
                    company_name=jobs[2].company,
                    job_title=jobs[2].title,
                    status="saved",
                    applied_date="",
                    follow_up_date="",
                    notes="Matches 92% of frontend skills. Need to review portfolio link before submitting application."
                )
            ]
            for a in apps:
                db.add(a)
            db.commit()

        # 5. Seed Demo Learning Items
        learning_items = [
            models.LearningItem(
                user_id=demo_user.id,
                skill_name="Docker Multi-Stage Builds & Orchestration",
                priority="critical",
                estimated_hours=10,
                category="DevOps & Infrastructure",
                recommended_resource="Official Docker Docs & building an end-to-end containerized FastAPI/Postgres sandbox",
                status="in_progress"
            ),
            models.LearningItem(
                user_id=demo_user.id,
                skill_name="TypeScript Advanced Generics & Utility Types",
                priority="high",
                estimated_hours=6,
                category="Frontend Architecture",
                recommended_resource="TypeScript Handbook: ReturnType, Pick, Omit, and Conditional Types",
                status="completed"
            ),
            models.LearningItem(
                user_id=demo_user.id,
                skill_name="System Design: Caching with Redis & Rate Limiting",
                priority="medium",
                estimated_hours=8,
                category="Backend Architecture",
                recommended_resource="Designing Data-Intensive Applications (Chapters 4 & 5)",
                status="not_started"
            )
        ]
        for item in learning_items:
            db.add(item)
        db.commit()

        # 6. Seed Saved Job
        if jobs:
            sj = models.SavedJob(user_id=demo_user.id, job_id=jobs[2].id)
            db.add(sj)
            db.commit()

        print("✓ Seeded demo user (demo@careerpilot.ai), profile, applications, and learning roadmap.")


if __name__ == "__main__":
    db = SessionLocal()
    try:
        print("🌱 Seeding CareerPilot AI database...")
        seed_sample_database(db)
        print("🎉 Database seeding complete! Run: uvicorn backend.app.main:app --reload")
    finally:
        db.close()
