from datetime import datetime, timezone

from pymongo.database import Database


ELIGIBLE_ORDER_STATUSES = {
    "New",
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
}


def recalculate_customer_stats(
    db: Database,
    business_id: str,
    customer_id: str | None,
    session=None,
):
    """
    Recalculate customer statistics from eligible orders.
    Cancelled and Returned orders are excluded.
    """

    if not customer_id:
        return

    from bson import ObjectId

    if not ObjectId.is_valid(customer_id):
      return

    customer_object_id = ObjectId(customer_id)

    eligible_orders = list(
        db.orders.find(
            {
                "business_id": business_id,
                "customer_id": customer_id,
                "status": {"$in": list(ELIGIBLE_ORDER_STATUSES)},
                "delivery_status": {"$ne": "Returned"},
            },
            {
                "total_order": 1,
                "order_date": 1,
            },
            session=session,
        ).sort("order_date", -1)
    )

    total_orders = len(eligible_orders)

    total_spent = sum(
        float(order.get("total_order", 0) or 0)
        for order in eligible_orders
    )

    last_order = (
        eligible_orders[0].get("order_date")
        if eligible_orders
        else None
    )

    db.customers.update_one(
        {
            "_id": customer_object_id,
            "business_id": business_id,
        },
        {
            "$set": {
                "total_orders": total_orders,
                "total_spent": total_spent,
                "last_order": last_order,
                "updated_at": datetime.now(timezone.utc),
            }
        },
        session=session,
    )