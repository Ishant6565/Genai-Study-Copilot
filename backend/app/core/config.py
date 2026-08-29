import os
from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    APP_NAME: str = "StudyPilot AI"
    APP_VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Database Settings
    # Supports Postgres pgvector or sqlite for offline local testing
    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://postgres:postgres@localhost:5432/studypilot_db",
        description="Async database connection URL"
    )
    SYNC_DATABASE_URL: str = Field(
        default="postgresql://postgres:postgres@localhost:5432/studypilot_db",
        description="Sync database connection URL for migrations"
    )
    
    # Vector DB & Embeddings
    VECTOR_DIMENSION: int = 1536  # OpenAI text-embedding-3-small dimension
    TOP_K_RETRIEVAL: int = 4
    SIMILARITY_THRESHOLD: float = 0.55
    CHUNK_SIZE_TOKENS: int = 600
    CHUNK_OVERLAP_TOKENS: int = 100

    # OpenAI & LLM Settings
    OPENAI_API_KEY: str = Field(default="", description="OpenAI API Key")
    OPENAI_CHAT_MODEL: str = "gpt-4o-mini"
    OPENAI_EMBEDDING_MODEL: str = "text-embedding-3-small"
    USE_MOCK_LLM_IF_NO_KEY: bool = True

    # Security & JWT
    SECRET_KEY: str = "studypilot-super-secret-production-grade-key-change-in-prod-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Redis & Worker Settings
    REDIS_URL: str = "redis://localhost:6379/0"
    USE_REDIS_QUEUE: bool = False

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "*"
    ]

    # File Storage
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
    MAX_UPLOAD_SIZE_MB: int = 25

    # Demo Seed Credentials
    DEMO_USER_EMAIL: str = "demo@studypilot.ai"
    DEMO_USER_PASSWORD: str = "DemoStudy2026!"
    DEMO_USER_NAME: str = "Alex Chen"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()

# Ensure uploads directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
