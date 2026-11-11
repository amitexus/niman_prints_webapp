
from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query

from app.database import get_database
from app.core.dependencies import get_current_user
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse

router = APIRouter(prefix="/products", tags=["Products"])


def serialize_product(document: dict) -> dict:
    document["id"] = str(document.pop("_id"))
    document["business_id"] = str(document["business_id"])
    return document


def get_business_id(current_user: dict) -> str:
    return str(current_user["business_id"])


@router.post("", response_model=ProductResponse, status_code=201)
def create_product(
    data: ProductCreate,
    current_user: dict = Depends(get_current_user),
):
    db = get_database()
    business_id = get_business_id(current_user)

    existing = db.products.find_one({
        "business_id": business_id,
        "sku": data.sku,
    })

    if existing:
        raise HTTPException(status_code=409, detail="SKU already exists")

    now = datetime.now(timezone.utc)

    document = data.model_dump()
    document.update({
        "business_id": business_id,
        "created_at": now,
        "updated_at": now,
    })

    result = db.products.insert_one(document)
    saved_product = db.products.find_one({"_id": result.inserted_id})

    return serialize_product(saved_product)


@router.get("", response_model=list[ProductResponse])
def get_products(
    search: str = Query(default="", max_length=100),
    category: str | None = None,
    active_only: bool = True,
    current_user: dict = Depends(get_current_user),
):
    db = get_database()
    business_id = get_business_id(current_user)

    query = {"business_id": business_id}

    if active_only:
        query["is_active"] = True

    if category:
        query["category"] = category

    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"sku": {"$regex": search, "$options": "i"}},
        ]

    products = db.products.find(query).sort("created_at", -1)

    return [serialize_product(product) for product in products]


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(
    product_id: str,
    current_user: dict = Depends(get_current_user),
):
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=400, detail="Invalid product ID")

    db = get_database()

    product = db.products.find_one({
        "_id": ObjectId(product_id),
        "business_id": get_business_id(current_user),
    })

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return serialize_product(product)


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: str,
    data: ProductUpdate,
    current_user: dict = Depends(get_current_user),
):
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=400, detail="Invalid product ID")

    db = get_database()
    business_id = get_business_id(current_user)

    existing = db.products.find_one({
        "_id": ObjectId(product_id),
        "business_id": business_id,
    })

    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")

    duplicate = db.products.find_one({
        "business_id": business_id,
        "sku": data.sku,
        "_id": {"$ne": ObjectId(product_id)},
    })

    if duplicate:
        raise HTTPException(status_code=409, detail="SKU already exists")

    updated_document = data.model_dump()
    updated_document["business_id"] = business_id
    updated_document["created_at"] = existing["created_at"]
    updated_document["updated_at"] = datetime.now(timezone.utc)

    db.products.update_one(
        {"_id": ObjectId(product_id), "business_id": business_id},
        {"$set": updated_document},
    )

    updated_product = db.products.find_one({
        "_id": ObjectId(product_id),
        "business_id": business_id,
    })

    return serialize_product(updated_product)


@router.delete("/{product_id}")
def delete_product(
    product_id: str,
    current_user: dict = Depends(get_current_user),
):
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=400, detail="Invalid product ID")

    db = get_database()
    business_id = get_business_id(current_user)

    result = db.products.update_one(
        {
            "_id": ObjectId(product_id),
            "business_id": business_id,
        },
        {
            "$set": {
                "is_active": False,
                "updated_at": datetime.now(timezone.utc),
            }
        },
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")

    return {"success": True, "message": "Product archived successfully"}
