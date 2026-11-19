
from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field


OrderStatus = Literal[
    "New",
    "Design Approval",
    "In Production",
    "Ready to Ship",
    "Shipped",
    "Delivered",
    "Completed",
    "Cancelled",
    "Returned",
]

PaymentStatus = Literal[
    "Paid",
    "Unpaid",
    "Partial",
]

DeliveryStatus = Literal[
    "Pending",
    "Shipped",
    "Delivered",
    "Returned",
]

CODSettlementStatus = Literal[
    "Not Applicable",
    "Pending",
    "Partially Settled",
    "Settled",
]

PaymentMethod = Literal[
    "Online",
    "COD",
    "Cash",
    "Bank Transfer",
    "Other",
]


class PaymentTransaction(BaseModel):
    amount: float = Field(gt=0)
    method: PaymentMethod
    payment_date: datetime = Field(default_factory=datetime.utcnow)
    reference: str = Field(default="", max_length=150)
    notes: str = Field(default="", max_length=500)


class OrderCreate(BaseModel):
    customer_id: Optional[str] = None
    customer_name: str = Field(min_length=2, max_length=150)
    customer_phone: str = Field(default="", max_length=100)
    customer_address: str = Field(default="", max_length=300)

    product_name: str = Field(min_length=1, max_length=200)
    quantity: float = Field(default=1, gt=0)
    rate: float = Field(default=0, ge=0)

    delivery_charge: float = Field(default=0, ge=0)
    total_order: float = Field(default=0, ge=0)

    online_payment: float = Field(default=0, ge=0)
    cod_amount: float = Field(default=0, ge=0)

    delivery_type: str = Field(default="", max_length=100)

    cost: float = Field(default=0, ge=0)
    profit: float = 0

    status: OrderStatus = "New"
    payment_status: PaymentStatus = "Unpaid"
    delivery_status: DeliveryStatus = "Pending"
    cod_settlement_status: CODSettlementStatus = "Not Applicable"


class OrderUpdate(BaseModel):
    customer_id: Optional[str] = None
    customer_name: str = Field(min_length=2, max_length=150)
    customer_phone: str = Field(default="", max_length=100)
    customer_address: str = Field(default="", max_length=300)

    product_name: str = Field(min_length=1, max_length=200)
    quantity: float = Field(default=1, gt=0)
    rate: float = Field(default=0, ge=0)

    delivery_charge: float = Field(default=0, ge=0)
    total_order: float = Field(default=0, ge=0)

    online_payment: float = Field(default=0, ge=0)
    cod_amount: float = Field(default=0, ge=0)

    delivery_type: str = Field(default="", max_length=100)

    cost: float = Field(default=0, ge=0)
    profit: float = 0

    status: OrderStatus
    payment_status: PaymentStatus
    delivery_status: DeliveryStatus = "Pending"
    cod_settlement_status: CODSettlementStatus = "Not Applicable"


class OrderResponse(BaseModel):
    id: str
    business_id: str
    order_number: str

    customer_id: Optional[str] = None
    customer_name: str
    customer_phone: str = ""
    customer_address: str = ""

    product_name: str
    quantity: float
    rate: float

    delivery_charge: float
    total_order: float

    online_payment: float
    cod_amount: float

    delivery_type: str = ""

    cost: float
    profit: float

    status: str
    payment_status: str

    delivery_status: str = "Pending"
    cod_settlement_status: str = "Not Applicable"
    cod_settled_amount: float = 0.0
    payment_history: list[PaymentTransaction] = Field(default_factory=list)

    order_date: datetime
    created_at: datetime
    updated_at: datetime

    delivered_at: Optional[datetime] = None
    source: str = "manual"

    model_config = ConfigDict(extra="ignore")


# Historical Excel import schemas — preserved.

class HistoricalOrderCreate(BaseModel):
    order_date: datetime

    customer_id: Optional[str] = None
    customer_name: str = Field(min_length=1, max_length=150)
    customer_phone: str = Field(default="", max_length=100)
    customer_address: str = Field(default="", max_length=300)

    product_name: str = Field(min_length=1, max_length=200)
    quantity: float = Field(default=1, gt=0)
    rate: float = Field(default=0, ge=0)

    delivery_charge: float = Field(default=0, ge=0)
    total_order: float = Field(default=0, ge=0)
    online_payment: float = Field(default=0, ge=0)
    cod_amount: float = Field(default=0, ge=0)

    delivery_type: str = Field(default="", max_length=100)

    cost: float = Field(default=0, ge=0)
    profit: float = 0

    source: str = "excel_import"
    source_sheet: str = "Sheet1"
    source_row: int = Field(gt=0)
    import_key: str = Field(min_length=1, max_length=200)


class HistoricalOrderResponse(BaseModel):
    id: str
    business_id: str
    customer_id: Optional[str] = None

    order_date: datetime
    customer_name: str
    customer_phone: str = ""
    customer_address: str = ""

    product_name: str
    quantity: float
    rate: float

    delivery_charge: float
    total_order: float
    online_payment: float
    cod_amount: float

    delivery_type: str = ""
    cost: float
    profit: float

    source: str
    source_sheet: str
    source_row: int
    import_key: str

    created_at: datetime

    model_config = ConfigDict(extra="ignore")
