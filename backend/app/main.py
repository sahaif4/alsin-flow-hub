from fastapi import FastAPI
from .db import engine
from .models import Base
from .routers import users, tools, transactions, maintenance, work_logs, rentals, chat, reports # Import the routers

# Create a FastAPI app instance
app = FastAPI(
    title="ALSIN Workshop API",
    description="API for managing agricultural tool lending and workshop operations.",
    version="0.1.0",
)

# Include the routers from the routers package
app.include_router(users.router)
app.include_router(tools.router)
app.include_router(transactions.router)
app.include_router(maintenance.router)
app.include_router(work_logs.router)
app.include_router(rentals.router)
app.include_router(chat.router)
app.include_router(reports.router)


@app.on_event("startup")
async def startup_event():
    """
    This event is triggered when the application starts.
    It connects to the database and creates all tables defined in models.py
    if they don't already exist.
    """
    async with engine.begin() as conn:
        # The run_sync method is used to run synchronous SQLAlchemy methods
        # within an async context. Base.metadata.create_all is synchronous.
        await conn.run_sync(Base.metadata.create_all)

@app.get("/health", tags=["Status"])
async def health_check():
    """
    A simple endpoint to verify that the API server is running.
    """
    return {"status": "ok", "message": "API is running"}
