
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class ProductCreate(BaseModel):
    name: str = Field(min_length=2, max_length=150)
    sku: str = Field(min_length=2, max_length=50)
    category: str = "General"
    description: str = ""

    cost_price: float = Field(default=0, ge=0)
    selling_price: float = Field(ge=0)

    stock_quantity: int = Field(default=0, ge=0)
    low_stock_threshold: int = Field(default=5, ge=0)

    unit: str = "piece"
    image_url: Optional[str] = None
    is_active: bool = True

    customization: list[str] = Field(default_factory=list)


class ProductUpdate(ProductCreate):
    pass


class ProductResponse(BaseModel):
    id: str
    business_id: str
    name: str
    sku: str
    category: str
    description: str
    cost_price: float
    selling_price: float
    stock_quantity: int
    low_stock_threshold: int
    unit: str
    image_url: Optional[str] = None
    customization: list[str] = Field(default_factory=list)
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(extra="ignore")
