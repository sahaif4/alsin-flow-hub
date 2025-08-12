from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from . import models, schemas
from .security import get_password_hash


# ==================
# User CRUD
# ==================

async def get_user_by_email(db: AsyncSession, email: str) -> models.User | None:
    """
    Get a single user by their email address.
    """
    result = await db.execute(select(models.User).filter(models.User.email == email))
    return result.scalars().first()

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

# ==================
# Tool CRUD
# ==================

async def get_tool(db: AsyncSession, tool_id: int) -> models.Tool | None:
    """Get a single tool by its ID."""
    result = await db.execute(select(models.Tool).filter(models.Tool.id == tool_id))
    return result.scalars().first()

async def get_tools(db: AsyncSession, skip: int = 0, limit: int = 100) -> list[models.Tool]:
    """Get a list of all tools with pagination."""
    result = await db.execute(select(models.Tool).offset(skip).limit(limit))
    return result.scalars().all()

async def create_tool(db: AsyncSession, tool: schemas.ToolCreate) -> models.Tool:
    """Create a new tool."""
    db_tool = models.Tool(**tool.model_dump())
    db.add(db_tool)
    await db.commit()
    await db.refresh(db_tool)
    return db_tool

async def update_tool(db: AsyncSession, tool_id: int, tool_update: schemas.ToolUpdate) -> models.Tool | None:
    """Update an existing tool."""
    db_tool = await get_tool(db, tool_id)
    if db_tool:
        update_data = tool_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_tool, key, value)
        await db.commit()
        await db.refresh(db_tool)
    return db_tool

async def delete_tool(db: AsyncSession, tool_id: int) -> bool:
    """Delete a tool."""
    db_tool = await get_tool(db, tool_id)
    if db_tool:
        await db.delete(db_tool)
        await db.commit()
        return True
    return False

from sqlalchemy.orm import selectinload
from sqlalchemy import or_, extract, func

# ==================
# Transaction CRUD
# ==================

async def create_transaction(db: AsyncSession, transaction: schemas.TransactionCreate, user_id: int) -> models.Transaction:
    """
    Create a new transaction (lending or rental) and update the tool's status.
    If it's a rental, a payment record is also created.
    """
    tool = await get_tool(db, transaction.tool_id)
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

async def approve_transaction(db: AsyncSession, transaction_id: int) -> models.Transaction | None:
    """Approve a transaction."""
    db_transaction = await get_transaction(db, transaction_id)
    if db_transaction and db_transaction.status == models.TransactionStatus.PENDING_APPROVAL:
        db_transaction.status = models.TransactionStatus.APPROVED
        await db.commit()
        await db.refresh(db_transaction)
    return db_transaction

async def reject_transaction(db: AsyncSession, transaction_id: int) -> models.Transaction | None:
    """Reject a transaction and revert tool status."""
    db_transaction = await get_transaction(db, transaction_id)
    if db_transaction and db_transaction.status == models.TransactionStatus.PENDING_APPROVAL:
        db_transaction.status = models.TransactionStatus.REJECTED

        tool = await get_tool(db, db_transaction.tool_id)
        if tool:
            tool.status = models.ToolStatus.TERSEDIA

        await db.commit()
        await db.refresh(db_transaction)
    return db_transaction

# ==========================
# Maintenance Report CRUD
# ==========================

async def create_maintenance_report(db: AsyncSession, report: schemas.MaintenanceReportCreate, reporter_id: int) -> models.MaintenanceReport:
    """
    Create a new maintenance report and update the tool's status.
    """
    tool = await get_tool(db, report.tool_id)
    if not tool:
        raise ValueError("Tool not found.")

    db_report = models.MaintenanceReport(
        **report.model_dump(),
        reporter_id=reporter_id,
        status=models.MaintenanceStatus.OPEN
    )

    tool.status = models.ToolStatus.DALAM_PERAWATAN

    db.add(db_report)
    await db.commit()
    await db.refresh(db_report)
    return db_report

async def get_maintenance_report(db: AsyncSession, report_id: int) -> models.MaintenanceReport | None:
    """Get a single maintenance report by ID."""
    result = await db.execute(
        select(models.MaintenanceReport)
        .options(
            selectinload(models.MaintenanceReport.reporter),
            selectinload(models.MaintenanceReport.assignee),
            selectinload(models.MaintenanceReport.tool)
        )
        .filter(models.MaintenanceReport.id == report_id)
    )
    return result.scalars().first()

async def get_all_maintenance_reports(db: AsyncSession, skip: int = 0, limit: int = 100) -> list[models.MaintenanceReport]:
    """Get all maintenance reports."""
    result = await db.execute(
        select(models.MaintenanceReport)
        .options(selectinload(models.MaintenanceReport.reporter), selectinload(models.MaintenanceReport.tool))
        .order_by(models.MaintenanceReport.created_at.desc())
        .offset(skip).limit(limit)
    )
    return result.scalars().all()

async def assign_technician_to_report(db: AsyncSession, report_id: int, technician_id: int) -> models.MaintenanceReport | None:
    """Assign a technician to a maintenance report and update status."""
    report = await get_maintenance_report(db, report_id)
    # TODO: Check if technician_id corresponds to a user with a 'teknisi' role
    if report and report.status == models.MaintenanceStatus.OPEN:
        report.assigned_to_id = technician_id
        report.status = models.MaintenanceStatus.IN_PROGRESS
        await db.commit()
        await db.refresh(report)
    return report

# ==================
# Payment CRUD
# ==================

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

# ==================
# Work Log CRUD
# ==================

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

# ==================
# Message CRUD
# ==================

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

# ==================
# Reporting CRUD
# ==================

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
