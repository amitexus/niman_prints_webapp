
import re
from datetime import datetime, timezone

from app.database import get_database


def normalize_phone(value: str) -> str:
    digits = re.sub(r"\D", "", str(value or ""))

    if digits.startswith("977") and len(digits) == 13:
        digits = digits[3:]

    return digits


def find_or_create_customer(
    business_id: str,
    customer_name: str,
    customer_phone: str,
    customer_address: str = "",
    normalized_phone: str = "",
    phone_status: str = "",
    session=None,
):
    """
    Match or create customers only for verified single
    10-digit phone numbers.

    All database operations use the supplied MongoDB
    transaction session.
    """

    db = get_database()

    phone = normalize_phone(normalized_phone)

    # Never automatically match or create customers
    # with missing, ambiguous, or invalid phone numbers.
    if phone_status != "valid" or len(phone) != 10:
        return None, False

    customer = db.customers.find_one(
        {
            "business_id": business_id,
            "normalized_phone": phone,
        },
        session=session,
    )

    now = datetime.now(timezone.utc)

    if customer:
        updates = {
            "updated_at": now,
        }

        if not customer.get("address") and customer_address:
            updates["address"] = customer_address.strip()

        if not customer.get("name") and customer_name:
            updates["name"] = customer_name.strip()

        db.customers.update_one(
            {
                "_id": customer["_id"],
                "business_id": business_id,
            },
            {"$set": updates},
            session=session,
        )

        return customer["_id"], False

    customer_document = {
        "business_id": business_id,
        "name": customer_name.strip(),
        "phone": customer_phone.strip(),
        "normalized_phone": phone,
        "email": "",
        "address": customer_address.strip(),
        "type": "Individual",
        "total_orders": 0,
        "total_spent": 0,
        "last_order": None,
        "notes": "Imported from historical Excel records.",
        "is_active": True,
        "created_at": now,
        "updated_at": now,
    }

    result = db.customers.insert_one(
        customer_document,
        session=session,
    )

    return result.inserted_id, True
