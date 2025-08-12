from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from jose import jwt, JWTError

from .. import crud, models, schemas, security
from ..db import get_db
from ..dependencies import get_current_user
from ..websocket import manager

router = APIRouter(
    prefix="/chat",
    tags=["Chat"],
)

# This endpoint is for fetching historical data via HTTP
@router.get("/history/{other_user_id}", response_model=List[schemas.Message])
async def get_chat_history_with_user(
    other_user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Get chat history between the current user and another user.
    """
    return await crud.get_message_history(db, user1_id=current_user.id, user2_id=other_user_id)

# This is the real-time WebSocket endpoint
@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str, # Token passed as a query parameter, e.g., ws://localhost/chat/ws?token=xxxxx
    db: AsyncSession = Depends(get_db) # This Depends() works for WebSockets
):
    # --- WebSocket Authentication ---
    credentials_exception = WebSocketDisconnect(
        code=status.WS_1008_POLICY_VIOLATION,
        reason="Could not validate credentials"
    )
    try:
        payload = jwt.decode(token, security.SECRET_KEY, algorithms=[security.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = await crud.get_user_by_email(db, email=email)
    if user is None:
        raise credentials_exception

    # --- Connection Handling ---
    await manager.connect(user.id, websocket)
    try:
        while True:
            data = await websocket.receive_json()
            try:
                message_data = schemas.MessageCreate(**data)

                # Save message to DB
                new_message = await crud.create_message(db, message=message_data, sender_id=user.id)

                # Forward message to recipient if they are online
                # We can re-serialize it from the DB object to ensure all fields are correct
                response_data = schemas.Message.from_orm(new_message).model_dump()
                await manager.send_personal_message(response_data, message_data.receiver_id)
                # Optionally, send a confirmation back to the sender
                # await websocket.send_json({"status": "Message sent", "message_id": new_message.id})

            except Exception:
                # Could be Pydantic validation error or other issues
                await websocket.send_json({"error": "Invalid data format"})

    except WebSocketDisconnect:
        manager.disconnect(user.id)
