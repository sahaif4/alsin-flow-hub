from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import func

from .. import models, schemas
from . import crud_tool, crud_notification

async def create_maintenance_report(db: AsyncSession, report: schemas.MaintenanceReportCreate, reporter_id: int) -> models.MaintenanceReport:
    """
    Create a new maintenance report and update the tool's status.
    """
    tool = await crud_tool.get_tool(db, report.tool_id)
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
    if report and report.status == models.MaintenanceStatus.OPEN:
        report.assigned_to_id = technician_id
        report.status = models.MaintenanceStatus.IN_PROGRESS
        await db.commit()
        await db.refresh(report)

        await crud_notification.create_notification(
            db,
            notification=schemas.NotificationCreate(
                user_id=technician_id,
                message=f"Anda telah ditugaskan untuk laporan perbaikan pada alat '{report.tool.name}'.",
                link_url=f"/maintenance/{report.id}"
            )
        )
    return report

async def resolve_maintenance_report(db: AsyncSession, report_id: int) -> models.MaintenanceReport | None:
    """Resolve a maintenance report and update tool status."""
    report = await get_maintenance_report(db, report_id)
    if report and report.status == models.MaintenanceStatus.IN_PROGRESS:
        report.status = models.MaintenanceStatus.RESOLVED
        report.resolved_at = func.now()

        tool = await crud_tool.get_tool(db, report.tool_id)
        if tool:
            tool.status = models.ToolStatus.TERSEDIA

        await db.commit()
        await db.refresh(report)

        await crud_notification.create_notification(
            db,
            notification=schemas.NotificationCreate(
                user_id=report.reporter_id,
                message=f"Laporan perbaikan Anda untuk alat '{report.tool.name}' telah diselesaikan.",
                link_url=f"/maintenance/{report.id}"
            )
        )
    return report
