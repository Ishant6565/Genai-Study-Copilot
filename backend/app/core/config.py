import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "MyAppMyWeb - Autonomous SWE Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # AI API Keys
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY", "")
    ANTHROPIC_API_KEY: Optional[str] = os.getenv("ANTHROPIC_API_KEY", "")
    
    # Sandboxing & Execution
    SANDBOX_TIMEOUT_SECONDS: int = 30
    SANDBOX_MEMORY_LIMIT: str = "512m"
    USE_DOCKER_SANDBOX: bool = False  # Can be toggled to True when Docker daemon is available
    
    # Workspace & Outputs
    WORKSPACE_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "workspaces")
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()

os.makedirs(settings.WORKSPACE_DIR, exist_ok=True)
