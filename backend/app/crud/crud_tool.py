from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from .. import models, schemas

async def get_tool(db: AsyncSession, tool_id: int) -> models.Tool | None:
    """Get a single tool by its ID."""
    result = await db.execute(select(models.Tool).filter(models.Tool.id == tool_id))
    return result.scalars().first()

async def get_tools(db: AsyncSession, skip: int = 0, limit: int = 100) -> list[models.Tool]:
    """Get a list of all tools with pagination."""
    result = await db.execute(select(models.Tool).offset(skip).limit(limit))
    return result.scalars().all()

async def create_tool(db: AsyncSession, tool: schemas.ToolCreate) -> models.Tool:
    """Create a new tool."""
    db_tool = models.Tool(**tool.model_dump())
    db.add(db_tool)
    await db.commit()
    await db.refresh(db_tool)
    return db_tool

async def update_tool(db: AsyncSession, tool_id: int, tool_update: schemas.ToolUpdate) -> models.Tool | None:
    """Update an existing tool."""
    db_tool = await get_tool(db, tool_id)
    if db_tool:
        update_data = tool_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_tool, key, value)
        await db.commit()
        await db.refresh(db_tool)
    return db_tool

async def delete_tool(db: AsyncSession, tool_id: int) -> bool:
    """Delete a tool."""
    db_tool = await get_tool(db, tool_id)
    if db_tool:
        await db.delete(db_tool)
        await db.commit()
        return True
    return False
