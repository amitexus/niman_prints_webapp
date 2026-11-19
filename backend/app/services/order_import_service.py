
from datetime import datetime, timezone

from pymongo.errors import DuplicateKeyError

from app.database import get_database
from app.services.customer_import_service import find_or_create_customer


def import_historical_order(
    business_id: str,
    row: dict,
    workbook_hash: str,
):
    db = get_database()
    source_row = row["source_row"]

    import_key = (
        f"excel:{workbook_hash}:Sheet1:{source_row}"
    )

    order_number = (
        f"HIST-{workbook_hash[:12].upper()}-{source_row}"
    )

    def import_transaction(session):
        # Check for an existing import before creating a customer.
        existing_order = db.orders.find_one(
            {
                "business_id": business_id,
                "import_key": import_key,
            },
            session=session,
        )

        if existing_order:
            return {
                "status": "duplicate",
                "order_id": str(existing_order["_id"]),
                "order_number": existing_order.get("order_number"),
            }

        # Customer creation or matching happens in this transaction.
        customer_id, customer_created = find_or_create_customer(
            business_id=business_id,
            customer_name=row["customer_name"],
            customer_phone=row.get("customer_phone", ""),
            customer_address=row.get("customer_address", ""),
            normalized_phone=row.get("normalized_phone", ""),
            phone_status=row.get("phone_status", ""),
            session=session,
        )

        order_date = datetime.fromisoformat(row["order_date"])
        now = datetime.now(timezone.utc)

        order_document = {
            "business_id": business_id,
            "order_number": order_number,
            "customer_id": customer_id,

            "order_date": order_date,
            "customer_name": row["customer_name"],
            "customer_phone": row.get("customer_phone", ""),
            "customer_address": row.get("customer_address", ""),

            "phone_numbers": row.get("phone_numbers", []),
            "phone_status": row.get("phone_status", "needs_review"),

            "product_name": row["product_name"],
            "quantity": row["quantity"],
            "rate": row["rate"],
            "delivery_charge": row["delivery_charge"],
            "total_order": row["total_order"],
            "online_payment": row["online_payment"],
            "cod_amount": row["cod_amount"],
            "delivery_type": row.get("delivery_type", ""),
            "cost": row["cost"],
            "profit": row["profit"],

            "source": "excel_import",
            "source_sheet": "Sheet1",
            "source_row": source_row,
            "source_file_hash": workbook_hash,
            "import_key": import_key,

            "status": "Completed",
            "payment_status": "Historical",
            "created_at": now,
            "updated_at": now,
        }

        result = db.orders.insert_one(
            order_document,
            session=session,
        )

        # Update customer totals only for a linked customer.
        if customer_id is not None:
            db.customers.update_one(
                {
                    "_id": customer_id,
                    "business_id": business_id,
                },
                {
                    "$inc": {
                        "total_orders": 1,
                        "total_spent": row["total_order"],
                    },
                    "$max": {
                        "last_order": order_date,
                    },
                    "$set": {
                        "updated_at": now,
                    },
                },
                session=session,
            )

        return {
            "status": "imported",
            "order_id": str(result.inserted_id),
            "order_number": order_number,
            "customer_id": (
                str(customer_id) if customer_id else None
            ),
            "customer_created": customer_created,
        }

    try:
        with db.client.start_session() as session:
            return session.with_transaction(import_transaction)

    except DuplicateKeyError:
        # A concurrent request may have imported this row first.
        existing_order = db.orders.find_one({
            "business_id": business_id,
            "import_key": import_key,
        })

        if existing_order:
            return {
                "status": "duplicate",
                "order_id": str(existing_order["_id"]),
                "order_number": existing_order.get("order_number"),
            }

        # The duplicate was caused by another constraint.
        raise
