from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic_settings import BaseSettings, SettingsConfigDict

from app.database import (
    connect_to_mongodb,
    close_mongodb_connection,
)

from app.database_init import initialize_database


class Settings(BaseSettings):
    app_name: str = "Niman Prints API"
    app_env: str = "development"
    api_prefix: str = "/api/v1"

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )


settings = Settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        database = connect_to_mongodb()

        initialization_result = initialize_database(database)

        app.state.database_connected = True
        app.state.database_initialization = initialization_result

        print("Niman Prints API started successfully")

    except Exception as error:
        app.state.database_connected = False
        app.state.database_initialization = None

        print(f"Backend startup error: {error}")

    yield

    close_mongodb_connection()


app = FastAPI(
    title=settings.app_name,
    description="Backend API for Niman Prints Business OS",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {
        "success": True,
        "message": "Welcome to Niman Prints API",
        "environment": settings.app_env,
    }


@app.get(f"{settings.api_prefix}/health")
async def health_check():
    database_connected = getattr(
        app.state,
        "database_connected",
        False,
    )

    return {
        "success": database_connected,
        "status": "healthy" if database_connected else "degraded",
        "service": "niman-prints-api",
        "database": (
            "connected"
            if database_connected
            else "not_connected"
        ),
    }