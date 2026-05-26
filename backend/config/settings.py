from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # MongoDB connection string - set this in your .env file
    mongo_uri: str = "mongodb://localhost:27017"
    db_name: str = "expense_tracker"

    # JWT settings - make sure to change the secret in production
    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    class Config:
        env_file = ".env"


# A single shared instance used across the app
settings = Settings()
