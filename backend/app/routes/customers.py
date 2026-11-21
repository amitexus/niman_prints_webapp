
import re
from datetime import datetime, timezone

from bson import ObjectId
from pymongo.errors import DuplicateKeyError
from fastapi import APIRouter, Depends, HTTPException, Query

from app.database import get_database
from app.core.dependencies import get_current_user
from app.schemas.customer import (
    CustomerCreate,
    CustomerUpdate,
    CustomerResponse,
    CustomerType,
)


router = APIRouter(prefix="/customers", tags=["Customers"])


def get_business_id(current_user: dict) -> str:
    return str(current_user["business_id"])


def normalize_phone(phone: str) -> str:
    digits = re.sub(r"\D", "", phone or "")

    if digits.startswith("977") and len(digits) == 13:
        digits = digits[3:]

    # Only normalize valid 10-digit Nepal phone numbers.
    return digits if len(digits) == 10 else ""


def serialize_customer(document: dict) -> dict:
    document["id"] = str(document.pop("_id"))
    document["business_id"] = str(document["business_id"])
    return document


def validate_customer_id(customer_id: str) -> ObjectId:
    if not ObjectId.is_valid(customer_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid customer ID",
        )

    return ObjectId(customer_id)


def find_customer(db, customer_id: str, business_id: str):
    customer = db.customers.find_one({
        "_id": validate_customer_id(customer_id),
        "business_id": business_id,
    })

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found",
        )

    return customer


def check_duplicate_phone(
    db,
    business_id: str,
    normalized_phone: str,
    exclude_id: ObjectId | None = None,
):
    if not normalized_phone:
        return

    query = {
        "business_id": business_id,
        "normalized_phone": normalized_phone,
    }

    if exclude_id:
        query["_id"] = {"$ne": exclude_id}

    existing = db.customers.find_one(query)

    if existing:
        raise HTTPException(
            status_code=409,
            detail="A customer with this phone number already exists",
        )


@router.post(
    "",
    response_model=CustomerResponse,
    status_code=201,
)
def create_customer(
    data: CustomerCreate,
    current_user: dict = Depends(get_current_user),
):
    db = get_database()
    business_id = get_business_id(current_user)

    normalized_phone = normalize_phone(data.phone)

    check_duplicate_phone(
        db,
        business_id,
        normalized_phone,
    )

    now = datetime.now(timezone.utc)

    document = data.model_dump()

    document.update({
        "business_id": business_id,
        "normalized_phone": normalized_phone,
        "total_orders": 0,
        "total_spent": 0.0,
        "last_order": None,
        "is_active": True,
        "created_at": now,
        "updated_at": now,
    })

    try:
        result = db.customers.insert_one(document)
    except DuplicateKeyError:
        raise HTTPException(
            status_code=409,
            detail="A customer with this phone number already exists",
        )

    saved_customer = db.customers.find_one({
        "_id": result.inserted_id,
        "business_id": business_id,
    })

    return serialize_customer(saved_customer)


@router.get(
    "",
    response_model=list[CustomerResponse],
)
def get_customers(
    search: str = Query(default="", max_length=100),
    customer_type: CustomerType | None = None,
    active_only: bool = True,
    current_user: dict = Depends(get_current_user),
):
    db = get_database()
    business_id = get_business_id(current_user)

    query = {
        "business_id": business_id,
    }

    if active_only:
        query["is_active"] = True

    if customer_type:
        query["type"] = customer_type

    if search.strip():
        safe_search = re.escape(search.strip())

        query["$or"] = [
            {"name": {"$regex": safe_search, "$options": "i"}},
            {"phone": {"$regex": safe_search, "$options": "i"}},
            {"email": {"$regex": safe_search, "$options": "i"}},
            {"address": {"$regex": safe_search, "$options": "i"}},
        ]

    customers = (
        db.customers
        .find(query)
        .sort("created_at", -1)
    )

    return [
        serialize_customer(customer)
        for customer in customers
    ]


@router.get(
    "/{customer_id}",
    response_model=CustomerResponse,
)
def get_customer(
    customer_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = get_database()
    business_id = get_business_id(current_user)

    customer = find_customer(
        db,
        customer_id,
        business_id,
    )

    return serialize_customer(customer)


@router.put(
    "/{customer_id}",
    response_model=CustomerResponse,
)
def update_customer(
    customer_id: str,
    data: CustomerUpdate,
    current_user: dict = Depends(get_current_user),
):
    db = get_database()
    business_id = get_business_id(current_user)

    customer = find_customer(
        db,
        customer_id,
        business_id,
    )

    object_id = customer["_id"]
    normalized_phone = normalize_phone(data.phone)

    check_duplicate_phone(
        db,
        business_id,
        normalized_phone,
        exclude_id=object_id,
    )

    updated_document = data.model_dump()

    updated_document.update({
        "business_id": business_id,
        "normalized_phone": normalized_phone,
        "created_at": customer["created_at"],
        "updated_at": datetime.now(timezone.utc),
        "total_orders": customer.get("total_orders", 0),
        "total_spent": customer.get("total_spent", 0.0),
        "last_order": customer.get("last_order"),
        "is_active": customer.get("is_active", True),
    })

    try:
        db.customers.update_one(
            {
                "_id": object_id,
                "business_id": business_id,
            },
            {"$set": updated_document},
        )
    except DuplicateKeyError:
        raise HTTPException(
            status_code=409,
            detail="A customer with this phone number already exists",
        )

    updated_customer = find_customer(
        db,
        customer_id,
        business_id,
    )

    return serialize_customer(updated_customer)


@router.delete("/{customer_id}")
def archive_customer(
    customer_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = get_database()
    business_id = get_business_id(current_user)

    customer = find_customer(
        db,
        customer_id,
        business_id,
    )

    db.customers.update_one(
        {
            "_id": customer["_id"],
            "business_id": business_id,
        },
        {
            "$set": {
                "is_active": False,
                "updated_at": datetime.now(timezone.utc),
            }
        },
    )

    return {
        "success": True,
        "message": "Customer archived successfully",
    }


@router.patch("/{customer_id}/status")
def update_customer_status(
    customer_id: str,
    is_active: bool = Query(...),
    current_user: dict = Depends(get_current_user),
):
    db = get_database()
    business_id = get_business_id(current_user)

    customer = find_customer(
        db,
        customer_id,
        business_id,
    )

    db.customers.update_one(
        {
            "_id": customer["_id"],
            "business_id": business_id,
        },
        {
            "$set": {
                "is_active": is_active,
                "updated_at": datetime.now(timezone.utc),
            }
        },
    )

    return {
        "success": True,
        "message": (
            "Customer restored successfully"
            if is_active
            else "Customer archived successfully"
        ),
    }
