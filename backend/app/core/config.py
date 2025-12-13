from typing import Any

from pydantic import Field
from pydantic_settings import BaseSettings

_PLACEHOLDER_SECRETS = {"change-me", "CHANGE_ME", "changeme"}
_MIN_SECRET_LENGTH = 32


class Settings(BaseSettings):
    project_name: str = Field(default="AGI Dashboard API")
    environment: str = Field(default="dev")
    api_prefix: str = Field(default="/api/v1")
    secret_key: str = Field(default="change-me")
    access_token_expire_minutes: int = Field(default=30)
    algorithm: str = Field(default="HS256")
    sqlite_dsn: str = Field(default="sqlite+aiosqlite:///./data/app.db")
    testing: bool = Field(default=False)

    def model_post_init(self, __context: Any) -> None:
        if self.testing:
            return
        if self.secret_key in _PLACEHOLDER_SECRETS or len(self.secret_key) < _MIN_SECRET_LENGTH:
            raise ValueError(
                "SECRET_KEY must be set to a non-default value of at least "
                f"{_MIN_SECRET_LENGTH} characters."
            )

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
