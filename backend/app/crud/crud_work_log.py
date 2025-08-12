from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from .. import models, schemas

async def create_work_log(db: AsyncSession, log: schemas.WorkLogCreate, user_id: int) -> models.WorkLog:
    """Create a new work log for a user."""
    db_log = models.WorkLog(**log.model_dump(), user_id=user_id)
    db.add(db_log)
    await db.commit()
    await db.refresh(db_log)
    return db_log

async def get_work_logs_by_user(db: AsyncSession, user_id: int, skip: int = 0, limit: int = 100) -> list[models.WorkLog]:
    """Get all work logs for a specific user."""
    result = await db.execute(
        select(models.WorkLog)
        .filter(models.WorkLog.user_id == user_id)
        .order_by(models.WorkLog.log_date.desc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()
