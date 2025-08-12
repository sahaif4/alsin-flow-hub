from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update

from .. import models, schemas

async def create_notification(db: AsyncSession, notification: schemas.NotificationCreate) -> models.Notification:
    """Create a new notification."""
    db_notification = models.Notification(**notification.model_dump())
    db.add(db_notification)
    await db.commit()
    await db.refresh(db_notification)
    return db_notification

async def get_notifications_for_user(db: AsyncSession, user_id: int, skip: int = 0, limit: int = 30) -> list[models.Notification]:
    """Get all notifications for a specific user."""
    result = await db.execute(
        select(models.Notification)
        .filter(models.Notification.user_id == user_id)
        .order_by(models.Notification.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()

async def mark_notification_as_read(db: AsyncSession, notification_id: int, user_id: int) -> models.Notification | None:
    """Mark a specific notification as read for a user."""
    notification = await db.get(models.Notification, notification_id)
    if not notification or notification.user_id != user_id:
        return None

    notification.is_read = True
    await db.commit()
    await db.refresh(notification)
    return notification

async def mark_all_notifications_as_read(db: AsyncSession, user_id: int) -> dict:
    """Mark all unread notifications as read for a user."""
    await db.execute(
        update(models.Notification)
        .where(models.Notification.user_id == user_id, models.Notification.is_read == False)
        .values(is_read=True)
    )
    await db.commit()
    return {"message": "All notifications marked as read"}
