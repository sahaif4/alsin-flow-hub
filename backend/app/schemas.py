from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from .models import (
    UserRole,
    ToolCategory,
    ToolStatus,
    TransactionType,
    TransactionStatus,
    MaintenanceStatus,
    PaymentMethod,
    PaymentStatus,
)

# ==================
# Base Schemas
# ==================

class ToolBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: ToolCategory
    status: ToolStatus = ToolStatus.TERSEDIA
    specifications: Optional[dict] = None
    image_url: Optional[str] = None
    price: Optional[float] = None

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole

class TransactionBase(BaseModel):
    tool_id: int
    start_date: datetime
    end_date: datetime

class MaintenanceReportBase(BaseModel):
    tool_id: int
    description: str

class PaymentBase(BaseModel):
    amount: float
    payment_method: PaymentMethod

class WorkLogBase(BaseModel):
    notes: str
    target_description: Optional[str] = None
    log_date: Optional[datetime] = None

class NotificationBase(BaseModel):
    message: str
    link_url: Optional[str] = None

# ==================
# Create/Update Schemas
# ==================

class ToolCreate(ToolBase):
    pass

class ToolUpdate(ToolBase):
    pass

class UserCreate(UserBase):
    password: str

class TransactionCreate(TransactionBase):
    transaction_type: TransactionType

class TransactionUpdate(BaseModel):
    status: Optional[TransactionStatus] = None
    return_notes: Optional[str] = None
    return_photo_url: Optional[str] = None

class MaintenanceReportCreate(MaintenanceReportBase):
    pass

class MaintenanceReportUpdate(BaseModel):
    assigned_to_id: Optional[int] = None
    status: Optional[MaintenanceStatus] = None

class PaymentCreate(PaymentBase):
    transaction_id: int
    payment_proof_url: Optional[str] = None

class WorkLogCreate(WorkLogBase):
    pass

class NotificationCreate(NotificationBase):
    user_id: int

# ==================
# Full Model Schemas (for API responses)
# ==================

class Tool(ToolBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    class Config:
        from_attributes = True

class User(UserBase):
    id: int
    created_at: datetime
    approved_at: Optional[datetime] = None
    class Config:
        from_attributes = True

class Payment(PaymentBase):
    id: int
    status: PaymentStatus
    created_at: datetime
    class Config:
        from_attributes = True

class Transaction(TransactionBase):
    id: int
    user_id: int
    status: TransactionStatus
    transaction_type: TransactionType
    created_at: datetime
    user: User
    tool: Tool
    payment: Optional[Payment] = None
    class Config:
        from_attributes = True

class MaintenanceReport(MaintenanceReportBase):
    id: int
    reported_by_id: int
    assigned_to_id: Optional[int] = None
    status: MaintenanceStatus
    created_at: datetime
    resolved_at: Optional[datetime] = None
    reporter: User
    assignee: Optional[User] = None
    tool: Tool
    class Config:
        from_attributes = True

class WorkLog(WorkLogBase):
    id: int
    user_id: int
    created_at: datetime
    user: User
    class Config:
        from_attributes = True

class Message(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    content: str
    attachment_url: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True

class Notification(NotificationBase):
    id: int
    user_id: int
    is_read: bool
    created_at: datetime
    class Config:
        from_attributes = True

# ==================
# Schemas for Token
# ==================
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None
