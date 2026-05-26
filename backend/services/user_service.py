from datetime import datetime, timezone
from bson import ObjectId
from fastapi import HTTPException, status

from database.connection import get_db
from auth.security import hash_password, verify_password, create_access_token
from models.user import UserCreate, UserOut, Token, LoginRequest
from services.activity_service import log_activity


def _format_user(doc: dict) -> UserOut:
    """Convert a raw MongoDB document into the UserOut schema."""
    return UserOut(
        id=str(doc["_id"]),
        username=doc["username"],
        email=doc["email"],
        role=doc["role"],
        created_at=doc["created_at"],
    )


async def register_user(data: UserCreate) -> Token:
    db = get_db()

    # Make sure the email isn't already taken
    existing = await db.users.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    # Also check for duplicate usernames
    existing_username = await db.users.find_one({"username": data.username})
    if existing_username:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already taken")

    now = datetime.now(timezone.utc)
    user_doc = {
        "username": data.username,
        "email": data.email,
        "password_hash": hash_password(data.password),
        # The very first registered user automatically becomes admin
        "role": "admin" if await db.users.count_documents({}) == 0 else "user",
        "created_at": now,
    }

    result = await db.users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id

    user_out = _format_user(user_doc)
    token = create_access_token({"sub": user_out.id, "role": user_out.role})

    await log_activity(user_out.id, user_out.username, "register", "Created a new account")

    return Token(access_token=token, user=user_out)


async def login_user(data: LoginRequest) -> Token:
    db = get_db()

    user_doc = await db.users.find_one({"email": data.email})
    if not user_doc or not verify_password(data.password, user_doc["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    user_out = _format_user(user_doc)
    token = create_access_token({"sub": user_out.id, "role": user_out.role})

    await log_activity(user_out.id, user_out.username, "login", "Logged in")

    return Token(access_token=token, user=user_out)


async def get_all_users() -> list[UserOut]:
    """Admin-only: fetch every registered user."""
    db = get_db()
    cursor = db.users.find({}).sort("created_at", -1)
    return [_format_user(doc) async for doc in cursor]


async def get_user_by_id(user_id: str) -> UserOut:
    db = get_db()
    doc = await db.users.find_one({"_id": ObjectId(user_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="User not found")
    return _format_user(doc)


async def delete_user(user_id: str) -> None:
    """Admin-only: remove a user and all their expenses."""
    db = get_db()
    await db.expenses.delete_many({"user_id": user_id})
    await db.users.delete_one({"_id": ObjectId(user_id)})


async def update_profile(user_id: str, data) -> UserOut:
    """Allow a user to update their own username and/or email."""
    db = get_db()

    updates = {}
    if data.username is not None:
        # Make sure the new username isn't already taken by someone else
        clash = await db.users.find_one({"username": data.username, "_id": {"$ne": ObjectId(user_id)}})
        if clash:
            raise HTTPException(status_code=409, detail="Username already taken")
        updates["username"] = data.username

    if data.email is not None:
        clash = await db.users.find_one({"email": data.email, "_id": {"$ne": ObjectId(user_id)}})
        if clash:
            raise HTTPException(status_code=409, detail="Email already in use")
        updates["email"] = data.email

    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    doc = await db.users.find_one_and_update(
        {"_id": ObjectId(user_id)},
        {"$set": updates},
        return_document=True,
    )
    return _format_user(doc)


async def change_password(user_id: str, current_password: str, new_password: str) -> None:
    """Verify the current password before allowing a change — prevents account takeover."""
    db = get_db()
    doc = await db.users.find_one({"_id": ObjectId(user_id)})
    if not doc or not verify_password(current_password, doc["password_hash"]):
        raise HTTPException(status_code=401, detail="Current password is incorrect")

    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"password_hash": hash_password(new_password)}},
    )
