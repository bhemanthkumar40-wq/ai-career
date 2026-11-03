"""
Configuration settings for CareerPilot AI.
Loads settings from environment variables or .env file with safe defaults.
"""

import os
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    APP_NAME: str = "CareerPilot AI"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    HOST: str = "0.0.0.0"

    # Security
    SECRET_KEY: str = "careerpilot-super-secret-development-key-change-in-prod-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # Database
    DATABASE_URL: str = "sqlite:///./careerpilot.db"

    # Demo User Credentials
    DEMO_USER_EMAIL: str = "demo@careerpilot.ai"
    DEMO_USER_PASSWORD: str = "DemoPass123!"

    # AI Service Key (Optional)
    GEMINI_API_KEY: Optional[str] = None

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()
