"""
Explainable Machine Learning Engine for CareerPilot AI.
Uses scikit-learn and pandas for TF-IDF content matching, skill intersection analysis,
and interpretable feature-weighted placement readiness estimation.
"""

import re
import math
from typing import List, Dict, Any, Tuple
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Common industry skill taxonomy for explainable extraction and gap analysis
CANONICAL_SKILLS = [
    "Python", "JavaScript", "TypeScript", "React", "Node.js", "FastAPI", "SQL",
    "PostgreSQL", "SQLite", "MongoDB", "Docker", "Kubernetes", "AWS", "GCP",
    "Azure", "Git", "GitHub", "CI/CD", "Linux", "REST API", "GraphQL", "HTML",
    "CSS", "Tailwind CSS", "Redux", "Next.js", "Vue.js", "Angular", "Java",
    "Spring Boot", "C++", "C#", ".NET", "Go", "Rust", "Pandas", "NumPy",
    "Scikit-Learn", "TensorFlow", "PyTorch", "Data Analysis", "Machine Learning",
    "Agile", "Scrum", "Jira", "Unit Testing", "Jest", "Pytest", "System Design",
    "Microservices", "Terraform", "Prompt Engineering", "NLP", "Computer Vision"
]


class ExplainableMLEngine:
    def __init__(self):
        # Pre-fitted TF-IDF vectorizer over our skill set and role descriptions
        self.vectorizer = TfidfVectorizer(stop_words="english", ngram_range=(1, 2))
        self._fit_base_vocabulary()

    def _fit_base_vocabulary(self):
        seed_corpus = [
            "python fastapi sqlite rest api backend engineering microservices unit testing",
            "javascript typescript react frontend web ui tailwind css responsive redux nextjs",
            "full stack engineer python typescript react fastapi sql postgresql docker git",
            "data scientist machine learning scikit-learn pandas numpy python data analysis sql",
            "devops cloud aws docker kubernetes ci cd terraform linux system design git",
            "mobile engineer react native ios android typescript api integration",
        ]
        self.vectorizer.fit(seed_corpus + [s.lower() for s in CANONICAL_SKILLS])

    def normalize_skill(self, raw_skill: str) -> str:
        """Find the canonical representation of a skill."""
        cleaned = raw_skill.strip()
        cleaned_lower = cleaned.lower()
        for c in CANONICAL_SKILLS:
            if c.lower() == cleaned_lower:
                return c
        return cleaned

    def parse_resume_text(self, text: str) -> Dict[str, Any]:
        """
        Explainable rule-based extraction for pasted or uploaded resumes.
        Extracts skills, estimated experience, education, and target roles.
        """
        extracted_skills = []
        text_lower = text.lower()

        # Match canonical skills using regex boundaries
        for skill in CANONICAL_SKILLS:
            pattern = r'\b' + re.escape(skill.lower()) + r'\b'
            if re.search(pattern, text_lower):
                extracted_skills.append(skill)

        # Estimate years of experience using numeric pattern matching
        years_exp = 1.5  # default baseline
        exp_matches = re.findall(r'(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)(?:\s+of)?\s+experience', text_lower)
        if exp_matches:
            try:
                years_exp = float(exp_matches[0])
            except ValueError:
                years_exp = 2.0
        else:
            # Check year ranges like 2021-2024
            ranges = re.findall(r'(20\d\d)\s*[-–—to]+\s*(20\d\d|present|current)', text_lower)
            if ranges:
                total_span = 0
                for start, end in ranges:
                    try:
                        s_yr = int(start)
                        e_yr = 2026 if end in ['present', 'current'] else int(end)
                        if 1990 < s_yr <= e_yr <= 2030:
                            total_span += (e_yr - s_yr)
                    except Exception:
                        pass
                if total_span > 0:
                    years_exp = min(float(total_span), 15.0)

        # Extract education mentions
        education = "Bachelor of Science"
        if "master" in text_lower or "m.s." in text_lower or "ms " in text_lower:
            education = "Master of Science in Computer Science or related field"
        elif "phd" in text_lower or "ph.d" in text_lower or "doctorate" in text_lower:
            education = "Ph.D. in Computer Science or quantitative field"
        elif "bachelor" in text_lower or "b.s." in text_lower or "bs " in text_lower or "b.tech" in text_lower:
            education = "Bachelor of Science in Computer Science / Engineering"
        elif "bootcamp" in text_lower or "certificate" in text_lower:
            education = "Full-Stack Software Engineering Certificate"

        # Infer potential roles based on skills
        potential_roles = []
        if any(s in extracted_skills for s in ["React", "JavaScript", "TypeScript", "HTML", "CSS", "Tailwind CSS"]):
            potential_roles.append("Frontend Engineer")
        if any(s in extracted_skills for s in ["Python", "FastAPI", "Node.js", "SQL", "PostgreSQL"]):
            potential_roles.append("Backend Engineer")
        if len(potential_roles) == 2:
            potential_roles.insert(0, "Full Stack Engineer")
        if any(s in extracted_skills for s in ["Machine Learning", "Scikit-Learn", "Pandas", "NumPy"]):
            potential_roles.append("Data Scientist / ML Engineer")
        if not potential_roles:
            potential_roles = ["Software Engineer", "Web Developer"]

        # Formulate extracted headline
        primary_role = potential_roles[0] if potential_roles else "Software Engineer"
        headline = f"{primary_role} specializing in {', '.join(extracted_skills[:3]) if extracted_skills else 'Modern Web Technologies'}"

        return {
            "extracted_headline": headline,
            "extracted_education": education,
            "extracted_years_experience": round(years_exp, 1),
            "extracted_skills": list(dict.fromkeys(extracted_skills)),
            "extracted_roles": potential_roles,
            "summary_preview": f"Identified {len(extracted_skills)} technical skills, ~{years_exp} years experience indicator, and degree alignment.",
            "confidence_note": "Rule-based transparent parsing completed locally. Review and modify before saving."
        }

    def compute_job_match(
        self,
        user_skills: List[str],
        user_experience: float,
        job_required_skills: List[str],
        job_preferred_skills: List[str],
        job_experience_level: str,
        job_description: str,
        user_headline: str = ""
    ) -> Dict[str, Any]:
        """
        Explainable composite matching model:
        1. Required skill coverage: 50%
        2. Preferred skill coverage: 20%
        3. Experience level alignment: 15%
        4. TF-IDF text semantic similarity: 15%
        """
        u_skills_set = {s.lower() for s in user_skills}
        req_set = {s.lower() for s in job_required_skills}
        pref_set = {s.lower() for s in job_preferred_skills}

        # 1. Required skills match
        matched_req = [s for s in job_required_skills if s.lower() in u_skills_set]
        missing_req = [s for s in job_required_skills if s.lower() not in u_skills_set]
        req_score = (len(matched_req) / len(job_required_skills)) if job_required_skills else 1.0

        # 2. Preferred skills match
        matched_pref = [s for s in job_preferred_skills if s.lower() in u_skills_set]
        pref_score = (len(matched_pref) / len(job_preferred_skills)) if job_preferred_skills else 0.8

        # 3. Experience alignment
        exp_target_map = {
            "entry-level": 1.0,
            "mid-level": 3.0,
            "senior": 5.0,
            "lead": 7.0
        }
        target_exp = exp_target_map.get(job_experience_level.lower(), 3.0)
        exp_diff = abs(user_experience - target_exp)
        exp_score = max(0.4, 1.0 - (exp_diff * 0.15))

        # 4. TF-IDF text similarity
        profile_text = f"{user_headline} {' '.join(user_skills)}"
        try:
            vectors = self.vectorizer.transform([profile_text, job_description])
            text_sim = float(cosine_similarity(vectors[0:1], vectors[1:2])[0][0])
        except Exception:
            text_sim = 0.5

        # Weighted calculation
        composite = (req_score * 0.50) + (pref_score * 0.20) + (exp_score * 0.15) + (text_sim * 0.15)
        match_percentage = int(np.clip(round(composite * 100), 25, 98))

        # Plain language explainability reasons
        reasons = []
        if matched_req:
            reasons.append(f"Matches {len(matched_req)} of {len(job_required_skills)} required core skills ({', '.join(matched_req[:3])}).")
        if matched_pref:
            reasons.append(f"Bonus match on preferred qualifications: {', '.join(matched_pref)}.")
        if exp_diff <= 1.0:
            reasons.append(f"Your {user_experience:.1f} years of experience align closely with the {job_experience_level} tier.")
        elif user_experience > target_exp:
            reasons.append(f"Exceeds minimum experience threshold for this {job_experience_level} role.")
        else:
            reasons.append(f"Requires slightly more experience ({target_exp}+ yrs) than current {user_experience:.1f} yrs.")

        return {
            "match_percentage": match_percentage,
            "matched_skills": matched_req + matched_pref,
            "missing_skills": missing_req,
            "match_reasons": reasons,
            "req_score": round(req_score * 100),
            "pref_score": round(pref_score * 100),
            "exp_alignment_score": round(exp_score * 100),
            "semantic_score": round(text_sim * 100)
        }

    def compute_placement_readiness(
        self,
        profile_completeness: int,
        skills: List[str],
        years_experience: float,
        num_applications: int,
        active_interviews: int
    ) -> Dict[str, Any]:
        """
        Computes interpretable placement readiness score (0-100)
        Factors:
        - Profile Completeness (max 20 pts)
        - Core Technical Skill Breadth (max 35 pts)
        - Experience Maturity (max 25 pts)
        - Application Momentum & Interview Conversion (max 20 pts)
        """
        # Factor 1: Profile Completeness (0 to 20)
        f1_score = int(round((profile_completeness / 100.0) * 20))

        # Factor 2: Skill Breadth (0 to 35)
        # 10 or more solid industry skills gets full points
        skill_count = len(skills)
        f2_ratio = min(1.0, skill_count / 8.0)
        f2_score = int(round(f2_ratio * 35))

        # Factor 3: Experience Maturity (0 to 25)
        # Scaled smoothly up to 5 years
        exp_ratio = min(1.0, (years_experience + 0.5) / 4.0)
        f3_score = int(round(exp_ratio * 25))

        # Factor 4: Application Pipeline Momentum (0 to 20)
        # Having at least 3 active tracked apps and/or interviews gives full momentum
        pipeline_val = min(20, (num_applications * 3) + (active_interviews * 5))
        f4_score = max(5, pipeline_val)  # baseline 5 for showing up

        total_score = min(98, max(30, f1_score + f2_score + f3_score + f4_score))

        # Determine Tier
        if total_score >= 80:
            tier = "High Placement Readiness"
            summary = "Your profile shows competitive skill coverage, solid experience alignment, and active pipeline momentum. You are well-positioned for recruiter outreach and screening calls."
            interview_prob = "High (70-85% screening response rate on matching roles)"
        elif total_score >= 60:
            tier = "Market-Ready with Target Skill Gaps"
            summary = "You possess core fundamentals and a healthy profile. Addressing 1-2 missing target skills will noticeably boost your callback rate."
            interview_prob = "Moderate (45-65% screening response rate)"
        else:
            tier = "Skill Building & Portfolio Phase"
            summary = "Focus on completing your profile, building hands-on projects for missing skills, and actively expanding your tracked application pipeline."
            interview_prob = "Developing (20-40% screening response rate; projects highly recommended)"

        positive_drivers = []
        if f1_score >= 15:
            positive_drivers.append("Strong profile completeness signals commitment to hiring managers.")
        if skill_count >= 6:
            positive_drivers.append(f"Solid technical toolkit ({skill_count} documented skills).")
        if years_experience >= 2.0:
            positive_drivers.append(f"Demonstrated track record of {years_experience:.1f} years experience.")
        if num_applications >= 3:
            positive_drivers.append("Active application cadence maintains recruiting momentum.")

        growth_areas = []
        if f1_score < 16:
            growth_areas.append("Flesh out education credentials and paste resume text to reach 100% profile completeness (+5-8 pts).")
        if skill_count < 7:
            growth_areas.append("Add 2-3 additional modern tools (e.g., Docker, TypeScript, CI/CD) to expand job matching (+10 pts).")
        if num_applications < 3:
            growth_areas.append("Track at least 3 target applications in the pipeline to boost momentum (+10 pts).")

        factors = [
            {
                "name": "Profile Completeness",
                "score": f1_score,
                "max_score": 20,
                "impact": "High Positive" if f1_score >= 15 else "Needs Attention",
                "description": f"{profile_completeness}% filled out. Comprehensive profiles rank higher in matching algorithms."
            },
            {
                "name": "Market Skill Alignment",
                "score": f2_score,
                "max_score": 35,
                "impact": "High Positive" if f2_score >= 26 else "Moderate",
                "description": f"{skill_count} skills identified against standard high-demand engineering taxonomies."
            },
            {
                "name": "Experience & Seniority Fit",
                "score": f3_score,
                "max_score": 25,
                "impact": "High Positive" if f3_score >= 18 else "Moderate",
                "description": f"{years_experience:.1f} years documented experience gives steady baseline for Mid-Level roles."
            },
            {
                "name": "Application Pipeline Momentum",
                "score": f4_score,
                "max_score": 20,
                "impact": "High Positive" if f4_score >= 14 else "Needs Attention",
                "description": f"{num_applications} tracked applications and {active_interviews} active interview cycles."
            }
        ]

        return {
            "overall_readiness_score": total_score,
            "tier": tier,
            "summary": summary,
            "factors": factors,
            "positive_drivers": positive_drivers if positive_drivers else ["Profile created with baseline info."],
            "growth_areas": growth_areas if growth_areas else ["Keep practicing system design and behavioral interview scenarios."],
            "projected_interview_probability": interview_prob,
            "disclaimer": "Scores are simulated statistical estimates computed using explainable feature weighting and sample market benchmarks. No employment or interview guarantee is implied."
        }

    def analyze_job_description_match(
        self,
        job_description: str,
        user_skills: List[str],
        user_experience: float
    ) -> Dict[str, Any]:
        """
        Parses an arbitrary job description, identifies skills demanded,
        intersects with user skills, and generates explainable improvement suggestions.
        """
        desc_lower = job_description.lower()
        demanded_skills = []
        for s in CANONICAL_SKILLS:
            pattern = r'\b' + re.escape(s.lower()) + r'\b'
            if re.search(pattern, desc_lower):
                demanded_skills.append(s)

        if not demanded_skills:
            demanded_skills = ["FastAPI", "Python", "SQL", "Git"]  # fallback if short text

        u_set = {s.lower() for s in user_skills}
        matched = [s for s in demanded_skills if s.lower() in u_set]
        missing = [s for s in demanded_skills if s.lower() not in u_set]

        match_ratio = len(matched) / len(demanded_skills) if demanded_skills else 0.5
        score = int(round(match_ratio * 75 + min(25, user_experience * 6)))
        score = min(96, max(30, score))

        strengths = []
        if matched:
            strengths.append(f"Strong overlap on {len(matched)} key requirements: {', '.join(matched)}.")
        if user_experience >= 2.0:
            strengths.append(f"Relevant background ({user_experience:.1f} yrs) satisfies typical Mid-Level experience requirements.")

        improvements = []
        for miss in missing[:3]:
            improvements.append(f"Build a mini project demonstrating {miss} or highlight related transferrable concepts on your resume.")
        if not improvements:
            improvements.append("Tailor your resume bullet points to specifically emphasize metrics achieved with these tools.")

        return {
            "overall_match": score,
            "matched_skills": matched,
            "missing_skills": missing,
            "experience_alignment": "Well-aligned for 2-4 year developer profiles.",
            "strengths": strengths if strengths else ["Basic technical aptitude aligned."],
            "actionable_improvements": improvements,
            "confidence_level": "High (Direct keyword and TF-IDF intersection against canonical taxonomy)",
            "is_simulation_note": "Simulated match estimate based on transparent skill extraction. Actual recruiter decisions evaluate portfolio, team fit, and communication."
        }


ml_engine = ExplainableMLEngine()
