from pydantic import BaseModel
from datetime import datetime


class ActivityOut(BaseModel):
    id: str
    user_id: str
    username: str
    action: str        # e.g. "login", "create_expense", "delete_expense"
    detail: str        # human-readable summary of what happened
    created_at: datetime
