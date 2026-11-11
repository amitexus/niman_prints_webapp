
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


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
