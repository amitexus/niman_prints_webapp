
import secrets
from datetime import datetime, timezone
from typing import Literal

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from app.database import get_database
from app import database
from app.services.customer_stats_service import recalculate_customer_stats
from app.core.dependencies import get_current_user
from app.schemas.order import (
    OrderCreate,
    OrderUpdate,
    OrderResponse,
    PaymentTransaction,
)


router = APIRouter(prefix="/orders", tags=["Orders"])


class DeliveryStatusUpdate(BaseModel):
    delivery_status: Literal["Pending", "Shipped", "Delivered", "Returned"]


def get_business_id(current_user: dict) -> str:
    return str(current_user["business_id"])


def serialize_order(document: dict) -> dict:
    document["id"] = str(document.pop("_id"))

    if document.get("customer_id") is not None:
        document["customer_id"] = str(document["customer_id"])

    document["business_id"] = str(document["business_id"])

    return document


def generate_order_number() -> str:
    timestamp = datetime.now(timezone.utc).strftime("%y%m%d%H%M%S")
    suffix = secrets.token_hex(3).upper()
    return f"NP-{timestamp}-{suffix}"


def get_payment_history(order: dict) -> list:
    """Return stored payment history, with a fallback for older orders."""
    history = order.get("payment_history")

    if history is not None:
        return history

    # Older orders may have an online advance but no transaction history.
    online_payment = float(order.get("online_payment", 0) or 0)

    if online_payment > 0:
        return [{
            "amount": online_payment,
            "method": "Online",
            "payment_date": order.get("created_at") or datetime.now(timezone.utc),
            "reference": "Legacy online payment",
            "notes": "Recovered from the original order record",
        }]

    return []


def get_total_received(history: list) -> float:
    return round(
        sum(float(payment.get("amount", 0) or 0) for payment in history),
        2,
    )


def calculate_payment_status(total_order: float, total_received: float) -> str:
    if total_received <= 0:
        return "Unpaid"

    if total_received >= total_order:
        return "Paid"

    return "Partial"


def calculate_cod_settlement_status(
    cod_amount: float,
    cod_settled_amount: float,
) -> str:
    if cod_amount <= 0:
        return "Not Applicable"

    if cod_settled_amount <= 0:
        return "Pending"

    if cod_settled_amount >= cod_amount:
        return "Settled"

    return "Partially Settled"


def find_order(db, order_id: str, business_id: str) -> dict:
    if not ObjectId.is_valid(order_id):
        raise HTTPException(status_code=400, detail="Invalid order ID")

    order = db.orders.find_one({
        "_id": ObjectId(order_id),
        "business_id": business_id,
    })

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    return order


def ensure_manual_order(order: dict):
    if order.get("source") == "excel_import":
        raise HTTPException(
            status_code=403,
            detail="Historical imported orders cannot be modified through this endpoint.",
        )


@router.post("", response_model=OrderResponse, status_code=201)
def create_order(
    data: OrderCreate,
    current_user: dict = Depends(get_current_user),
):
    db = get_database()
    business_id = get_business_id(current_user)

    customer_id = data.customer_id

    if customer_id:
        if not ObjectId.is_valid(customer_id):
            raise HTTPException(status_code=400, detail="Invalid customer ID")

        customer = db.customers.find_one({
            "_id": ObjectId(customer_id),
            "business_id": business_id,
        })

        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")

    now = datetime.now(timezone.utc)
    document = data.model_dump()

    total_order = float(document["total_order"])
    online_payment = float(document.get("online_payment", 0) or 0)
    cod_amount = float(document.get("cod_amount", 0) or 0)

    if online_payment < 0 or cod_amount < 0:
        raise HTTPException(status_code=400, detail="Payment amounts cannot be negative")

    if online_payment + cod_amount > total_order + 0.01:
        raise HTTPException(
            status_code=400,
            detail="Online payment and COD amount cannot exceed the order total",
        )

    payment_history = []

    if online_payment > 0:
        payment_history.append({
            "amount": online_payment,
            "method": "Online",
            "payment_date": now,
            "reference": "",
            "notes": "Online payment received when order was created",
        })

    total_received = get_total_received(payment_history)

    document.update({
        "business_id": business_id,
        "order_number": generate_order_number(),
        "order_date": now,
        "source": "manual",
        "created_at": now,
        "updated_at": now,
        "payment_history": payment_history,
        "cod_settled_amount": 0.0,
        "payment_status": calculate_payment_status(total_order, total_received),
        "delivery_status": "Pending",
        "cod_settlement_status": calculate_cod_settlement_status(cod_amount, 0),
    })

    if database.client is None:
        raise HTTPException(
           status_code=503,
           detail="Database connection is unavailable",
    )

    with database.client.start_session() as session:
         with session.start_transaction():

            result = db.orders.insert_one(
                document,
                session=session,
        )

         if customer_id:
            recalculate_customer_stats(
                db=db,
                business_id=business_id,
                customer_id=customer_id,
                session=session,
            )

            saved_order = db.orders.find_one(
              {
                 "_id": result.inserted_id,
                 "business_id": business_id,
             },
            session=session,
        )

    return serialize_order(saved_order)


