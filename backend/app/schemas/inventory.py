
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator

InventoryCategory = Literal[
    "Finished Products",
    "Raw Materials",
    "Packaging",
    "Accessories",
]

MovementType = Literal[
    "Stock In",
    "Stock Out",
    "Adjustment",
]


class InventoryItemCreate(BaseModel):
    name: str = Field(min_length=2, max_length=150)
    sku: str = Field(min_length=2, max_length=50)
    category: InventoryCategory
    unit: str = Field(default="pcs", min_length=1, max_length=30)

    stock: int = Field(default=0, ge=0)
    low_stock_at: int = Field(default=5, ge=0)
    cost_per_unit: float = Field(default=0, ge=0)

    supplier: str = Field(default="", max_length=150)
    is_active: bool = True


class InventoryItemUpdate(BaseModel):
    name: str = Field(min_length=2, max_length=150)
    sku: str = Field(min_length=2, max_length=50)
    category: InventoryCategory
    unit: str = Field(default="pcs", min_length=1, max_length=30)

    low_stock_at: int = Field(default=5, ge=0)
    cost_per_unit: float = Field(default=0, ge=0)

    supplier: str = Field(default="", max_length=150)

class InventoryItemResponse(BaseModel):
    id: str
    business_id: str
    name: str
    sku: str
    category: InventoryCategory
    unit: str
    stock: int
    low_stock_at: int
    cost_per_unit: float
    supplier: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(extra="ignore")


class StockMovementCreate(BaseModel):
    item_id: str
    type: MovementType
    quantity: int = Field(ge=0)
    reference: str = Field(default="Manual entry", max_length=200)

    @model_validator(mode="after")
    def validate_quantity(self):
        if self.type in ("Stock In", "Stock Out") and self.quantity <= 0:
            raise ValueError(
                "Stock In and Stock Out quantities must be greater than zero"
            )

        return self


class StockMovementResponse(BaseModel):
    id: str
    business_id: str
    item_id: str
    item_name: str
    type: MovementType
    quantity: int
    date: datetime
    reference: str

    model_config = ConfigDict(extra="ignore")
