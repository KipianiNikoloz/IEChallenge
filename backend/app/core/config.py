from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    project_name: str = Field(default="AGI Dashboard API")
    environment: str = Field(default="dev")
    api_prefix: str = Field(default="/api/v1")
    secret_key: str = Field(default="change-me")
    access_token_expire_minutes: int = Field(default=60)
    algorithm: str = Field(default="HS256")
    sqlite_dsn: str = Field(default="sqlite+aiosqlite:///./data/app.db")
    testing: bool = Field(default=False)

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
