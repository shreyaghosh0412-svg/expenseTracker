from fastapi import APIRouter, Depends
from models.user import UserOut, UpdateProfileRequest, ChangePasswordRequest
from models.user import TokenData
from auth.security import get_current_user
from services.user_service import update_profile, change_password

router = APIRouter(prefix="/users", tags=["Users"])


@router.put("/me", response_model=UserOut)
async def edit_profile(
    data: UpdateProfileRequest,
    current_user: TokenData = Depends(get_current_user),
):
    """Update the current user's username and/or email."""
    return await update_profile(current_user.user_id, data)


@router.put("/me/password", status_code=204)
async def update_password(
    data: ChangePasswordRequest,
    current_user: TokenData = Depends(get_current_user),
):
    """Change the current user's password after verifying the existing one."""
    await change_password(current_user.user_id, data.current_password, data.new_password)
