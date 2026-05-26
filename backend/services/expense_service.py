from datetime import datetime, timezone
from bson import ObjectId
from fastapi import HTTPException

from database.connection import get_db
from models.expense import ExpenseCreate, ExpenseUpdate, ExpenseOut
from services.activity_service import log_activity


def _format_expense(doc: dict) -> ExpenseOut:
    """Map a raw MongoDB document to the ExpenseOut schema."""
    return ExpenseOut(
        id=str(doc["_id"]),
        user_id=doc["user_id"],
        title=doc["title"],
        amount=doc["amount"],
        category=doc["category"],
        description=doc.get("description", ""),
        date=doc["date"],
        created_at=doc["created_at"],
    )


async def create_expense(user_id: str, username: str, data: ExpenseCreate) -> ExpenseOut:
    db = get_db()
    now = datetime.now(timezone.utc)

    doc = {
        "user_id": user_id,
        "title": data.title,
        "amount": data.amount,
        "category": data.category,
        "description": data.description or "",
        "date": data.date,
        "created_at": now,
    }

    result = await db.expenses.insert_one(doc)
    doc["_id"] = result.inserted_id

    await log_activity(
        user_id, username, "create_expense",
        f"Added expense '{data.title}' for ${data.amount:.2f}"
    )

    return _format_expense(doc)


async def get_expenses(user_id: str, search: str = "") -> list[ExpenseOut]:
    """
    Fetch all expenses for a user.
    When a search term is provided, MongoDB's $regex filters on title and category.
    The regex is case-insensitive so 'coffee' matches 'Coffee'.
    """
    db = get_db()
    query: dict = {"user_id": user_id}

    if search.strip():
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"category": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
        ]

    cursor = db.expenses.find(query).sort("date", -1)
    return [_format_expense(doc) async for doc in cursor]


async def get_expense_by_id(expense_id: str, user_id: str) -> ExpenseOut:
    db = get_db()
    doc = await db.expenses.find_one({"_id": ObjectId(expense_id), "user_id": user_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Expense not found")
    return _format_expense(doc)


async def update_expense(expense_id: str, user_id: str, username: str, data: ExpenseUpdate) -> ExpenseOut:
    db = get_db()

    # Only include fields that were actually provided in the request
    updates = {k: v for k, v in data.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    result = await db.expenses.find_one_and_update(
        {"_id": ObjectId(expense_id), "user_id": user_id},
        {"$set": updates},
        return_document=True,
    )

    if not result:
        raise HTTPException(status_code=404, detail="Expense not found")

    await log_activity(user_id, username, "update_expense", f"Updated expense '{result['title']}'")
    return _format_expense(result)


async def delete_expense(expense_id: str, user_id: str, username: str) -> None:
    db = get_db()
    doc = await db.expenses.find_one_and_delete({"_id": ObjectId(expense_id), "user_id": user_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Expense not found")
    await log_activity(user_id, username, "delete_expense", f"Deleted expense '{doc['title']}'")


async def get_all_expenses_admin() -> list[ExpenseOut]:
    """Admin-only: return every expense across all users."""
    db = get_db()
    cursor = db.expenses.find({}).sort("created_at", -1)
    return [_format_expense(doc) async for doc in cursor]
