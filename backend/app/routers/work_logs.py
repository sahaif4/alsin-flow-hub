from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from .. import crud, models, schemas
from ..db import get_db
from ..dependencies import get_current_user, get_current_admin_user

router = APIRouter(
    prefix="/worklogs",
    tags=["Work Logs"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=schemas.WorkLog, status_code=status.HTTP_201_CREATED)
async def create_new_work_log(
    log: schemas.WorkLogCreate,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Create a new work log for the currently authenticated user.
    A technician or operator would use this to log their daily work.
    """
    return await crud.create_work_log(db=db, log=log, user_id=current_user.id)

@router.get("/me", response_model=List[schemas.WorkLog])
async def read_my_work_logs(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Get all work logs for the currently authenticated user.
    """
    return await crud.get_work_logs_by_user(db, user_id=current_user.id, skip=skip, limit=limit)

@router.get("/{user_id}", response_model=List[schemas.WorkLog])
async def read_user_work_logs(
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin_user),
):
    """
    Get all work logs for a specific user. (Admin only)
    """
    logs = await crud.get_work_logs_by_user(db, user_id=user_id, skip=skip, limit=limit)
    if not logs:
        # It's not an error if a user has no logs, but you could return 404
        # if the user_id itself doesn't exist. For now, returning an empty list is fine.
        pass
    return logs
