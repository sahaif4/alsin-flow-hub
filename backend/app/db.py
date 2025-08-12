import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("No DATABASE_URL found in environment variables. Please create a .env file.")

# The 'echo=True' parameter will log all SQL statements issued, which is useful for debugging.
engine = create_async_engine(DATABASE_URL, echo=True)

# The sessionmaker factory generates new Session objects when called.
AsyncSessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=engine, class_=AsyncSession
)

# Dependency to get a DB session.
# This will be used in FastAPI path operations.
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
