from typing import Optional

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
        extra="ignore",
    )

    # FastAPI
    environment: str = "development"
    debug: bool = True
    api_host: str = "0.0.0.0"
    api_port: int = 8000

    # LLM
    llm_provider: str = "openrouter"
    llm_model: str = "openai/gpt-3.5-turbo"
    llm_api_key: str = ""
    llm_api_base_url: str = "https://openrouter.ai/api/v1"
    llm_limits_response_mode: str = "safe"

    # Database
    database_url: str = ""
    database_echo: bool = False
    postgres_host: str = ""
    postgres_port: int = 5432
    postgres_db: str = ""
    postgres_user: str = ""
    postgres_password: str = ""
    pdlc_db_name: str = ""
    pdlc_db_schema: str = "ai_pdlc"
    pdlc_db_user: str = ""
    pdlc_db_password: str = ""

    # Qdrant
    qdrant_url: str = "http://localhost:6333"
    qdrant_api_key: Optional[str] = None

    # Embedding Model
    embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"
    embedding_dimension: int = 384

    # Observability
    log_level: str = "INFO"
    enable_request_logging: bool = True

    # Security
    enable_guardrails: bool = True
    enable_prompt_injection_check: bool = True
    enable_secrets_check: bool = True
    enable_pii_masking: bool = True

    # Features
    enable_rag: bool = False
    enable_metrics_dashboard: bool = False
    enable_human_approval: bool = True

    # UI
    ui_host: str = "0.0.0.0"
    ui_port: int = 3000

    @field_validator("debug", mode="before")
    @classmethod
    def parse_debug(cls, value):
        if isinstance(value, bool):
            return value
        if value is None:
            return False
        if isinstance(value, str):
            normalized = value.strip().lower()
            if normalized in {"1", "true", "yes", "on", "debug", "development"}:
                return True
            if normalized in {"0", "false", "no", "off", "release", "production"}:
                return False
        return value

    @field_validator("llm_limits_response_mode", mode="before")
    @classmethod
    def parse_llm_limits_response_mode(cls, value):
        if value is None:
            return "safe"

        normalized = str(value).strip().lower()
        if normalized in {"safe", "full"}:
            return normalized

        return "safe"

settings = Settings()
