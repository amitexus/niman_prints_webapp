
from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field


CustomerType = Literal["Individual", "Corporate", "Wholesale"]


class CustomerCreate(BaseModel):
    name: str = Field(min_length=2, max_length=150)
    phone: str = Field(min_length=5, max_length=30)
    email: str = Field(default="", max_length=150)
    address: str = Field(default="", max_length=300)
    type: CustomerType = "Individual"
    notes: str = Field(default="", max_length=2000)


class CustomerUpdate(CustomerCreate):
    pass


class CustomerResponse(BaseModel):
    id: str
    business_id: str
    name: str
    phone: str
    email: str = ""
    address: str = ""
    type: CustomerType = "Individual"
    total_orders: int = 0
    total_spent: float = 0
    last_order: Optional[datetime] = None
    notes: str = ""
    is_active: bool = True
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(extra="ignore")