@router.get("", response_model=list[OrderResponse])
def get_orders(
    search: str = Query(default="", max_length=100),
    status: str | None = None,
    customer_id: str | None = None,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
    current_user: dict = Depends(get_current_user),
):
    db = get_database()
    business_id = get_business_id(current_user)

    query = {"business_id": business_id}

    if status:
        query["status"] = status

    if customer_id:
        query["customer_id"] = customer_id

    if search:
        query["$or"] = [
            {"order_number": {"$regex": search, "$options": "i"}},
            {"customer_name": {"$regex": search, "$options": "i"}},
            {"customer_phone": {"$regex": search, "$options": "i"}},
            {"product_name": {"$regex": search, "$options": "i"}},
        ]

    cursor = (
        db.orders.find(query)
        .sort("order_date", -1)
        .skip(skip)
        .limit(limit)
    )

    return [serialize_order(order) for order in cursor]


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = get_database()
    order = find_order(db, order_id, get_business_id(current_user))
    return serialize_order(order)


@router.put("/{order_id}", response_model=OrderResponse)
def update_order(
    order_id: str,
    data: OrderUpdate,
    current_user: dict = Depends(get_current_user),
):
    db = get_database()
    business_id = get_business_id(current_user)

    existing = find_order(db, order_id, business_id)
    ensure_manual_order(existing)

    customer_id = data.customer_id

    if customer_id:
        if not ObjectId.is_valid(customer_id):
            raise HTTPException(status_code=400, detail="Invalid customer ID")

        customer = db.customers.find_one({
            "_id": ObjectId(customer_id),
            "business_id": business_id,
        })

        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")

    updated_document = data.model_dump()

    total_order = float(updated_document["total_order"])
    cod_amount = float(updated_document.get("cod_amount", 0) or 0)

    payment_history = get_payment_history(existing)
    total_received = get_total_received(payment_history)
    cod_settled_amount = float(existing.get("cod_settled_amount", 0) or 0)

    if total_received > total_order + 0.01:
        raise HTTPException(
            status_code=400,
            detail="Order total cannot be lower than the amount already received",
        )

    if cod_settled_amount > cod_amount + 0.01:
        raise HTTPException(
            status_code=400,
            detail="COD amount cannot be lower than the amount already settled",
        )

    updated_document.update({
        "business_id": business_id,
        "order_number": existing["order_number"],
        "order_date": existing["order_date"],
        "created_at": existing["created_at"],
        "source": existing.get("source", "manual"),
        "updated_at": datetime.now(timezone.utc),
        "payment_history": payment_history,
        "cod_settled_amount": cod_settled_amount,
        "payment_status": calculate_payment_status(total_order, total_received),
        "delivery_status": existing.get("delivery_status", "Pending"),
        "cod_settlement_status": calculate_cod_settlement_status(
            cod_amount,
            cod_settled_amount,
        ),
    })

    if existing.get("delivered_at"):
        updated_document["delivered_at"] = existing["delivered_at"]

    if database.client is None:
        raise HTTPException(
          status_code=503,
          detail="Database connection is unavailable",
        )

    old_customer_id = existing.get("customer_id")
    new_customer_id = updated_document.get("customer_id")

    with database.client.start_session() as session:
        with session.start_transaction():

            db.orders.update_one(
               {
                 "_id": ObjectId(order_id),
                 "business_id": business_id,
               },
            {"$set": updated_document},
            session=session,
            )

        customer_ids = {
            customer_id
            for customer_id in (old_customer_id, new_customer_id)
            if customer_id
        }

        for customer_id in customer_ids:
            recalculate_customer_stats(
                db=db,
                business_id=business_id,
                customer_id=customer_id,
                session=session,
            )

    updated_order = find_order(db, order_id, business_id)
    return serialize_order(updated_order)


