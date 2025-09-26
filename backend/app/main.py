import logging
import stripe
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .database import init_sample_data
from .routes import router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

stripe.api_key = settings.stripe_api_key

app = FastAPI(title=settings.api_title, version=settings.api_version)

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

app.include_router(router)

@app.on_event("startup")
async def startup_event():
    """Initialize the application on startup."""
    init_sample_data()
    logger.info("Application started successfully")
