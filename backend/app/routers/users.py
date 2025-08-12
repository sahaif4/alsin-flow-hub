from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta

from .. import crud, models, schemas, security
from ..db import get_db
from ..dependencies import get_current_admin_user
from typing import List

router = APIRouter(
    prefix="/users",
    tags=["Users"],
    responses={404: {"description": "Not found"}},
)

@router.post("/register", response_model=schemas.User, status_code=status.HTTP_201_CREATED)
async def register_user(user: schemas.UserCreate, db: AsyncSession = Depends(get_db)):
    """
    Register a new user.

    Based on the requirements, new users will need admin approval.
    This endpoint creates the user with `approved_at` as NULL.
    An admin will have to use a separate endpoint to approve the user.
    """
    db_user = await crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered. Cannot re-register.",
        )

    new_user = await crud.create_user(db=db, user=user)
    return new_user

@router.post("/login/token", response_model=schemas.Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)
):
    """
    Authenticate user and return a JWT access token.
    """
    user = await crud.get_user_by_email(db, email=form_data.username)
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.approved_at:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account not approved by admin yet.",
        )

    access_token_expires = timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": user.email, "role": user.role.value}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/", response_model=List[schemas.User])
async def read_users(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin_user),
):
    """
    Retrieve all users. (Admin only)
    """
    return await crud.get_users(db, skip=skip, limit=limit)

@router.post("/{user_id}/approve", response_model=schemas.User)
async def approve_new_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin_user),
):
    """
    Approve a user's registration. (Admin only)
    """
    approved_user = await crud.approve_user(db, user_id=user_id)
    if not approved_user:
        raise HTTPException(status_code=404, detail="User not found or already approved.")
    return approved_user
