
from datetime import date, datetime
from hashlib import sha256
from io import BytesIO
import re

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
)
from openpyxl import load_workbook

from app.core.dependencies import get_current_user
from app.services.order_import_service import import_historical_order


router = APIRouter(
    prefix="/customers/import",
    tags=["Customer Import"],
)

MAX_FILE_SIZE = 10 * 1024 * 1024
PREVIEW_LIMIT = 20

EXPECTED_HEADERS = [
    "Order Date",
    "Name",
    "Address",
    "Mobile Number",
    "Product",
    "QTY",
    "Rate",
    "Delivery Charge",
    "Total Order",
    "Online",
    "COD",
    "Delivery Type",
    "Cost",
    "Profit (Ex Add)",
]


def get_business_id(current_user: dict) -> str:
    return str(current_user["business_id"])


def normalize_phone(value):
    if value is None:
        return ""

    digits = re.sub(r"\D", "", str(value))

    if digits.startswith("977") and len(digits) == 13:
        digits = digits[3:]

    return digits


def extract_phone_numbers(value):
    if value is None:
        return []

    groups = re.findall(r"\d{7,15}", str(value))
    numbers = []

    for group in groups:
        if group.startswith("977") and len(group) == 13:
            group = group[3:]

        if group not in numbers:
            numbers.append(group)

    return numbers


def safe_number(value, default=0):
    try:
        if value is None or value == "":
            return default
        return float(value)
    except (ValueError, TypeError):
        return default


def parse_workbook(content: bytes):
    try:
        workbook = load_workbook(
            BytesIO(content),
            read_only=True,
            data_only=True,
        )
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Unable to read this Excel file.",
        )

    try:
        if "Sheet1" not in workbook.sheetnames:
            raise HTTPException(
                status_code=400,
                detail="The workbook must contain a Sheet1 worksheet.",
            )

        sheet = workbook["Sheet1"]

        header_row = next(
            sheet.iter_rows(
                min_row=1,
                max_row=1,
                values_only=True,
            ),
            None,
        )

        if header_row is None:
            raise HTTPException(
                status_code=400,
                detail="The Excel worksheet is empty.",
            )

        headers = [
            str(cell).strip() if cell is not None else ""
            for cell in header_row
        ]

        if headers[:len(EXPECTED_HEADERS)] != EXPECTED_HEADERS:
            raise HTTPException(
                status_code=400,
                detail="Sheet1 columns do not match the expected Niman Prints order format.",
            )

        valid_rows = []
        skipped_rows = []
        phone_counts = {}
        phone_review_rows = []

        for row_number, values in enumerate(
            sheet.iter_rows(min_row=2, values_only=True),
            start=2,
        ):
            values = list(values[:14])

            if not any(value is not None for value in values):
                continue

            (
                order_date,
                name,
                address,
                phone,
                product,
                quantity,
                rate,
                delivery_charge,
                total_order,
                online,
                cod,
                delivery_type,
                cost,
                profit,
            ) = values

            if not isinstance(order_date, (datetime, date)):
                skipped_rows.append({
                    "row": row_number,
                    "reason": "Not an order row: missing or invalid order date.",
                })
                continue

            if not name or not product:
                skipped_rows.append({
                    "row": row_number,
                    "reason": "Customer name or product is missing.",
                })
                continue

            phone_text = (
                str(phone).strip() if phone is not None else ""
            )

            phone_numbers = extract_phone_numbers(phone)

            if len(phone_numbers) > 1:
                phone_status = "multiple_numbers"
                normalized_phone = ""

            elif (
                len(phone_numbers) == 1
                and len(phone_numbers[0]) == 10
            ):
                phone_status = "valid"
                normalized_phone = phone_numbers[0]

                phone_counts[normalized_phone] = (
                    phone_counts.get(normalized_phone, 0) + 1
                )

            elif not phone_numbers:
                phone_status = "missing"
                normalized_phone = ""

            else:
                phone_status = "needs_review"
                normalized_phone = ""

            order_row = {
                "source_row": row_number,
                "order_date": order_date.isoformat(),
                "customer_name": str(name).strip(),
                "customer_address": str(address or "").strip(),
                "customer_phone": phone_text,
                "normalized_phone": normalized_phone,
                "phone_numbers": phone_numbers,
                "phone_status": phone_status,
                "product_name": str(product).strip(),
                "quantity": safe_number(quantity, 1),
                "rate": safe_number(rate),
                "delivery_charge": safe_number(delivery_charge),
                "total_order": safe_number(total_order),
                "online_payment": safe_number(online),
                "cod_amount": safe_number(cod),
                "delivery_type": str(delivery_type or "").strip(),
                "cost": safe_number(cost),
                "profit": safe_number(profit),
            }

            valid_rows.append(order_row)

            if phone_status in (
                "multiple_numbers",
                "needs_review",
                "missing",
            ):
                phone_review_rows.append({
                    "source_row": row_number,
                    "customer_name": order_row["customer_name"],
                    "customer_phone": phone_text,
                    "normalized_phone": normalized_phone,
                    "phone_numbers": phone_numbers,
                    "phone_status": phone_status,
                    "customer_address": order_row["customer_address"],
                })

        duplicate_phone_count = sum(
            1 for count in phone_counts.values() if count > 1
        )

        summary = {
            "valid_order_rows": len(valid_rows),
            "skipped_rows": len(skipped_rows),
            "unique_valid_phone_numbers": len(phone_counts),
            "duplicate_phone_numbers": duplicate_phone_count,
            "missing_phone_rows": sum(
                1 for row in valid_rows
                if row["phone_status"] == "missing"
            ),
            "multiple_number_rows": sum(
                1 for row in valid_rows
                if row["phone_status"] == "multiple_numbers"
            ),
            "phone_review_rows": len(phone_review_rows),
        }

        return {
            "summary": summary,
            "valid_rows": valid_rows,
            "skipped_rows": skipped_rows,
            "phone_review_rows": phone_review_rows,
        }

    finally:
        workbook.close()


