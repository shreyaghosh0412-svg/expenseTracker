from motor.motor_asyncio import AsyncIOMotorClient
from config.settings import settings

# Motor gives us an async MongoDB client so FastAPI doesn't block on DB calls
_client: AsyncIOMotorClient = None


def get_client() -> AsyncIOMotorClient:
    return _client


def get_db():
    return _client[settings.db_name]


async def connect_db():
    global _client
    _client = AsyncIOMotorClient(settings.mongo_uri)
    # Quick ping to confirm the connection is alive before accepting requests
    await _client.admin.command("ping")
    print("Connected to MongoDB successfully.")


async def close_db():
    global _client
    if _client:
        _client.close()
        print("MongoDB connection closed.")
