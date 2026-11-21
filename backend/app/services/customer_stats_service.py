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
    Recalculate customer statistics from orders.
    Existing eligible-order and spending rules are preserved.
    """

    if not customer_id:
        return

    from bson import ObjectId

    if not ObjectId.is_valid(customer_id):
        return

    customer_object_id = ObjectId(customer_id)

    customer_orders = list(
        db.orders.find(
            {
                "business_id": business_id,
                "customer_id": customer_id,
            },
            {
                "status": 1,
                "delivery_status": 1,
                "total_order": 1,
                "order_date": 1,
            },
            session=session,
        )
    )

    eligible_orders = [
        order for order in customer_orders
        if order.get("status") in ELIGIBLE_ORDER_STATUSES
        and order.get("delivery_status") != "Returned"
    ]

    total_orders = len(eligible_orders)

    total_spent = sum(
        float(order.get("total_order", 0) or 0)
        for order in eligible_orders
    )

    eligible_orders.sort(
        key=lambda order: order.get("order_date") or datetime.min,
        reverse=True,
    )

    last_order = (
        eligible_orders[0].get("order_date")
        if eligible_orders
        else None
    )
    completed_orders = sum(
        1 for order in customer_orders
        if order.get("delivery_status") == "Delivered"
    )

    cancelled_orders = sum(
        1 for order in customer_orders
        if order.get("status") == "Cancelled"
    )

    returned_orders = sum(
        1 for order in customer_orders
        if order.get("delivery_status") == "Returned"
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
                "completed_orders": completed_orders,
                "cancelled_orders": cancelled_orders,
                "returned_orders": returned_orders,
                "last_order": last_order,
                "updated_at": datetime.now(timezone.utc),
            }
        },
        session=session,
    )
