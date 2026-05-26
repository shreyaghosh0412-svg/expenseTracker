from datetime import datetime, timezone
from database.connection import get_db
from models.activity import ActivityOut


async def log_activity(user_id: str, username: str, action: str, detail: str) -> None:
    """
    Write a single activity record to the database.
    This is called internally after every significant user action.
    """
    db = get_db()
    await db.activities.insert_one({
        "user_id": user_id,
        "username": username,
        "action": action,
        "detail": detail,
        "created_at": datetime.now(timezone.utc),
    })


def _format_activity(doc: dict) -> ActivityOut:
    return ActivityOut(
        id=str(doc["_id"]),
        user_id=doc["user_id"],
        username=doc["username"],
        action=doc["action"],
        detail=doc["detail"],
        created_at=doc["created_at"],
    )


async def get_all_activities(limit: int = 200) -> list[ActivityOut]:
    """Admin-only: return the most recent activity records."""
    db = get_db()
    cursor = db.activities.find({}).sort("created_at", -1).limit(limit)
    return [_format_activity(doc) async for doc in cursor]


async def get_user_activities(user_id: str) -> list[ActivityOut]:
    """Return activity logs for a specific user."""
    db = get_db()
    cursor = db.activities.find({"user_id": user_id}).sort("created_at", -1)
    return [_format_activity(doc) async for doc in cursor]
