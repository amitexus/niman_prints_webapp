from datetime import datetime, timezone, timedelta
from bson import ObjectId
from pymongo.database import Database


def serialize_production_job(document: dict) -> dict:
    document["id"] = str(document.pop("_id"))
    document["business_id"] = str(document["business_id"])

    if document.get("order_id"):
        document["order_id"] = str(document["order_id"])

    # Convert MongoDB's naive UTC timestamps into timezone-aware UTC.
    for field in ["created_at", "updated_at"]:
        value = document.get(field)

        if isinstance(value, datetime) and value.tzinfo is None:
            document[field] = value.replace(tzinfo=timezone.utc)

    # Normalize production history timestamps.
    for entry in document.get("history", []):
        changed_at = entry.get("changed_at")

        if isinstance(changed_at, datetime) and changed_at.tzinfo is None:
            entry["changed_at"] = changed_at.replace(
                tzinfo=timezone.utc
            )

    # Preserve the Nepal calendar date for old datetime due dates.
    due_date = document.get("due_date")

    if isinstance(due_date, datetime):
        nepal_timezone = timezone(timedelta(hours=5, minutes=45))

        if due_date.tzinfo is None:
            due_date = due_date.replace(tzinfo=timezone.utc)

        document["due_date"] = due_date.astimezone(
            nepal_timezone
        ).date().isoformat()

    return document


def create_production_job(
    db: Database,
    business_id: str,
    data: dict,
    created_by: str = "System",
    session=None,
):
    now = datetime.now(timezone.utc)

    document = data.copy()

    due_date = document.get("due_date")
    if due_date:
       document["due_date"] = due_date.isoformat()

    order_id = document.pop("order_id", None) 

    customer_name = document.get("customer_name")
    if customer_name:
      document["customer_name"] = customer_name.strip()
    else:
      document["customer_name"] = None

    if order_id:
        if isinstance(order_id, str):
            if not ObjectId.is_valid(order_id):
                raise ValueError("Invalid order ID")
            order_object_id = ObjectId(order_id)
        else:
            order_object_id = order_id

        order = db.orders.find_one(
            {
                "_id": order_object_id,
                "business_id": business_id,
            },
            session=session,
        )

        if not order:
            raise ValueError("Order not found")

        if order.get("status") in ["Cancelled", "Returned"]:
            raise ValueError(
                "Cannot create a production job for this order"
            )

        document["order_id"] = order_object_id
        document["order_number"] = order.get("order_number")

    document.update({
    "business_id": business_id,
    "created_by": created_by,
    "created_at": now,
    "updated_at": now,
    "history": [
        {
            "from_status": None,
            "to_status": document.get("status", "Pending Design"),
            "changed_by": created_by,
            "notes": "Production job created",
            "changed_at": now,
        }
    ],
})

    result = db.production_jobs.insert_one(
        document,
        session=session,
    )

    return db.production_jobs.find_one(
        {
            "_id": result.inserted_id,
            "business_id": business_id,
        },
        session=session,
    )



def get_production_job(
    db: Database,
    business_id: str,
    job_id: str,
):
    if not ObjectId.is_valid(job_id):
        return None

    return db.production_jobs.find_one({
        "_id": ObjectId(job_id),
        "business_id": business_id,
    })


def list_production_jobs(
    db: Database,
    business_id: str,
    status: str | None = None,
):
    query = {"business_id": business_id}

    if status:
        query["status"] = status

    return list(
        db.production_jobs.find(query).sort("created_at", -1)
    )




def update_production_job(
    db: Database,
    business_id: str,
    job_id: str,
    data: dict,
    changed_by: str = "System",
):
    if not ObjectId.is_valid(job_id):
        return None

    updates = data.copy()

    # Store due dates as date-only strings.
    due_date = updates.get("due_date")
    if due_date:
       updates["due_date"] = due_date.isoformat()

    # Extract the note for this individual status change.
    status_note = updates.pop("status_note", None)

  
    # Required production fields cannot be explicitly cleared.
    for field in ["product_name", "quantity", "priority", "status"]:
        if field in updates and updates[field] is None:
            raise ValueError(f"{field} cannot be empty")

    existing = get_production_job(db, business_id, job_id)

    if not existing:
        return None

    now = datetime.now(timezone.utc)
    updates["updated_at"] = now

    update_operation = {
        "$set": updates,
    }

    new_status = updates.get("status")
    old_status = existing.get("status")

    # Record history only when the status actually changes.
    if new_status and new_status != old_status:
        history_entry = {
            "from_status": old_status,
            "to_status": new_status,
            "changed_by": changed_by,
            "notes": (status_note or "").strip(),
            "changed_at": now,
        }

        update_operation["$push"] = {
            "history": history_entry,
        }

       
        # Synchronize linked order status.
        order_status_map = {
            "Pending Design": "Design Approval",
            "Design Approval": "Design Approval",
            "Printing": "In Production",
            "Quality Check": "In Production",
            "Packaging": "In Production",
            "Ready for Dispatch": "Ready to Ship",
            "Completed": "Completed",
        }

        mapped_order_status = order_status_map.get(new_status)
        order_id = existing.get("order_id")

        if mapped_order_status and order_id:
            order = db.orders.find_one({
                "_id": order_id,
                "business_id": business_id,
            })

            if order:
                current_order_status = order.get("status")

                protected_statuses = [
                    "Shipped",
                    "Delivered",
                    "Completed",
                    "Cancelled",
                    "Returned",
                ]

                if (
                     current_order_status not in protected_statuses
                     and order.get("delivery_status") != "Returned"
                ):
                    status_priority = {
                        "New": 0,
                        "Design Approval": 1,
                        "In Production": 2,
                        "Ready to Ship": 3,
                        "Completed":4,
                    }

                    current_priority = status_priority.get(
                        current_order_status, -1
                    )
                    target_priority = status_priority.get(
                        mapped_order_status, -1
                    )
                    

                    if target_priority > current_priority:
                        sync_result = db.orders.update_one(
                          {
                             "_id": order_id,
                             "business_id": business_id,
                             "status": current_order_status,
                          },
                          {
                             "$set": {
                             "status": mapped_order_status,
                             "updated_at": now,
                            }
                          },
                        )

                     


    return db.production_jobs.find_one_and_update(
        {
            "_id": ObjectId(job_id),
            "business_id": business_id,
        },
        update_operation,
        return_document=True,
    )