async def read_excel_file(file: UploadFile) -> bytes:
    if not file.filename or not file.filename.lower().endswith(".xlsx"):
        raise HTTPException(
            status_code=400,
            detail="Please upload an .xlsx Excel file.",
        )

    content = await file.read(MAX_FILE_SIZE + 1)

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="File size must not exceed 10 MB.",
        )

    if not content:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is empty.",
        )

    return content


@router.post("/preview")
async def preview_customer_import(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    content = await read_excel_file(file)

    workbook_hash = sha256(content).hexdigest()
    parsed = parse_workbook(content)

    return {
        "success": True,
        "message": "Excel preview completed. No database records were changed.",
        "filename": file.filename,
        "sheet": "Sheet1",
        "workbook_hash": workbook_hash,
        "summary": parsed["summary"],
        "preview": parsed["valid_rows"][:PREVIEW_LIMIT],
        "skipped": parsed["skipped_rows"][:PREVIEW_LIMIT],
        "phone_review": parsed["phone_review_rows"],
    }


@router.post("/execute")
async def execute_customer_import(
    file: UploadFile = File(...),
    expected_workbook_hash: str = Form(...),
    confirm_import: bool = Form(...),
    current_user: dict = Depends(get_current_user),
):
    if not confirm_import:
        raise HTTPException(
            status_code=400,
            detail="Import confirmation is required.",
        )

    if not re.fullmatch(r"[a-f0-9]{64}", expected_workbook_hash):
        raise HTTPException(
            status_code=400,
            detail="Invalid workbook fingerprint.",
        )

    content = await read_excel_file(file)

    workbook_hash = sha256(content).hexdigest()

    if workbook_hash != expected_workbook_hash:
        raise HTTPException(
            status_code=409,
            detail="The uploaded workbook differs from the previewed workbook. Please preview it again.",
        )

    parsed = parse_workbook(content)
    business_id = get_business_id(current_user)

    results = {
        "imported": 0,
        "duplicates": 0,
        "linked_orders": 0,
        "unlinked_orders": 0,
        "new_customers": 0,
        "failed": 0,
    }

    failed_rows = []

    for row in parsed["valid_rows"]:
        try:
            result = import_historical_order(
                business_id=business_id,
                row=row,
                workbook_hash=workbook_hash,
            )

            if result["status"] == "duplicate":
                results["duplicates"] += 1
                continue

            results["imported"] += 1

            if result.get("customer_id"):
                results["linked_orders"] += 1
            else:
                results["unlinked_orders"] += 1

            if result.get("customer_created"):
                results["new_customers"] += 1

        except Exception as error:
            results["failed"] += 1

            failed_rows.append({
                "source_row": row["source_row"],
                "customer_name": row["customer_name"],
                "reason": (
                    "This order failed. Its individual database "
                    "transaction was rolled back."
                ),
                "error_type": type(error).__name__,
            })

    return {
        "success": results["failed"] == 0,
        "message": "Historical import processing completed.",
        "filename": file.filename,
        "workbook_hash": workbook_hash,
        "summary": {
            **results,
            "skipped_excel_rows": len(parsed["skipped_rows"]),
            "total_valid_order_rows": len(parsed["valid_rows"]),
        },
        "failed_rows": failed_rows[:100],
    }
