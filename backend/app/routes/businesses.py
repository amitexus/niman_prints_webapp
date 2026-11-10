
from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from app.database import get_database
from app.core.dependencies import get_current_user
from app.schemas.business import BusinessCreate, BusinessResponse

router = APIRouter(prefix="/businesses", tags=["Businesses"])


def get_user_business(current_user: dict):
    business_id = current_user.get("business_id")

    if not business_id or not ObjectId.is_valid(business_id):
        raise HTTPException(
            status_code=403,
            detail="User is not linked to a valid business",
        )

    db = get_database()

    business = db.businesses.find_one({
        "_id": ObjectId(business_id),
        "is_active": True,
    })

    if not business:
        raise HTTPException(
            status_code=404,
            detail="Business not found",
        )

    return business


def serialize_business(document: dict) -> dict:
    document["id"] = str(document.pop("_id"))
    return document


@router.get("/me", response_model=BusinessResponse)
def get_my_business(
    current_user: dict = Depends(get_current_user),
):
    business = get_user_business(current_user)
    return serialize_business(business)


@router.put("/me", response_model=BusinessResponse)
def update_my_business(
    data: BusinessCreate,
    current_user: dict = Depends(get_current_user),
):
    business = get_user_business(current_user)

    updated_document = data.model_dump()
    updated_document["created_at"] = business["created_at"]
    updated_document["updated_at"] = datetime.now(timezone.utc)
    updated_document["is_active"] = True

    db = get_database()

    db.businesses.update_one(
        {"_id": business["_id"]},
        {"$set": updated_document},
    )

    updated_business = db.businesses.find_one({
        "_id": business["_id"],
    })

    return serialize_business(updated_business)
