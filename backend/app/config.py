from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./data.db"
    SECRET_KEY: str
    JENKINS_URL: str
    JENKINS_USER: str = ""
    JENKINS_API_TOKEN: str = ""
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    COOKIE_SECURE: bool = False  # Set True in production (HTTPS)

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()
