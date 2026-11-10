import os

from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.database import Database

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
MONGODB_DATABASE = os.getenv("MONGODB_DATABASE", "niman_prints")

client: MongoClient | None = None
db: Database | None = None


def connect_to_mongodb() -> Database:
    global client, db

    if not MONGODB_URI:
        raise ValueError("MONGODB_URI is missing from the .env file")

    if client is not None:
        return db

    new_client = MongoClient(
        MONGODB_URI,
        serverSelectionTimeoutMS=5000,
    )

    # Verify the actual database connection.
    new_client.admin.command("ping")

    client = new_client
    db = client[MONGODB_DATABASE]

    print(f"MongoDB connected: {MONGODB_DATABASE}")

    return db


def close_mongodb_connection():
    global client, db

    if client is not None:
        client.close()

    client = None
    db = None

    print("MongoDB connection closed")


def get_database() -> Database:
    if db is None:
        raise RuntimeError("MongoDB is not connected")

    return db