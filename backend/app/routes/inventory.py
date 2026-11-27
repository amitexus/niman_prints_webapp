
from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query
from pymongo.errors import DuplicateKeyError

from app.database import get_database
from app.core.dependencies import get_current_user
from app.schemas.inventory import (
    InventoryItemCreate,
    InventoryItemUpdate,
    InventoryItemResponse,
    StockMovementCreate,
    StockMovementResponse,
)
from app.services.inventory_service import (
    serialize_inventory_item,
    serialize_stock_movement,
    create_inventory_item,
    create_stock_movement,
)

router = APIRouter(prefix="/inventory", tags=["Inventory"])


def get_business_id(current_user: dict) -> str:
    business_id = current_user.get("business_id")

    if not business_id or not ObjectId.is_valid(str(business_id)):
        raise HTTPException(
            status_code=403,
            detail="User is not linked to a valid business",
        )

    return str(business_id)


@router.post("", response_model=InventoryItemResponse, status_code=201)
def add_inventory_item(
    data: InventoryItemCreate,
    current_user: dict = Depends(get_current_user),
):
    db = get_database()
    business_id = get_business_id(current_user)

    try:
        item = create_inventory_item(
            db,
            business_id,
            data.model_dump(),
        )
    except DuplicateKeyError:
        raise HTTPException(
            status_code=409,
            detail="SKU already exists",
        )

    return serialize_inventory_item(item)


@router.get("", response_model=list[InventoryItemResponse])
def get_inventory_items(
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
            {"supplier": {"$regex": search, "$options": "i"}},
        ]

    items = db.inventory.find(query).sort("created_at", -1)

    return [
        serialize_inventory_item(item)
        for item in items
    ]

@router.get("/movements", response_model=list[StockMovementResponse])
def get_stock_movements(
    item_id: str | None = None,
    limit: int = Query(default=50, ge=1, le=200),
    current_user: dict = Depends(get_current_user),
):
    db = get_database()
    business_id = get_business_id(current_user)

    query = {"business_id": business_id}

    if item_id:
        if not ObjectId.is_valid(item_id):
            raise HTTPException(status_code=400, detail="Invalid inventory item ID")

        query["item_id"] = ObjectId(item_id)

    movements = (
        db.stock_movements
        .find(query)
        .sort("date", -1)
        .limit(limit)
    )

    return [
        serialize_stock_movement(movement)
        for movement in movements
    ]



@router.get("/{item_id}", response_model=InventoryItemResponse)
def get_inventory_item(
    item_id: str,
    current_user: dict = Depends(get_current_user),
):
    if not ObjectId.is_valid(item_id):
        raise HTTPException(status_code=400, detail="Invalid inventory item ID")

    db = get_database()

    item = db.inventory.find_one({
        "_id": ObjectId(item_id),
        "business_id": get_business_id(current_user),
    })

    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")

    return serialize_inventory_item(item)


@router.put("/{item_id}", response_model=InventoryItemResponse)
def update_inventory_item(
    item_id: str,
    data: InventoryItemUpdate,
    current_user: dict = Depends(get_current_user),
):
    if not ObjectId.is_valid(item_id):
        raise HTTPException(status_code=400, detail="Invalid inventory item ID")

    db = get_database()
    business_id = get_business_id(current_user)
    item_object_id = ObjectId(item_id)

    existing = db.inventory.find_one({
        "_id": item_object_id,
        "business_id": business_id,
    })

    if not existing:
        raise HTTPException(status_code=404, detail="Inventory item not found")

    duplicate = db.inventory.find_one({
        "business_id": business_id,
        "sku": data.sku,
        "_id": {"$ne": item_object_id},
    })

    if duplicate:
        raise HTTPException(status_code=409, detail="SKU already exists")

    updated_document = data.model_dump()

    updated_document.update({
        "business_id": business_id,
        "created_at": existing["created_at"],
        "updated_at": datetime.now(timezone.utc),
    })

    db.inventory.update_one(
        {
            "_id": item_object_id,
            "business_id": business_id,
        },
        {"$set": updated_document},
    )

    updated_item = db.inventory.find_one({
        "_id": item_object_id,
        "business_id": business_id,
    })

    return serialize_inventory_item(updated_item)


@router.delete("/{item_id}")
def archive_inventory_item(
    item_id: str,
    current_user: dict = Depends(get_current_user),
):
    if not ObjectId.is_valid(item_id):
        raise HTTPException(status_code=400, detail="Invalid inventory item ID")

    db = get_database()
    business_id = get_business_id(current_user)

    result = db.inventory.update_one(
        {
            "_id": ObjectId(item_id),
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
        raise HTTPException(status_code=404, detail="Inventory item not found")

    return {
        "success": True,
        "message": "Inventory item archived successfully",
    }


@router.post("/movements", response_model=StockMovementResponse, status_code=201)
def add_stock_movement(
    data: StockMovementCreate,
    current_user: dict = Depends(get_current_user),
):
    db = get_database()
    business_id = get_business_id(current_user)

    if not ObjectId.is_valid(data.item_id):
        raise HTTPException(status_code=400, detail="Invalid inventory item ID")

    item = db.inventory.find_one({
        "_id": ObjectId(data.item_id),
        "business_id": business_id,
        "is_active": True,
    })

    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")

    movement = create_stock_movement(
        db=db,
        business_id=business_id,
        item_id=data.item_id,
        movement_type=data.type,
        quantity=data.quantity,
        reference=data.reference,
    )

    if not movement:
        raise HTTPException(
            status_code=409,
            detail="Insufficient stock for this movement",
        )

    return serialize_stock_movement(movement)


