from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from datetime import datetime

from .. import crud, models, schemas
from ..db import get_db
from ..dependencies import get_current_admin_user

router = APIRouter(
    prefix="/reports",
    tags=["Reports"],
    dependencies=[Depends(get_current_admin_user)],
    responses={403: {"description": "Operation not permitted"}},
)

@router.get("/usage/monthly", response_model=List[schemas.ToolUsageStat])
async def get_monthly_tool_usage_report(
    year: int = Query(..., description="Year of the report", example=datetime.now().year),
    month: int = Query(..., ge=1, le=12, description="Month of the report", example=datetime.now().month),
    db: AsyncSession = Depends(get_db),
):
    """
    Get a monthly report on tool usage statistics.

    This endpoint provides a count of how many times each tool was involved in an
    approved transaction for the given month and year.
    (Admin only)
    """
    stats = await crud.get_tool_usage_stats(db, year=year, month=month)
    return [schemas.ToolUsageStat(tool_name=name, transaction_count=count) for name, count in stats]

@router.get("/financial/monthly", response_model=schemas.FinancialReport)
async def get_monthly_financial_report(
    year: int = Query(..., description="Year of the report", example=datetime.now().year),
    month: int = Query(..., ge=1, le=12, description="Month of the report", example=datetime.now().month),
    db: AsyncSession = Depends(get_db),
):
    """
    Get a monthly financial report on rental income.

    This endpoint provides the total income from paid rental transactions
    for the given month and year.
    (Admin only)
    """
    total_income = await crud.get_rental_income_stats(db, year=year, month=month)
    return schemas.FinancialReport(total_income=total_income, year=year, month=month)
