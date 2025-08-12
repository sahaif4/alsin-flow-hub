from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_

from .. import models, schemas

async def create_message(db: AsyncSession, message: schemas.MessageCreate, sender_id: int) -> models.Message:
    """Save a new message to the database."""
    db_message = models.Message(
        **message.model_dump(),
        sender_id=sender_id,
    )
    db.add(db_message)
    await db.commit()
    await db.refresh(db_message)
    return db_message

async def get_message_history(db: AsyncSession, user1_id: int, user2_id: int) -> list[models.Message]:
    """Get the message history between two users."""
    messages = await db.execute(
        select(models.Message)
        .filter(
            or_(
                (models.Message.sender_id == user1_id) & (models.Message.receiver_id == user2_id),
                (models.Message.sender_id == user2_id) & (models.Message.receiver_id == user1_id)
            )
        )
        .order_by(models.Message.created_at.asc())
    )
    return messages.scalars().all()
