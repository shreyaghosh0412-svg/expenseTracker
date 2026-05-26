from fastapi import APIRouter, Depends, Query
from models.expense import ExpenseCreate, ExpenseUpdate, ExpenseOut
from models.user import TokenData
from auth.security import get_current_user
from services.expense_service import (
    create_expense,
    get_expenses,
    get_expense_by_id,
    update_expense,
    delete_expense,
)
from services.user_service import get_user_by_id

router = APIRouter(prefix="/expenses", tags=["Expenses"])


@router.post("/", response_model=ExpenseOut, status_code=201)
async def add_expense(data: ExpenseCreate, current_user: TokenData = Depends(get_current_user)):
    user = await get_user_by_id(current_user.user_id)
    return await create_expense(current_user.user_id, user.username, data)


@router.get("/", response_model=list[ExpenseOut])
async def list_expenses(
    search: str = Query(default="", description="Filter by title, category, or description"),
    current_user: TokenData = Depends(get_current_user),
):
    """
    Returns the current user's expenses.
    The optional `search` query param enables live filtering on the frontend.
    """
    return await get_expenses(current_user.user_id, search)


@router.get("/{expense_id}", response_model=ExpenseOut)
async def get_expense(expense_id: str, current_user: TokenData = Depends(get_current_user)):
    return await get_expense_by_id(expense_id, current_user.user_id)


@router.put("/{expense_id}", response_model=ExpenseOut)
async def edit_expense(
    expense_id: str,
    data: ExpenseUpdate,
    current_user: TokenData = Depends(get_current_user),
):
    user = await get_user_by_id(current_user.user_id)
    return await update_expense(expense_id, current_user.user_id, user.username, data)


@router.delete("/{expense_id}", status_code=204)
async def remove_expense(expense_id: str, current_user: TokenData = Depends(get_current_user)):
    user = await get_user_by_id(current_user.user_id)
    await delete_expense(expense_id, current_user.user_id, user.username)
