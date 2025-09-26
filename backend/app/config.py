from pydantic_settings import BaseSettings
import os


class Settings(BaseSettings):
    api_title: str = "Ecommerce API"
    api_version: str = "1.0.0"
    
    class Config:
        env_file = ".env"

    @property
    def payment_key(self) -> str:
        return os.getenv("PAYMENT_API_KEY", "")


settings = Settings()
