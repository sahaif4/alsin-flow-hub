from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import extract, func

from .. import models

async def get_tool_usage_stats(db: AsyncSession, year: int, month: int) -> list:
    """
    Get statistics of how many times each tool was used in a given month.
    """
    result = await db.execute(
        select(
            models.Tool.name,
            func.count(models.Transaction.id).label("transaction_count")
        )
        .join(models.Transaction, models.Tool.id == models.Transaction.tool_id)
        .filter(
            extract('year', models.Transaction.start_date) == year,
            extract('month', models.Transaction.start_date) == month,
            models.Transaction.status == models.TransactionStatus.APPROVED
        )
        .group_by(models.Tool.name)
        .order_by(func.count(models.Transaction.id).desc())
    )
    return result.all()

async def get_rental_income_stats(db: AsyncSession, year: int, month: int) -> float:
    """
    Get the total rental income for a given month.
    """
    result = await db.execute(
        select(func.sum(models.Payment.amount))
        .join(models.Transaction, models.Payment.transaction_id == models.Transaction.id)
        .filter(
            extract('year', models.Transaction.start_date) == year,
            extract('month', models.Transaction.start_date) == month,
            models.Payment.status == models.PaymentStatus.PAID,
            models.Transaction.transaction_type == models.TransactionType.RENTAL
        )
    )
    total_income = result.scalar_one_or_none()
    return total_income or 0.0
