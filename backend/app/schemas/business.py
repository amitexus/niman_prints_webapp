from datetime import datetime, timezone
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class BusinessCreate(BaseModel):
    business_name: str = Field(
        min_length=2,
        max_length=100,
    )

    tagline: str = ""

    email: str = ""
    phone: str = ""
    whatsapp: str = ""

    address: str = ""
    city: str = ""
    country: str = "Nepal"

    currency: Literal["NPR"] = "NPR"
    timezone: str = "Asia/Kathmandu"

    date_format: Literal[
        "YYYY-MM-DD",
        "DD/MM/YYYY",
        "MM/DD/YYYY",
    ] = "YYYY-MM-DD"

    order_prefix: str = "NP"

    default_delivery_charge: float = Field(
        default=100,
        ge=0,
    )

    free_delivery_threshold: float = Field(
        default=2000,
        ge=0,
    )

    vat_registered: bool = False
    vat_number: str = ""
    pan_number: str = ""


class BusinessResponse(BaseModel):
    id: str
    business_name: str
    tagline: str

    email: str
    phone: str
    whatsapp: str

    address: str
    city: str
    country: str

    currency: str
    timezone: str
    date_format: str
    order_prefix: str

    default_delivery_charge: float
    free_delivery_threshold: float

    vat_registered: bool
    vat_number: str
    pan_number: str

    created_at: datetime

    model_config = ConfigDict(
        extra="ignore",
    )


def create_business_document(data: BusinessCreate) -> dict:
    """Convert validated business data into a MongoDB document."""

    document = data.model_dump()

    document["created_at"] = datetime.now(timezone.utc)
    document["updated_at"] = datetime.now(timezone.utc)
    document["is_active"] = True

    return document