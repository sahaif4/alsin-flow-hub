from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from .. import crud, models, schemas
from ..db import get_db
from ..dependencies import get_current_admin_user

router = APIRouter(
    prefix="/tools",
    tags=["Tools"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=schemas.Tool, status_code=status.HTTP_201_CREATED)
async def create_new_tool(
    tool: schemas.ToolCreate,
    db: AsyncSession = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin_user),
):
    """
    Create a new tool or machine. (Admin only)
    """
    return await crud.create_tool(db=db, tool=tool)

@router.get("/", response_model=List[schemas.Tool])
async def read_all_tools(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    """
    Retrieve all tools with pagination.
    This is a public endpoint for users to see the catalog.
    """
    tools = await crud.get_tools(db, skip=skip, limit=limit)
    return tools

@router.get("/{tool_id}", response_model=schemas.Tool)
async def read_single_tool(tool_id: int, db: AsyncSession = Depends(get_db)):
    """
    Retrieve a single tool by its ID.
    """
    db_tool = await crud.get_tool(db, tool_id=tool_id)
    if db_tool is None:
        raise HTTPException(status_code=404, detail="Tool not found")
    return db_tool

@router.put("/{tool_id}", response_model=schemas.Tool)
async def update_existing_tool(
    tool_id: int,
    tool: schemas.ToolUpdate,
    db: AsyncSession = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin_user),
):
    """
    Update a tool's information. (Admin only)
    """
    db_tool = await crud.update_tool(db, tool_id=tool_id, tool_update=tool)
    if db_tool is None:
        raise HTTPException(status_code=404, detail="Tool not found")
    return db_tool

@router.delete("/{tool_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_existing_tool(
    tool_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin_user),
):
    """
    Delete a tool. (Admin only)
    """
    deleted = await crud.delete_tool(db, tool_id=tool_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Tool not found")
    return
