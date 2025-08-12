from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from .. import crud, models, schemas
from ..db import get_db
from ..dependencies import get_current_user, get_current_admin_user

router = APIRouter(
    prefix="/maintenance",
    tags=["Maintenance"],
    responses={404: {"description": "Not found"}},
)

@router.post("/report", response_model=schemas.MaintenanceReport, status_code=status.HTTP_201_CREATED)
async def create_new_maintenance_report(
    report: schemas.MaintenanceReportCreate,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Create a new maintenance report for a tool.
    Any authenticated user can report an issue.
    """
    try:
        new_report = await crud.create_maintenance_report(
            db=db, report=report, reporter_id=current_user.id
        )
        return new_report
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/", response_model=List[schemas.MaintenanceReport])
async def get_all_reports(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin_user),
):
    """
    Get all maintenance reports. (Admin only)
    """
    return await crud.get_all_maintenance_reports(db, skip=skip, limit=limit)

@router.post("/{report_id}/assign/{technician_id}", response_model=schemas.MaintenanceReport)
async def assign_technician(
    report_id: int,
    technician_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin_user),
):
    """
    Assign a technician to a maintenance report. (Admin only)
    """
    # TODO: Add logic to verify the technician_id belongs to a user with the 'TEKNISI_OPERATOR' role.
    updated_report = await crud.assign_technician_to_report(
        db, report_id=report_id, technician_id=technician_id
    )
    if not updated_report:
        raise HTTPException(status_code=404, detail="Report not found or cannot be assigned.")
    return updated_report

@router.post("/{report_id}/resolve", response_model=schemas.MaintenanceReport)
async def resolve_report(
    report_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin_user),
):
    """
    Mark a maintenance report as resolved. (Admin only)
    This action sets the tool's status back to 'tersedia' (available).
    """
    resolved_report = await crud.resolve_maintenance_report(db, report_id=report_id)
    if not resolved_report:
        raise HTTPException(status_code=404, detail="Report not found or not in_progress.")
    return resolved_report
