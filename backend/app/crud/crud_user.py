from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from .. import models, schemas
from ..security import get_password_hash
from sqlalchemy import func

async def get_user_by_email(db: AsyncSession, email: str) -> models.User | None:
    """
    Get a single user by their email address.
    """
    result = await db.execute(select(models.User).filter(models.User.email == email))
    return result.scalars().first()

async def get_users(db: AsyncSession, skip: int = 0, limit: int = 100) -> list[models.User]:
    """Get a list of all users."""
    result = await db.execute(select(models.User).order_by(models.User.id).offset(skip).limit(limit))
    return result.scalars().all()

async def create_user(db: AsyncSession, user: schemas.UserCreate) -> models.User:
    """
    Create a new user in the database.
    """
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        full_name=user.full_name,
        hashed_password=hashed_password,
        role=user.role,
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

async def approve_user(db: AsyncSession, user_id: int) -> models.User | None:
    """Approve a user registration."""
    user = await db.get(models.User, user_id)
    if user and not user.approved_at:
        user.approved_at = func.now()
        await db.commit()
        await db.refresh(user)
    return user
