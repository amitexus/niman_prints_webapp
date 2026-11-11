
from pydantic import BaseModel, Field
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
import jwt

from app.database import get_database
from app.schemas.user import UserLogin, UserResponse
from app.core.security import (
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


class RefreshRequest(BaseModel):
    refresh_token: str = Field(min_length=1)


def serialize_user(document: dict) -> dict:
    return {
        "id": str(document["_id"]),
        "business_id": str(document["business_id"]),
        "full_name": document["full_name"],
        "email": document["email"],
        "role": document["role"],
        "is_active": document["is_active"],
        "created_at": document["created_at"],
    }


@router.post("/login")
def login(data: UserLogin):
    db = get_database()

    user = db.users.find_one({
        "email": data.email.lower().strip(),
        "is_active": True,
    })

    if not user or not verify_password(
        data.password,
        user["password_hash"],
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = str(user["_id"])
    business_id = str(user["business_id"])

    access_token = create_access_token(
        user_id=user_id,
        business_id=business_id,
        role=user["role"],
    )

    refresh_token = create_refresh_token(
        user_id=user_id,
        business_id=business_id,
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user": serialize_user(user),
    }


@router.post("/refresh")
def refresh_access_token(data: RefreshRequest):
    try:
        payload = decode_refresh_token(data.refresh_token)
        user_id = payload.get("sub")
        business_id = payload.get("business_id")

        if not user_id or not ObjectId.is_valid(user_id):
            raise HTTPException(
                status_code=401,
                detail="Invalid refresh token",
            )

    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired refresh token",
        )

    db = get_database()

    user = db.users.find_one({
        "_id": ObjectId(user_id),
        "is_active": True,
        "business_id": business_id,
    })

    if not user:
        raise HTTPException(
            status_code=401,
            detail="User not found or refresh session is no longer valid",
        )

    new_access_token = create_access_token(
        user_id=str(user["_id"]),
        business_id=str(user["business_id"]),
        role=user["role"],
    )

    return {
        "access_token": new_access_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    }


@router.get("/me", response_model=UserResponse)
def get_my_profile(current_user: dict = Depends(get_current_user)):
    return serialize_user(current_user)
