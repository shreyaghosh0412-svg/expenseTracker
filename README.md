# Spendly — Expense Tracker

A full-stack expense tracking web application built with **React**, **FastAPI**, and **MongoDB**. Users can log, search, and manage their expenses, while administrators have a dedicated panel to monitor all users, activity logs, and spending data across the platform.

---

## Problem Statement

Keeping track of personal spending is difficult without a dedicated tool. Spendly gives users a clean, fast interface to record every expense, visualise spending by category and month, and search through their history in real time — all secured behind JWT-based authentication.

---

## Technical Stack

| Layer     | Technology                                      |
|-----------|-------------------------------------------------|
| Frontend  | React 18 (Vite), React Router, Recharts, Axios  |
| Backend   | FastAPI (Python 3.11+), Uvicorn                 |
| Database  | MongoDB (via Motor async driver)                |
| Auth      | JWT (python-jose), bcrypt (passlib)             |
| Styling   | Pure CSS with custom design tokens              |

---

## Features

- **User authentication** — register and login with bcrypt-hashed passwords and JWT tokens
- **Role-based access** — the first user to register becomes admin automatically
- **Full CRUD on expenses** — create, read, update, and delete expense items
- **Live search (expenses)** — filters expenses by title, category, or description with 350ms debounce
- **Live search (admin users)** — admin can search and filter all users by username, email, or role
- **Charts** — pie chart (spending by category) and bar chart (monthly totals) via Recharts
- **Activity logging** — every significant action is recorded in the database
- **Edit profile** — users can update their username and email from the Profile page
- **Change password** — users can change their password after verifying the current one
- **Admin panel** — view/search all users, delete accounts, browse every expense, filter the full activity log
- **Single-page application** — React Router handles all navigation client-side; no page reloads

---

## Folder Structure

```
expense-tracker/
├── backend/
│   ├── auth/
│   │   └── security.py          # JWT creation, bcrypt, FastAPI auth dependencies
│   ├── config/
│   │   └── settings.py          # Pydantic settings loaded from .env
│   ├── database/
│   │   └── connection.py        # Async MongoDB client (Motor)
│   ├── models/
│   │   ├── user.py              # Pydantic schemas for users and tokens
│   │   ├── expense.py           # Pydantic schemas for expenses
│   │   └── activity.py          # Pydantic schema for activity logs
│   ├── routes/
│   │   ├── auth_routes.py       # POST /auth/register, POST /auth/login
│   │   ├── user_routes.py       # PUT /users/me (edit profile, change password)
│   │   ├── expense_routes.py    # CRUD endpoints under /expenses/
│   │   └── admin_routes.py      # Admin-only endpoints under /admin/
│   ├── services/
│   │   ├── user_service.py      # Business logic for user operations
│   │   ├── expense_service.py   # Business logic for expense operations
│   │   └── activity_service.py  # Writes and reads activity logs
│   ├── main.py                  # FastAPI app entry point
│   ├── seed.py                  # Populates the DB with sample data
│   ├── requirements.txt         # Python dependencies
│   └── .env.example             # Template for environment variables
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   ├── client.js        # Axios instance with JWT interceptor
    │   │   ├── auth.js          # Auth, updateProfile, changePassword API calls
    │   │   ├── expenses.js      # Expense API calls
    │   │   └── admin.js         # Admin API calls
    │   ├── components/
    │   │   ├── Navbar.jsx       # Sticky top navigation bar
    │   │   └── ExpenseModal.jsx # Shared create/edit modal
    │   ├── context/
    │   │   └── AuthContext.jsx  # Global auth state (React Context)
    │   ├── hooks/
    │   │   └── useDebounce.js   # Delays state updates for live search
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── DashboardPage.jsx  # Expense list, live search, charts, CRUD
    │   │   ├── ProfilePage.jsx    # Edit profile, change password, activity log
    │   │   └── AdminPage.jsx      # Users (with search), activity log, all expenses
    │   ├── App.jsx              # Route definitions and protected routes
    │   ├── main.jsx             # React app entry point
    │   └── index.css            # Global design system and CSS tokens
    ├── index.html
    └── vite.config.js
```

---

## How to Run

### Prerequisites

- Python 3.11+
- Node.js 18+
- MongoDB running locally on port 27017 (or update `MONGO_URI` in `.env`)

### 1. Backend

```bash
cd backend

# Copy the environment template
cp .env.example .env

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# (Optional) seed the database with sample data
python seed.py

# Start the API server
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`.
Interactive docs: `http://localhost:8000/docs`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Demo Accounts (after running seed.py)

| Role  | Email                  | Password  |
|-------|------------------------|-----------|
| Admin | admin@spendly.com      | admin123  |
| User  | alice@example.com      | alice123  |
| User  | bob@example.com        | bob123    |

---

## Workload Allocation

This project was completed as a group of two members. See `WORKLOAD_DIVISION.md` for full details.

### Member 1 — Backend Specialist

**Backend (all Python files):**
- `backend/main.py`, `backend/seed.py`
- `backend/config/settings.py`
- `backend/database/connection.py`
- `backend/auth/security.py`
- `backend/models/user.py`, `backend/models/expense.py`, `backend/models/activity.py`
- `backend/services/user_service.py`, `backend/services/expense_service.py`, `backend/services/activity_service.py`
- `backend/routes/auth_routes.py`, `backend/routes/user_routes.py`, `backend/routes/expense_routes.py`, `backend/routes/admin_routes.py`

**Frontend — Auth & Profile:**
- `src/api/client.js`, `src/api/auth.js`
- `src/context/AuthContext.jsx`
- `src/pages/LoginPage.jsx`, `src/pages/RegisterPage.jsx`, `src/pages/ProfilePage.jsx`
- `src/pages/AuthPage.css`, `src/pages/ProfilePage.css`

### Member 2 — Frontend Specialist

**Frontend — Core, Dashboard & Admin:**
- `index.html`, `vite.config.js`
- `src/main.jsx`, `src/App.jsx`
- `src/index.css`, `src/App.css`
- `src/api/expenses.js`, `src/api/admin.js`
- `src/hooks/useDebounce.js`
- `src/components/Navbar.jsx`, `src/components/Navbar.css`
- `src/components/ExpenseModal.jsx`, `src/components/ExpenseModal.css`
- `src/pages/DashboardPage.jsx`, `src/pages/DashboardPage.css`
- `src/pages/AdminPage.jsx`, `src/pages/AdminPage.css`
