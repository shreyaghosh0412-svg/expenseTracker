from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# Allowed spending categories — keeps the data consistent
CATEGORIES = [
    "Food & Drink",
    "Transport",
    "Shopping",
    "Entertainment",
    "Health",
    "Housing",
    "Education",
    "Other",
]


class ExpenseCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    amount: float = Field(..., gt=0)
    category: str
    description: Optional[str] = Field(default="", max_length=300)
    date: datetime


class ExpenseUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=100)
    amount: Optional[float] = Field(default=None, gt=0)
    category: Optional[str] = None
    description: Optional[str] = Field(default=None, max_length=300)
    date: Optional[datetime] = None


class ExpenseOut(BaseModel):
    id: str
    user_id: str
    title: str
    amount: float
    category: str
    description: str
    date: datetime
    created_at: datetime
