"""
CareerPilot AI - FastAPI Application Entry Point
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from backend.app.config import settings
from backend.app.database import engine, Base, SessionLocal
from backend.app.routers import auth, profile, jobs, recommendations, readiness, applications, learning, assistant
from backend.seed_data import seed_sample_database

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="Explainable AI Career & Job Discovery Platform with FastAPI, scikit-learn, and SQLite."
)

# Enable CORS for local cross-origin development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(jobs.router)
app.include_router(recommendations.router)
app.include_router(readiness.router)
app.include_router(applications.router)
app.include_router(learning.router)
app.include_router(assistant.router)


@app.on_event("startup")
def on_startup():
    """Ensure database has initial sample jobs and demo user on first boot."""
    db = SessionLocal()
    try:
        seed_sample_database(db)
    finally:
        db.close()


@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "database": "SQLite (careerpilot.db)",
        "gemini_configured": bool(settings.GEMINI_API_KEY)
    }


# Mount frontend static directory if exists
frontend_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "frontend")
if os.path.exists(frontend_dir):
    app.mount("/static", StaticFiles(directory=frontend_dir), name="static")

    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):
        # Serve index.html for root or SPA paths
        file_path = os.path.join(frontend_dir, full_path)
        if full_path and os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dir, "index.html"))
