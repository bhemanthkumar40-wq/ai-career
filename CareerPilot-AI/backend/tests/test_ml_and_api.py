"""
Unit and integration tests for CareerPilot AI ML engine and API logic.
Run with: pytest backend/tests
"""

import pytest
from backend.app.ml_engine import ml_engine


def test_ml_engine_resume_parsing():
    sample_resume = """
    Jane Doe - Full Stack Developer
    5 years of experience building web applications.
    Skills: Python, React, TypeScript, Docker, SQL, Git, FastAPI.
    Education: Bachelor of Science in Computer Science, 2019-2023.
    """
    parsed = ml_engine.parse_resume_text(sample_resume)
    assert "Python" in parsed["extracted_skills"]
    assert "React" in parsed["extracted_skills"]
    assert parsed["extracted_years_experience"] >= 4.0
    assert "Software Engineer" in parsed["extracted_headline"] or "Full Stack" in parsed["extracted_headline"]


def test_ml_engine_job_match_calculation():
    user_skills = ["Python", "FastAPI", "React", "TypeScript", "SQL"]
    job_req = ["Python", "FastAPI", "PostgreSQL"]
    job_pref = ["Docker", "React"]

    match_info = ml_engine.compute_job_match(
        user_skills=user_skills,
        user_experience=3.0,
        job_required_skills=job_req,
        job_preferred_skills=job_pref,
        job_experience_level="Mid-Level",
        job_description="Seeking a backend Python developer with FastAPI experience.",
        user_headline="Full Stack Engineer"
    )

    assert match_info["match_percentage"] >= 60
    assert "Python" in match_info["matched_skills"]
    assert "FastAPI" in match_info["matched_skills"]
    assert len(match_info["match_reasons"]) > 0


def test_placement_readiness_score():
    readiness = ml_engine.compute_placement_readiness(
        profile_completeness=85,
        skills=["Python", "FastAPI", "React", "TypeScript", "SQL", "Docker", "Git"],
        years_experience=2.5,
        num_applications=4,
        active_interviews=1
    )
    assert 50 <= readiness["overall_readiness_score"] <= 100
    assert len(readiness["factors"]) == 4
    assert len(readiness["positive_drivers"]) > 0
    assert "disclaimer" in readiness


def test_job_description_gap_analyzer():
    desc = """
    We are looking for a Senior DevOps engineer with deep experience in Kubernetes, Docker, Terraform, and CI/CD.
    """
    user_skills = ["Docker", "Python", "Git"]
    analysis = ml_engine.analyze_job_description_match(
        job_description=desc,
        user_skills=user_skills,
        user_experience=2.0
    )
    assert "Docker" in analysis["matched_skills"]
    assert "Kubernetes" in analysis["missing_skills"]
    assert len(analysis["actionable_improvements"]) > 0
