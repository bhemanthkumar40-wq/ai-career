# CareerPilot AI 🚀

> **AI-Powered Job & Career Discovery Platform**  
> Explainable placement readiness scoring, transparent content-based job matching, interactive career assistant, and proactive application pipeline management.

---

## 🧭 Overview

**CareerPilot AI** helps job seekers navigate technical hiring markets with clarity and confidence. Rather than acting as an opaque "black-box" model, CareerPilot AI uses transparent formulas, `scikit-learn` TF-IDF semantic matching, and explicit skill-gap extraction so candidates understand *why* they matched a position and *how* to improve their callback rates.

### Core Features

1. **Explainable Placement Readiness Score (0–100)**:
   - Evaluates 4 transparent factors: Profile Completeness (20%), Market Skill Alignment (35%), Experience Fit (25%), and Pipeline Momentum (20%).
   - Surfaces positive hiring drivers and prioritized growth areas with estimated callback probabilities.
2. **Job Discovery & Content-Based Matching**:
   - Matches candidate skills, seniority, and preferences against job listings using scikit-learn cosine similarity and Jaccard skill intersection.
   - Highlights required skills, preferred qualifications, and exact missing capabilities on every job card.
3. **Real-Time Job Description Match Tool**:
   - Paste any external job description to immediately extract required skills, analyze profile alignment, and receive actionable resume adjustments.
4. **Local Resume Parser**:
   - Paste or upload raw resume text. Our local extractor identifies skills, degrees, and estimated years of experience for review before updating the profile.
5. **Interactive Career Assistant**:
   - Chat advisor for Google XYZ resume bullet refinement, STAR behavioral interview questions, and salary negotiation tactics.
   - Powered by Google AI Studio's **Gemini 3.8 Flash** API when configured, with seamless fallback to an intelligent local career coaching knowledge base.
6. **Application Pipeline Tracker (Kanban Board)**:
   - Organize job search across 5 stages: *Saved*, *Applied*, *Interview*, *Offer*, and *Rejected* with notes and follow-up reminders.
7. **Prioritized Learning Plan**:
   - Dynamic roadmap bridging identified skill gaps with estimated hours of study and curated resources.

---

## 🔑 Demo Login Credentials

The application is pre-seeded with a comprehensive demo candidate account so you can explore all features immediately:

- **Email**: `demo@careerpilot.ai`
- **Password**: `DemoPass123!`
- **One-Click Demo Button**: You can also click the **"Demo User"** or **"Continue as Demo Candidate"** button on the landing or login screen to authenticate instantly without typing credentials.

> ⚠️ **Security Warning**: The demo credentials above are for local evaluation and testing only. Always change default passwords and set a unique `SECRET_KEY` in `.env` before deploying to any production environment.

---

## 🛠️ Tech Stack

