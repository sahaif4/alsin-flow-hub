from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from .. import crud, models, schemas
from ..db import get_db
from ..dependencies import get_current_user

router = APIRouter(
    prefix="/rentals",
    tags=["Rentals and Payments"],
    responses={404: {"description": "Not found"}},
)

@router.post("/request", response_model=schemas.Transaction)
async def request_to_rent_tool(
    transaction: schemas.TransactionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Create a request for the current user to RENT a tool.
    This will create a transaction and a corresponding pending payment record.
    """
    if transaction.transaction_type != models.TransactionType.RENTAL:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid transaction type for rental request. Please use 'RENTAL'.",
        )

    try:
        new_transaction = await crud.create_transaction(
            db=db, transaction=transaction, user_id=current_user.id
        )
        return new_transaction
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/{transaction_id}/pay", response_model=schemas.Payment)
async def pay_for_rental(
    transaction_id: int,
    payment_method: schemas.PaymentMethod = Form(...),
    payment_proof: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Submit payment for a rental.

    This endpoint accepts form data, including a file upload for payment proof.
    """
    transaction = await crud.get_transaction(db, transaction_id)
    if not transaction or transaction.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to pay for this rental transaction.",
        )

    # In a real-world application, you would save the file to a cloud storage
    # service (like AWS S3, Google Cloud Storage) and get a URL.
    # For this simulation, we'll just use the filename as a placeholder.
    # A real implementation would also include more robust error handling for file uploads.
    proof_url = f"uploads/payment_proofs/{transaction_id}_{payment_proof.filename}"

    try:
        payment = await crud.record_payment(
            db,
            transaction_id=transaction_id,
            payment_method=payment_method,
            proof_url=proof_url,
        )
        return payment
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