@router.patch("/{order_id}/delivery-status", response_model=OrderResponse)
def update_delivery_status(
    order_id: str,
    data: DeliveryStatusUpdate,
    current_user: dict = Depends(get_current_user),
):
    db = get_database()
    business_id = get_business_id(current_user)

    order = find_order(db, order_id, business_id)
    ensure_manual_order(order)

    if database.client is None:
        raise HTTPException(
            status_code=503,
            detail="Database connection is unavailable",
        )

    now = datetime.now(timezone.utc)

    update_fields = {
        "delivery_status": data.delivery_status,
        "updated_at": now,
    }

    if data.delivery_status == "Delivered":
        update_fields["delivered_at"] = now
    elif data.delivery_status in ("Pending", "Shipped", "Returned"):
        update_fields["delivered_at"] = None

    customer_id = order.get("customer_id")

    with database.client.start_session() as session:
        with session.start_transaction():

            db.orders.update_one(
                {
                    "_id": ObjectId(order_id),
                    "business_id": business_id,
                },
                {"$set": update_fields},
                session=session,
            )

            if customer_id:
                recalculate_customer_stats(
                    db=db,
                    business_id=business_id,
                    customer_id=customer_id,
                    session=session,
                )

    updated_order = find_order(db, order_id, business_id)
    return serialize_order(updated_order)


@router.post("/{order_id}/payments", response_model=OrderResponse)
def add_order_payment(
    order_id: str,
    payment: PaymentTransaction,
    current_user: dict = Depends(get_current_user),
):
    db = get_database()
    business_id = get_business_id(current_user)

    order = find_order(db, order_id, business_id)
    ensure_manual_order(order)

    amount = float(payment.amount)
    total_order = float(order.get("total_order", 0) or 0)

    history = get_payment_history(order)
    total_received = get_total_received(history)

    if total_received + amount > total_order + 0.01:
        raise HTTPException(
            status_code=400,
            detail="This payment exceeds the remaining order balance",
        )

    cod_amount = float(order.get("cod_amount", 0) or 0)
    cod_settled_amount = float(order.get("cod_settled_amount", 0) or 0)

    if payment.method == "COD":
        remaining_cod = max(0, cod_amount - cod_settled_amount)

        if amount > remaining_cod + 0.01:
            raise HTTPException(
                status_code=400,
                detail=f"COD settlement cannot exceed the remaining COD amount ({remaining_cod:.2f})",
            )

        cod_settled_amount = round(cod_settled_amount + amount, 2)

    history.append(payment.model_dump())

    new_total_received = get_total_received(history)
    now = datetime.now(timezone.utc)

    db.orders.update_one(
        {
            "_id": ObjectId(order_id),
            "business_id": business_id,
        },
        {
            "$set": {
                "payment_history": history,
                "cod_settled_amount": cod_settled_amount,
                "payment_status": calculate_payment_status(
                    total_order,
                    new_total_received,
                ),
                "cod_settlement_status": calculate_cod_settlement_status(
                    cod_amount,
                    cod_settled_amount,
                ),
                "updated_at": now,
            }
        },
    )

    updated_order = find_order(db, order_id, business_id)
    return serialize_order(updated_order)


@router.delete("/{order_id}")
def cancel_order(
    order_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = get_database()
    business_id = get_business_id(current_user)

    existing = find_order(db, order_id, business_id)
    ensure_manual_order(existing)

    if database.client is None:
        raise HTTPException(
            status_code=503,
            detail="Database connection is unavailable",
        )

    customer_id = existing.get("customer_id")

    with database.client.start_session() as session:
        with session.start_transaction():

            db.orders.update_one(
                {
                    "_id": ObjectId(order_id),
                    "business_id": business_id,
                },
                {
                    "$set": {
                        "status": "Cancelled",
                        "updated_at": datetime.now(timezone.utc),
                    }
                },
                session=session,
            )

            if customer_id:
                recalculate_customer_stats(
                    db=db,
                    business_id=business_id,
                    customer_id=customer_id,
                    session=session,
                )

    return {
        "success": True,
        "message": "Order cancelled successfully",
    }