- **Backend**: Python 3.10+, [FastAPI](https://fastapi.tiangolo.com/), [Uvicorn](https://www.uvicorn.org/)
- **Database & ORM**: SQLite (`careerpilot.db`), [SQLAlchemy 2.0](https://www.sqlalchemy.org/)
- **Data & ML**: [scikit-learn](https://scikit-learn.org/) (TF-IDF vectorization, cosine similarity), [Pandas](https://pandas.pydata.org/), NumPy
- **Security**: Passlib with Bcrypt password hashing, Python-Jose (JWT tokens)
- **AI Integration**: Google GenAI SDK (`google-genai` for `gemini-3.8-flash`)
- **Frontend**: HTML5, Modern CSS (Design tokens, responsive grid/flexbox, custom animations), Vanilla JavaScript (ES modules)

---

## 📁 Project Directory Structure

```text
CareerPilot-AI/
├── .vscode/
│   ├── launch.json              # VS Code debug launcher for FastAPI & seed script
│   └── settings.json            # VS Code Python environment & formatting settings
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI application entry point, CORS, static mounting
│   │   ├── config.py            # Pydantic settings & environment configuration
│   │   ├── database.py          # SQLite engine & SQLAlchemy session provider
│   │   ├── models.py            # User, Profile, Job, Application, LearningItem models
│   │   ├── schemas.py           # Pydantic request/response validation schemas
│   │   ├── auth.py              # Password hashing & JWT token verification
│   │   ├── ml_engine.py         # scikit-learn TF-IDF engine, scoring & resume parser
│   │   ├── gemini_service.py    # Gemini 3.8 Flash caller & local coaching engine
│   │   └── routers/
│   │       ├── auth.py          # Registration, login, demo-login, user info
│   │       ├── profile.py       # Candidate profile CRUD & resume parsing
│   │       ├── jobs.py          # Job discovery, multi-filter search & bookmarks
│   │       ├── recommendations.py # ML recommendations & JD match analyzer
│   │       ├── readiness.py     # Explainable placement readiness score endpoint
│   │       ├── applications.py  # Application tracker pipeline CRUD
│   │       ├── learning.py      # Skill gap learning roadmap CRUD
│   │       └── assistant.py     # Career coaching chat endpoint
│   ├── seed_data.py             # Realistic tech job listings & demo candidate seed script
│   └── tests/
│       └── test_ml_and_api.py   # Pytest unit tests for ML matching & endpoints
├── frontend/
│   ├── index.html               # Main single-page application entry point
│   ├── css/
│   │   └── styles.css           # Navy/Violet/Teal career-tech design system
│   └── js/
│       ├── api.js               # API client with JWT storage & HTTP handlers
│       ├── components.js        # Reusable job cards, readiness gauge & toast alerts
│       └── app.js               # SPA router, form controllers & chat assistant
├── .env.example                 # Environment variables template
├── .gitignore                   # Python venv, SQLite db, cache ignores
├── requirements.txt             # Python dependencies
└── README.md                    # Setup documentation & user guide
```

---

## 🚀 Quickstart: Running in Visual Studio Code

### 1. Open the Project in VS Code
Open Visual Studio Code, select **File > Open Folder...**, and select the extracted `CareerPilot-AI` folder.

### 2. Create and Activate a Python Virtual Environment
Open the built-in terminal (`Ctrl + \`` or `Cmd + \``):

```bash
# Create virtual environment
python3 -m venv .venv

# Activate virtual environment
# On macOS / Linux:
source .venv/bin/activate
# On Windows PowerShell:
.venv\Scripts\Activate.ps1
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Environment
Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```

*(Optional)* To enable live Gemini AI in the career assistant, open `.env` and set:
```ini
GEMINI_API_KEY="your-google-gemini-api-key"
```
If left blank, CareerPilot AI will automatically use its built-in local career advisor.

### 5. Seed Initial Data
Initialize SQLite tables and populate realistic sample jobs and demo candidate data:
```bash
python -m backend.seed_data
```

### 6. Run the Application
Start the Uvicorn web server:
```bash
uvicorn backend.app.main:app --reload --port 8000
```
Open **[http://localhost:8000](http://localhost:8000)** in your web browser!

> 💡 **Tip**: You can also press **F5** in VS Code to run or debug using the pre-configured `.vscode/launch.json` profile!

---

## 🧪 Running Automated Tests

Run the test suite with pytest:
```bash
pytest backend/tests -v
```

---

## 📡 API Route Overview

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Create a new candidate account & profile | No |
| `POST` | `/api/auth/login` | Email/password authentication, returns JWT | No |
| `POST` | `/api/auth/demo-login` | Instant demo candidate session | No |
| `GET` | `/api/auth/me` | Fetch current authenticated user info | Yes |
| `GET` | `/api/profile` | Retrieve candidate profile & preferences | Yes |
| `PUT` | `/api/profile` | Update profile fields & recalculate completeness | Yes |
| `POST` | `/api/profile/parse-resume` | Extract skills, education & years from resume text | Yes |
| `GET` | `/api/jobs` | Search & filter jobs with ML match percentages | Yes |
| `POST` | `/api/jobs/{id}/toggle-save` | Save or unsave a job bookmark | Yes |
| `GET` | `/api/jobs/saved` | List bookmarked jobs | Yes |
| `GET` | `/api/recommendations` | Top scored recommendations via TF-IDF | Yes |
| `POST` | `/api/recommendations/analyze-description`| Analyze custom pasted job description | Yes |
| `GET` | `/api/readiness` | Explainable placement readiness score & drivers | Yes |
| `GET` | `/api/applications` | List tracked job applications | Yes |
| `POST` | `/api/applications` | Add application to pipeline | Yes |
| `PUT` | `/api/applications/{id}` | Update stage (applied, interview, offer, etc.) | Yes |
| `DELETE`| `/api/applications/{id}` | Remove application | Yes |
| `GET` | `/api/learning-plan` | List prioritized skill roadmap items | Yes |
| `PUT` | `/api/learning-plan/{id}` | Update study status (in_progress, completed) | Yes |
| `POST` | `/api/assistant/chat` | AI Career Advisor chat (Gemini / Local Coach) | Yes |

---

## 🧠 Explainable Machine Learning & Model Assumptions

1. **Placement Readiness Estimator**:
   - **Formula**:
     $$\text{Readiness} = w_1 \cdot \text{ProfileCompleteness} + w_2 \cdot \text{SkillAlignment} + w_3 \cdot \text{ExperienceFit} + w_4 \cdot \text{PipelineMomentum}$$
   - Weights: $w_1 = 0.20$, $w_2 = 0.35$, $w_3 = 0.25$, $w_4 = 0.20$.
   - **Why this matters**: Rather than an uninterpretable neural network, candidates can inspect the exact breakdown of their score into actionable sub-factors.
2. **Job Match Calculation**:
   - Computes weighted overlap between candidate skills and required/preferred job qualifications, penalized for seniority mismatch, and boosted by scikit-learn TF-IDF cosine similarity between profile summary and job description text.
3. **Data Authenticity Disclaimer**:
   - All bundled jobs and placement predictions are clearly labeled as **simulated sample data**. CareerPilot AI makes no guaranteed claim of employment.

---

## 🔄 Replacing Sample Data with Real Job Feeds

To transition from the bundled sample database to a live job feed (e.g., Greenhouse, Lever, Indeed, or LinkedIn API):

1. **Implement an Ingestion Worker**:
   Create a script in `backend/ingestion/` that fetches listings from your partner API and maps fields to `backend.app.models.Job`:
   ```python
   new_job = Job(
       title=external_job["title"],
       company=external_job["company"],
       location=external_job["location"],
       work_type=external_job["work_type"],
       description=external_job["description"],
       required_skills=ml_engine.extract_skills(external_job["description"]),
       is_sample=False  # Mark as verified live job
   )
   ```
2. **Schedule Periodic Sync**:
   Run the ingestion worker as a background cron or Celery/APScheduler task to pull updated postings every 6–12 hours.

---

## 📄 License
Apache License 2.0. Built for career navigators and tech job seekers everywhere.
