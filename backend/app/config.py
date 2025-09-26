from pydantic_settings import BaseSettings
import os


class Settings(BaseSettings):
    api_title: str = "Ecommerce API"
    api_version: str = "1.0.0"
    stripe_api_key: str = "sk_test_default_key_for_demo"
    
    class Config:
        env_file = ".env"


settings = Settings()
