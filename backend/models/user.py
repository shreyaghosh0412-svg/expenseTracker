from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


# Used when a new user registers
class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=30)
    email: EmailStr
    password: str = Field(..., min_length=6)


# Returned to the client — never include the hashed password
class UserOut(BaseModel):
    id: str
    username: str
    email: str
    role: str
    created_at: datetime


# Payload stored inside the JWT token
class TokenData(BaseModel):
    user_id: Optional[str] = None
    role: Optional[str] = None


# The token response after a successful login
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UpdateProfileRequest(BaseModel):
    username: Optional[str] = Field(default=None, min_length=3, max_length=30)
    email: Optional[EmailStr] = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6)
