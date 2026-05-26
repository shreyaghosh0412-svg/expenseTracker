"""
seed.py — Populate the database with sample data for demonstration purposes.

Run this AFTER the backend is running:
    python seed.py

It creates:
  - 1 admin user  (admin@spendly.com / admin123)
  - 2 regular users
  - ~15 sample expenses spread across categories and months
"""

import asyncio
from datetime import datetime, timezone, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
import random

MONGO_URI = "mongodb://localhost:27017"
DB_NAME = "expense_tracker"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SAMPLE_EXPENSES = [
    ("Grocery run", 87.40, "Food & Drink", "Weekly supermarket"),
    ("Netflix", 15.99, "Entertainment", "Monthly subscription"),
    ("Gym membership", 49.00, "Health", "Monthly fee"),
    ("Bus pass", 60.00, "Transport", "Monthly transit card"),
    ("Dinner out", 42.50, "Food & Drink", "Restaurant with friends"),
    ("New headphones", 129.00, "Shopping", "Sony WH-1000XM5"),
    ("Electricity bill", 180.00, "Housing", "Monthly utility"),
    ("Online course", 29.99, "Education", "React advanced course"),
    ("Coffee x5", 27.50, "Food & Drink", "Morning coffees"),
    ("Uber rides", 38.00, "Transport", "Three trips"),
    ("Laptop stand", 55.00, "Shopping", "Ergonomic desk accessory"),
    ("Doctor visit", 90.00, "Health", "GP consultation"),
    ("Rent", 1400.00, "Housing", "Monthly rent"),
    ("Books", 34.95, "Education", "Two programming books"),
    ("Concert ticket", 95.00, "Entertainment", "Live music event"),
]


async def seed():
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DB_NAME]

    # Clear existing data so the seed is idempotent
    await db.users.drop()
    await db.expenses.drop()
    await db.activities.drop()

    now = datetime.now(timezone.utc)

    # Create users
    users = [
        {
            "username": "admin",
            "email": "admin@spendly.com",
            "password_hash": pwd_context.hash("admin123"),
            "role": "admin",
            "created_at": now - timedelta(days=90),
        },
        {
            "username": "alice",
            "email": "alice@example.com",
            "password_hash": pwd_context.hash("alice123"),
            "role": "user",
            "created_at": now - timedelta(days=60),
        },
        {
            "username": "bob",
            "email": "bob@example.com",
            "password_hash": pwd_context.hash("bob123"),
            "role": "user",
            "created_at": now - timedelta(days=30),
        },
    ]

    result = await db.users.insert_many(users)
    user_ids = [str(uid) for uid in result.inserted_ids]

    # Spread expenses across the last 3 months for chart variety
    for i, (title, amount, category, desc) in enumerate(SAMPLE_EXPENSES):
        user_id = user_ids[i % 3]  # Distribute across all three users
        days_ago = random.randint(1, 90)
        expense_date = now - timedelta(days=days_ago)

        await db.expenses.insert_one({
            "user_id": user_id,
            "title": title,
            "amount": amount,
            "category": category,
            "description": desc,
            "date": expense_date,
            "created_at": expense_date,
        })

    # Log a few sample activities
    for i, uid in enumerate(user_ids):
        await db.activities.insert_one({
            "user_id": uid,
            "username": users[i]["username"],
            "action": "register",
            "detail": "Created a new account",
            "created_at": users[i]["created_at"],
        })
        await db.activities.insert_one({
            "user_id": uid,
            "username": users[i]["username"],
            "action": "login",
            "detail": "Logged in",
            "created_at": now - timedelta(hours=random.randint(1, 24)),
        })

    client.close()
    print("✓ Database seeded successfully.")
    print()
    print("  Login credentials:")
    print("  Admin  → admin@spendly.com  / admin123")
    print("  Alice  → alice@example.com  / alice123")
    print("  Bob    → bob@example.com    / bob123")


asyncio.run(seed())
