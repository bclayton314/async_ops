from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "AsyncOps API"
    environment: str = "development"
    debug: bool = False

    database_url: str = (
        "postgresql+psycopg://asyncops:asyncops@localhost:5432/asyncops"
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()