
from datetime import datetime, timezone

from bson import ObjectId
from pymongo import ReturnDocument
from pymongo.database import Database


def serialize_inventory_item(document: dict) -> dict:
    document["id"] = str(document.pop("_id"))
    document["business_id"] = str(document["business_id"])
    return document


def serialize_stock_movement(document: dict) -> dict:
    document["id"] = str(document.pop("_id"))
    document["business_id"] = str(document["business_id"])
    document["item_id"] = str(document["item_id"])
    return document


def create_inventory_item(
    db: Database,
    business_id: str,
    data: dict,
):
    now = datetime.now(timezone.utc)

    document = data.copy()
    document.update({
        "business_id": business_id,
        "created_at": now,
        "updated_at": now,
    })

    result = db.inventory.insert_one(document)

    return db.inventory.find_one({
        "_id": result.inserted_id,
        "business_id": business_id,
    })



def create_stock_movement(
    db: Database,
    business_id: str,
    item_id: str,
    movement_type: str,
    quantity: int,
    reference: str,
):
    if not ObjectId.is_valid(item_id):
        raise ValueError("Invalid inventory item ID")

    item_object_id = ObjectId(item_id)

    if movement_type == "Stock In":
        stock_update = {
            "$inc": {"stock": quantity},
            "$set": {"updated_at": datetime.now(timezone.utc)},
        }

    elif movement_type == "Stock Out":
        stock_update = {
            "$inc": {"stock": -quantity},
            "$set": {"updated_at": datetime.now(timezone.utc)},
        }

    elif movement_type == "Adjustment":
        stock_update = {
            "$set": {
                "stock": quantity,
                "updated_at": datetime.now(timezone.utc),
            }
        }

    else:
        raise ValueError("Invalid stock movement type")

    query = {
        "_id": item_object_id,
        "business_id": business_id,
        "is_active": True,
    }

    if movement_type == "Stock Out":
        query["stock"] = {"$gte": quantity}

    def transaction_operation(session):
        updated_item = db.inventory.find_one_and_update(
            query,
            stock_update,
            return_document=ReturnDocument.AFTER,
            session=session,
        )

        if not updated_item:
            return None

        movement = {
            "business_id": business_id,
            "item_id": item_object_id,
            "item_name": updated_item["name"],
            "type": movement_type,
            "quantity": quantity,
            "date": datetime.now(timezone.utc),
            "reference": reference,
        }

        result = db.stock_movements.insert_one(
            movement,
            session=session,
        )

        return db.stock_movements.find_one(
            {
                "_id": result.inserted_id,
                "business_id": business_id,
            },
            session=session,
        )

    with db.client.start_session() as session:
        return session.with_transaction(transaction_operation)
