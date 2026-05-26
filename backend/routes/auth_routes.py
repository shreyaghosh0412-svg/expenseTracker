from fastapi import APIRouter
from models.user import UserCreate, LoginRequest, Token
from services.user_service import register_user, login_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=Token, status_code=201)
async def register(data: UserCreate):
    """Create a new account. The first user ever registered is automatically made admin."""
    return await register_user(data)


@router.post("/login", response_model=Token)
async def login(data: LoginRequest):
    """Exchange valid credentials for a JWT access token."""
    return await login_user(data)
