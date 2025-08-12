from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from .. import models, schemas

async def get_payment_by_transaction_id(db: AsyncSession, transaction_id: int) -> models.Payment | None:
    """Get a payment record by its transaction ID."""
    result = await db.execute(select(models.Payment).filter(models.Payment.transaction_id == transaction_id))
    return result.scalars().first()

async def record_payment(
    db: AsyncSession, transaction_id: int, payment_method: models.PaymentMethod, proof_url: str | None = None
) -> models.Payment | None:
    """
    Record a payment for a rental transaction.
    """
    payment = await get_payment_by_transaction_id(db, transaction_id)
    if not payment or payment.status != models.PaymentStatus.PENDING:
        raise ValueError("Payment cannot be recorded for this transaction.")

    payment.payment_method = payment_method
    payment.payment_proof_url = proof_url
    payment.status = models.PaymentStatus.PAID

    await db.commit()
    await db.refresh(payment)
    return payment
