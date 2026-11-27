
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query
from pymongo.errors import DuplicateKeyError

from app.database import get_database
from app.core.dependencies import get_current_user

from app.schemas.production import (
    ProductionJobCreate,
    ProductionJobUpdate,
    ProductionJobResponse,
    ProductionStatus,
)

from app.services.production_service import (
    serialize_production_job,
    create_production_job,
    get_production_job,
    list_production_jobs,
    update_production_job,
)


router = APIRouter(
    prefix="/production",
    tags=["Production Management"],
)


def get_business_id(current_user: dict) -> str:
    business_id = current_user.get("business_id")

    if not business_id or not ObjectId.is_valid(str(business_id)):
        raise HTTPException(
            status_code=403,
            detail="User is not linked to a valid business",
        )

    return str(business_id)


@router.post(
    "",
    response_model=ProductionJobResponse,
    status_code=201,
)
def add_production_job(
    data: ProductionJobCreate,
    current_user: dict = Depends(get_current_user),
):
    db = get_database()
    business_id = get_business_id(current_user)

    try:
        job = create_production_job(
            db,
            business_id,
            data.model_dump(),
            created_by=str(
                current_user.get("email")
                or current_user.get("_id")
                or "System"
            ),
        )

    except DuplicateKeyError:
        raise HTTPException(
            status_code=409,
            detail="A production job already exists for this order",
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    return serialize_production_job(job)


@router.get(
    "",
    response_model=list[ProductionJobResponse],
)
def get_production_jobs(
    status: ProductionStatus | None = Query(default=None),
    current_user: dict = Depends(get_current_user),
):
    db = get_database()
    business_id = get_business_id(current_user)

    jobs = list_production_jobs(
        db,
        business_id,
        status,
    )

    return [
        serialize_production_job(job)
        for job in jobs
    ]


@router.get(
    "/{job_id}",
    response_model=ProductionJobResponse,
)
def get_production_job_by_id(
    job_id: str,
    current_user: dict = Depends(get_current_user),
):
    if not ObjectId.is_valid(job_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid production job ID",
        )

    db = get_database()
    business_id = get_business_id(current_user)

    job = get_production_job(
        db,
        business_id,
        job_id,
    )

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Production job not found",
        )

    return serialize_production_job(job)


@router.put(
    "/{job_id}",
    response_model=ProductionJobResponse,
)
def edit_production_job(
    job_id: str,
    data: ProductionJobUpdate,
    current_user: dict = Depends(get_current_user),
):
    if not ObjectId.is_valid(job_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid production job ID",
        )

    db = get_database()
    business_id = get_business_id(current_user)

    existing = get_production_job(
        db,
        business_id,
        job_id,
    )

    if not existing:
        raise HTTPException(
            status_code=404,
            detail="Production job not found",
        )

    try:
        updated_job = update_production_job(
            db,
            business_id,
            job_id,
            data.model_dump(exclude_unset=True),
            changed_by=str(
                current_user.get("email")
                or current_user.get("_id")
                or "System"
            ),
        )

    except ValueError as error:
        raise HTTPException(
            status_code=422,
            detail=str(error),
        )

    if not updated_job:
        raise HTTPException(
            status_code=404,
            detail="Production job not found",
        )

    return serialize_production_job(updated_job)
