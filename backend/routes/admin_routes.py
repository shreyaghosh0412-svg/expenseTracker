from fastapi import APIRouter, Depends
from models.user import UserOut, TokenData
from models.activity import ActivityOut
from models.expense import ExpenseOut
from auth.security import require_admin
from services.user_service import get_all_users, delete_user
from services.activity_service import get_all_activities, get_user_activities
from services.expense_service import get_all_expenses_admin

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/users", response_model=list[UserOut])
async def list_all_users(admin: TokenData = Depends(require_admin)):
    """Return every registered user. Admin only."""
    return await get_all_users()


@router.delete("/users/{user_id}", status_code=204)
async def remove_user(user_id: str, admin: TokenData = Depends(require_admin)):
    """Delete a user and all their data. Admin only."""
    await delete_user(user_id)


@router.get("/activities", response_model=list[ActivityOut])
async def list_activities(admin: TokenData = Depends(require_admin)):
    """Return the 200 most recent activity log entries. Admin only."""
    return await get_all_activities()


@router.get("/activities/{user_id}", response_model=list[ActivityOut])
async def list_user_activities(user_id: str, admin: TokenData = Depends(require_admin)):
    return await get_user_activities(user_id)


@router.get("/expenses", response_model=list[ExpenseOut])
async def list_all_expenses(admin: TokenData = Depends(require_admin)):
    """Return every expense in the system. Admin only."""
    return await get_all_expenses_admin()
