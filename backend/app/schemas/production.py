
from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, Field


ProductionStatus = Literal[
    "Pending Design",
    "Design Approval",
    "Printing",
    "Quality Check",
    "Packaging",
    "Ready for Dispatch",
    "Completed",
    "Cancelled",
]

ProductionPriority = Literal[
    "Low",
    "Normal",
    "High",
    "Urgent",
]


class ProductionJobCreate(BaseModel):
    order_id: str | None = None
    customer_name: str | None = Field(default=None, max_length=200)

    product_name: str = Field(min_length=1, max_length=200)
    quantity: int = Field(gt=0)

    priority: ProductionPriority = "Normal"
    status: ProductionStatus = "Pending Design"

    assigned_to: str | None = None
    due_date: date | None = None

    design_instructions: str = ""
    production_notes: str = ""



class ProductionJobUpdate(BaseModel):
    product_name: str | None = Field(
        default=None,
        min_length=1,
        max_length=200,
    )

    quantity: int | None = Field(default=None, gt=0)

    priority: ProductionPriority | None = None
    status: ProductionStatus | None = None

    assigned_to: str | None = None
    due_date: date | None = None

    design_instructions: str | None = None
    production_notes: str | None = None

    status_note: str | None = Field(
        default=None,
        max_length=500,
    )



class ProductionHistoryEntry(BaseModel):
    from_status: str | None = None
    to_status: str
    changed_by: str = "System"
    notes: str = ""
    changed_at: datetime


class ProductionJobResponse(BaseModel):
    id: str
    business_id: str

    order_id: str | None = None
    order_number: str | None = None
    customer_name: str | None = None


    product_name: str
    quantity: int

    priority: ProductionPriority
    status: ProductionStatus

    assigned_to: str | None = None
    due_date: date | None = None

    design_instructions: str = ""
    production_notes: str = ""

    created_at: datetime
    updated_at: datetime
    history: list[ProductionHistoryEntry] = []
