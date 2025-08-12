from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from .. import crud, models, schemas
from ..db import get_db
from ..dependencies import get_current_user, get_current_admin_user

router = APIRouter(
    prefix="/transactions",
    tags=["Transactions"],
    responses={404: {"description": "Not found"}},
)

@router.post("/borrow", response_model=schemas.Transaction, status_code=status.HTTP_201_CREATED)
async def request_to_borrow_tool(
    transaction: schemas.TransactionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Create a request for the current user to borrow a tool.
    The transaction will be in 'pending_approval' state.
    """
    try:
        new_transaction = await crud.create_transaction(
            db=db, transaction=transaction, user_id=current_user.id
        )
        return new_transaction
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/me", response_model=List[schemas.Transaction])
async def read_my_transactions(
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Retrieve all transactions for the currently authenticated user.
    """
    return await crud.get_user_transactions(db=db, user_id=current_user.id)

@router.post("/{transaction_id}/approve", response_model=schemas.Transaction)
async def approve_borrow_request(
    transaction_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin_user),
):
    """
    Approve a borrow request. (Admin only)
    """
    db_transaction = await crud.approve_transaction(db, transaction_id=transaction_id)
    if not db_transaction:
        raise HTTPException(status_code=404, detail="Transaction not found or not in pending approval state.")
    return db_transaction

@router.post("/{transaction_id}/reject", response_model=schemas.Transaction)
async def reject_borrow_request(
    transaction_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin_user),
):
    """
    Reject a borrow request. (Admin only)
    """
    db_transaction = await crud.reject_transaction(db, transaction_id=transaction_id)
    if not db_transaction:
        raise HTTPException(status_code=404, detail="Transaction not found or not in pending approval state.")
    return db_transaction
