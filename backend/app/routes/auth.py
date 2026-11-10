from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from bson import ObjectId
import jwt

from app.database import get_database
from app.schemas.user import UserLogin, UserResponse
from app.core.dependencies import get_current_user
from app.core.security import (
    verify_password,
    create_access_token,
    decode_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])
bearer_scheme = HTTPBearer()


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

    token = create_access_token(
        user_id=str(user["_id"]),
        business_id=str(user["business_id"]),
        role=user["role"],
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user": serialize_user(user),
    }


@router.get("/me", response_model=UserResponse)
def get_my_profile(current_user: dict = Depends(get_current_user)):
    return serialize_user(current_user)