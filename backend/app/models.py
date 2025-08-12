import enum
from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    Enum as SQLAlchemyEnum,
    func,
    Text,
    JSON,
    ForeignKey,
    Numeric,
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    KEPALA_BENGKEL = "kepala_bengkel"
    TEKNISI_OPERATOR = "teknisi_operator"
    PLP = "plp"
    DOSEN = "dosen"
    MAHASISWA = "mahasiswa"
    PETANI_INSTANSI = "petani_instansi"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(SQLAlchemyEnum(UserRole), nullable=False)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    approved_at = Column(DateTime, nullable=True)

    # Relationships
    transactions = relationship("Transaction", back_populates="user")
    reported_maintenance = relationship("MaintenanceReport", foreign_keys="MaintenanceReport.reported_by_id", back_populates="reporter")
    assigned_maintenance = relationship("MaintenanceReport", foreign_keys="MaintenanceReport.assigned_to_id", back_populates="assignee")
    work_logs = relationship("WorkLog", back_populates="user")
    sent_messages = relationship("Message", foreign_keys="Message.sender_id", back_populates="sender")
    received_messages = relationship("Message", foreign_keys="Message.receiver_id", back_populates="receiver")

class ToolCategory(str, enum.Enum):
    OLAH_TANAH = "olah_tanah"
    PANEN = "panen"
    POMPA = "pompa"
    TRANSPORTASI = "transportasi"
    TOOLS_BENGKEL = "tools_bengkel"
    LAINNYA = "lainnya"

class ToolStatus(str, enum.Enum):
    TERSEDIA = "tersedia"
    DIPINJAM = "dipinjam"
    DALAM_PERAWATAN = "dalam_perawatan"
    RUSAK = "rusak"

class Tool(Base):
    __tablename__ = "tools"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    category = Column(SQLAlchemyEnum(ToolCategory), nullable=False)
    status = Column(SQLAlchemyEnum(ToolStatus), nullable=False, default=ToolStatus.TERSEDIA)
    image_url = Column(String, nullable=True)
    specifications = Column(JSON, nullable=True)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    price = Column(Numeric(10, 2), nullable=True) # Price per day

    # Relationships
    transactions = relationship("Transaction", back_populates="tool")
    maintenance_reports = relationship("MaintenanceReport", back_populates="tool")

class TransactionType(str, enum.Enum):
    LENDING = "lending"
    RENTAL = "rental"

class TransactionStatus(str, enum.Enum):
    PENDING_APPROVAL = "pending_approval"
    APPROVED = "approved"
    REJECTED = "rejected"
    RETURNED = "returned"
    OVERDUE = "overdue"

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    tool_id = Column(Integer, ForeignKey("tools.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    transaction_type = Column(SQLAlchemyEnum(TransactionType), nullable=False)
    status = Column(SQLAlchemyEnum(TransactionStatus), nullable=False, default=TransactionStatus.PENDING_APPROVAL)

    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)

    return_date = Column(DateTime, nullable=True)
    return_notes = Column(Text, nullable=True)
    return_photo_url = Column(String, nullable=True)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    # Relationships
    tool = relationship("Tool", back_populates="transactions")
    user = relationship("User", back_populates="transactions")
    payment = relationship("Payment", back_populates="transaction", uselist=False, cascade="all, delete-orphan")

class MaintenanceStatus(str, enum.Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"

class MaintenanceReport(Base):
    __tablename__ = "maintenance_reports"

    id = Column(Integer, primary_key=True, index=True)
    tool_id = Column(Integer, ForeignKey("tools.id"), nullable=False)
    reported_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_to_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    description = Column(Text, nullable=False)
    status = Column(SQLAlchemyEnum(MaintenanceStatus), nullable=False, default=MaintenanceStatus.OPEN)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    resolved_at = Column(DateTime, nullable=True)

    # Relationships
    tool = relationship("Tool", back_populates="maintenance_reports")
    reporter = relationship("User", foreign_keys=[reported_by_id], back_populates="reported_maintenance")
    assignee = relationship("User", foreign_keys=[assigned_to_id], back_populates="assigned_maintenance")


class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"
    REFUNDED = "refunded"

class PaymentMethod(str, enum.Enum):
    TRANSFER = "transfer"
    E_WALLET = "e_wallet"
    CASH = "cash"

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(Integer, ForeignKey("transactions.id"), nullable=False, unique=True)
    amount = Column(Numeric(12, 2), nullable=False)

    payment_method = Column(SQLAlchemyEnum(PaymentMethod), nullable=True)
    status = Column(SQLAlchemyEnum(PaymentStatus), nullable=False, default=PaymentStatus.PENDING)

    payment_proof_url = Column(String, nullable=True)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    transaction = relationship("Transaction", back_populates="payment")


class WorkLog(Base):
    __tablename__ = "work_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    log_date = Column(DateTime, default=func.now())
    notes = Column(Text, nullable=False)
    target_description = Column(String, nullable=True)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    user = relationship("User", back_populates="work_logs")


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    content = Column(Text, nullable=False)
    attachment_url = Column(String, nullable=True)

    created_at = Column(DateTime, server_default=func.now())

    sender = relationship("User", foreign_keys=[sender_id], back_populates="sent_messages")
    receiver = relationship("User", foreign_keys=[receiver_id], back_populates="received_messages")
