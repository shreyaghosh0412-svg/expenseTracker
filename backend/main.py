from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from database.connection import connect_db, close_db
from routes.auth_routes import router as auth_router
from routes.expense_routes import router as expense_router
from routes.admin_routes import router as admin_router
from routes.user_routes import router as user_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Runs once on startup — opens the database connection
    await connect_db()
    yield
    # Runs once on shutdown — cleanly closes the connection
    await close_db()


app = FastAPI(
    title="Expense Tracker API",
    description="A full-featured expense tracking backend with JWT auth and role-based access.",
    version="1.0.0",
    lifespan=lifespan,
)

# Allow the React dev server (port 5173) and any production origin to call the API.
# In production, narrow this list to your actual domain.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(expense_router)
app.include_router(admin_router)
app.include_router(user_router)


@app.get("/health")
async def health_check():
    """Simple endpoint to confirm the server is running."""
    return {"status": "ok"}
