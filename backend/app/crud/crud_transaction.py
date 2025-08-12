from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from .. import models, schemas
from . import crud_tool, crud_notification

async def create_transaction(db: AsyncSession, transaction: schemas.TransactionCreate, user_id: int) -> models.Transaction:
    """
    Create a new transaction (lending or rental) and update the tool's status.
    If it's a rental, a payment record is also created.
    """
    tool = await crud_tool.get_tool(db, transaction.tool_id)
    if not tool or tool.status != models.ToolStatus.TERSEDIA:
        raise ValueError("Tool is not available for transaction.")

    if transaction.transaction_type == models.TransactionType.RENTAL:
        if not tool.price or tool.price <= 0:
            raise ValueError("This tool is not available for rental (price not set).")

    db_transaction = models.Transaction(
        tool_id=transaction.tool_id,
        user_id=user_id,
        start_date=transaction.start_date,
        end_date=transaction.end_date,
        transaction_type=transaction.transaction_type,
        status=models.TransactionStatus.PENDING_APPROVAL
    )

    if transaction.transaction_type == models.TransactionType.RENTAL:
        duration_days = (transaction.end_date - transaction.start_date).days
        if duration_days < 1:
            duration_days = 1
        total_price = tool.price * duration_days

        payment = models.Payment(
            amount=total_price,
            status=models.PaymentStatus.PENDING,
            transaction=db_transaction
        )
        db.add(payment)

    tool.status = models.ToolStatus.DIPINJAM

    db.add(db_transaction)
    await db.commit()
    await db.refresh(db_transaction)
    return db_transaction

async def get_transaction(db: AsyncSession, transaction_id: int) -> models.Transaction | None:
    """Get a single transaction by its ID, with related user and tool."""
    result = await db.execute(
        select(models.Transaction)
        .options(selectinload(models.Transaction.user), selectinload(models.Transaction.tool))
        .filter(models.Transaction.id == transaction_id)
    )
    return result.scalars().first()

async def get_user_transactions(db: AsyncSession, user_id: int) -> list[models.Transaction]:
    """Get all transactions for a specific user."""
    result = await db.execute(
        select(models.Transaction)
        .options(selectinload(models.Transaction.tool))
        .filter(models.Transaction.user_id == user_id)
        .order_by(models.Transaction.start_date.desc())
    )
    return result.scalars().all()

async def get_all_transactions(db: AsyncSession, skip: int = 0, limit: int = 100) -> list[models.Transaction]:
    """Get a list of all transactions for admin view."""
    result = await db.execute(
        select(models.Transaction)
        .options(selectinload(models.Transaction.user), selectinload(models.Transaction.tool))
        .order_by(models.Transaction.created_at.desc())
        .offset(skip).limit(limit)
    )
    return result.scalars().all()

async def approve_transaction(db: AsyncSession, transaction_id: int) -> models.Transaction | None:
    """Approve a transaction."""
    db_transaction = await get_transaction(db, transaction_id)
    if db_transaction and db_transaction.status == models.TransactionStatus.PENDING_APPROVAL:
        db_transaction.status = models.TransactionStatus.APPROVED
        await db.commit()
        await db.refresh(db_transaction)

        await crud_notification.create_notification(
            db,
            notification=schemas.NotificationCreate(
                user_id=db_transaction.user_id,
                message=f"Permintaan peminjaman Anda untuk alat '{db_transaction.tool.name}' telah disetujui.",
                link_url=f"/transactions/{db_transaction.id}"
            )
        )
    return db_transaction

async def reject_transaction(db: AsyncSession, transaction_id: int) -> models.Transaction | None:
    """Reject a transaction and revert tool status."""
    db_transaction = await get_transaction(db, transaction_id)
    if db_transaction and db_transaction.status == models.TransactionStatus.PENDING_APPROVAL:
        db_transaction.status = models.TransactionStatus.REJECTED

        tool = await crud_tool.get_tool(db, db_transaction.tool_id)
        if tool:
            tool.status = models.ToolStatus.TERSEDIA

        await db.commit()
        await db.refresh(db_transaction)

        await crud_notification.create_notification(
            db,
            notification=schemas.NotificationCreate(
                user_id=db_transaction.user_id,
                message=f"Permintaan peminjaman Anda untuk alat '{db_transaction.tool.name}' telah ditolak.",
                link_url=f"/transactions/{db_transaction.id}"
            )
        )
    return db_transaction
