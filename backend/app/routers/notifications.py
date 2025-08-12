from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from .. import crud, models, schemas
from ..db import get_db
from ..dependencies import get_current_user

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"],
    dependencies=[Depends(get_current_user)],
    responses={403: {"description": "Operation not permitted"}},
)

@router.get("/", response_model=List[schemas.Notification])
async def read_my_notifications(
    skip: int = 0,
    limit: int = 30,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Get all notifications for the currently authenticated user.
    """
    return await crud.get_notifications_for_user(
        db, user_id=current_user.id, skip=skip, limit=limit
    )

@router.post("/{notification_id}/read", response_model=schemas.Notification)
async def mark_one_notification_as_read(
    notification_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Mark a specific notification as read.
    """
    notification = await crud.mark_notification_as_read(
        db, notification_id=notification_id, user_id=current_user.id
    )
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found or you don't have permission to modify it.",
        )
    return notification

@router.post("/read/all", response_model=dict)
async def mark_all_my_notifications_as_read(
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Mark all of the user's unread notifications as read.
    """
    result = await crud.mark_all_notifications_as_read(db, user_id=current_user.id)
    return result
