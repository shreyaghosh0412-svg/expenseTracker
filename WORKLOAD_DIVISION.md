# Workload Division – Spendly Expense Tracker

## Group Members

| Member | Role | Responsibilities |
|--------|------|------------------|
| **Member 1** | Backend Specialist | FastAPI backend, database, JWT auth, auth frontend, user profile |
| **Member 2** | Frontend Specialist | Dashboard, admin panel, expense management, live search, UI/UX |

---

## Member 1 – Backend + Authentication + User Profile

### Backend (all Python files in `backend/`)

| File | Purpose |
|------|---------|
| `main.py` | FastAPI app entry point, CORS middleware, lifespan hooks, route registration |
| `seed.py` | Database seeder — creates 3 demo users, 15 expenses, activity logs |
| `config/settings.py` | Pydantic BaseSettings — loads .env (Mongo URI, JWT secret/expiry) |
| `database/connection.py` | Async MongoDB client via Motor — connect, disconnect, get_db helpers |
| `auth/security.py` | bcrypt password hashing/verification, JWT creation/decoding, `get_current_user` and `require_admin` FastAPI dependencies |
| `models/user.py` | Pydantic schemas: `UserCreate`, `UserOut`, `LoginRequest`, `Token`, `UpdateProfileRequest`, `ChangePasswordRequest` |
| `models/expense.py` | Pydantic schemas: `ExpenseCreate`, `ExpenseUpdate`, `ExpenseOut`, category constants |
| `models/activity.py` | Pydantic schema: `ActivityOut` |
| `services/user_service.py` | Business logic: register (validates uniqueness + hashes password), login (verifies password + issues JWT), get_all_users, delete_user, update_profile, change_password |
| `services/expense_service.py` | Business logic: full CRUD with `$regex` live search across title/category/description |
| `services/activity_service.py` | Business logic: log_activity (tracks login, CRUD actions), get_all_activities, get_user_activities |
| `routes/auth_routes.py` | `POST /auth/register`, `POST /auth/login` |
| `routes/user_routes.py` | `PUT /users/me` (edit profile), `PUT /users/me/password` (change password) |
| `routes/expense_routes.py` | `POST/GET /expenses/`, `GET/PUT/DELETE /expenses/{id}` |
| `routes/admin_routes.py` | `GET /admin/users`, `DELETE /admin/users/{id}`, `GET /admin/activities`, `GET /admin/expenses` |

### Frontend – Auth & Profile

| File | Purpose |
|------|---------|
| `src/api/client.js` | Axios instance with base URL, JWT interceptor (auto-attach token), 401 auto-logout |
| `src/api/auth.js` | `register()`, `login()`, `updateProfile()`, `changePassword()` API calls |
| `src/context/AuthContext.jsx` | React Context providing `user`, `login`, `register`, `logout` with localStorage persistence |
| `src/pages/LoginPage.jsx` | Login form with email/password, error handling, redirect on success |
| `src/pages/RegisterPage.jsx` | Registration form with username/email/password, client-side validation |
| `src/pages/ProfilePage.jsx` | Three-tab user profile: Account Info, Change Password, Activity Log |
| `src/pages/AuthPage.css` | Shared styling for login and register pages |
| `src/pages/ProfilePage.css` | Profile page styling — hero avatar, tab bar, form cards, activity list |

---

## Member 2 – Frontend Core + Dashboard + Admin

### Frontend Core

| File | Purpose |
|------|---------|
| `index.html` | Single HTML entry point with `<div id="root">` |
| `vite.config.js` | Vite build config with API proxy |
| `src/main.jsx` | React 19 entry — `createRoot`, wraps app in StrictMode + AuthProvider |
| `src/App.jsx` | React Router v7 config — routes for /login, /register, /dashboard, /profile, /admin, catch-all redirect |
| `src/index.css` | Complete design system — CSS custom properties (dark theme, purple accent), utility classes (.card, .btn, .input, .badge, .toast, .spinner, .fade-up), scrollbar styling |
| `src/App.css` | Minimal app-level reset |

### Frontend – Dashboard & Expenses

| File | Purpose |
|------|---------|
| `src/pages/DashboardPage.jsx` | Full expense dashboard — summary stat cards (total spent, transactions, avg/item, top category), pie chart (Recharts by category), bar chart (monthly), live search with debounce, expense list with edit/delete, create/edit modal, delete confirmation |
| `src/pages/DashboardPage.css` | Dashboard layout, 4-col stat grid, charts grid, expense list rows, responsive breakpoints |
| `src/components/ExpenseModal.jsx` | Shared modal for create/edit expense — title, amount, date, category dropdown, description, validation, loading state |
| `src/components/ExpenseModal.css` | Fixed overlay modal with backdrop blur |
| `src/api/expenses.js` | `getExpenses(search)`, `createExpense()`, `updateExpense()`, `deleteExpense()` API calls |

### Frontend – Admin Panel

| File | Purpose |
|------|---------|
| `src/pages/AdminPage.jsx` | Three-tab admin panel — Users (live client-side search, delete non-admin), Activity Log (search by username/action/detail), All Expenses (read-only table), `useMemo` for filtered search |
| `src/pages/AdminPage.css` | Admin tabs, search rows, data tables with per-tab grid, confirm modal styles |
| `src/api/admin.js` | `getAllUsers()`, `deleteUser()`, `getAllActivities()`, `getUserActivities()`, `getAllExpenses()` API calls |

### Frontend – Shared Components & Hooks

| File | Purpose |
|------|---------|
| `src/components/Navbar.jsx` | Sticky top nav — brand "Spendly", navigation links, admin link (amber, admin-only), username display, logout button |
| `src/components/Navbar.css` | Navbar styling with backdrop-blur, brand dot, admin link accent |
| `src/hooks/useDebounce.js` | Custom hook — 350ms debounce for live search input |

---

## Workload Summary

| Criteria | Member 1 | Member 2 |
|----------|----------|----------|
| Primary Focus | Backend API + Auth + User Profile | Frontend UI + Dashboard + Admin |
| Backend Files | 21 files (~627 lines) | 0 files |
| Frontend Files | 8 files (~499 lines) | 17 files (~1,343 lines) |
| Total Files | 29 files (~1,126 lines) | 17 files (~1,343 lines) |
| Key Features | JWT auth, bcrypt hashing, CRUD API, activity logging, role-based access, user profile, password change | Dashboard with charts, live search, expense CRUD, admin panel, responsive design system, dark theme UI |

---

## Rationale

- **Member 1** owns the complete data layer: database connection, all API endpoints, authentication/authorization logic, and the frontend pages that consume auth + profile APIs. This is a cohesive unit — everything touching user identity and data security.
- **Member 2** owns the complete presentation layer: the design system, all UI components, the dashboard with data visualization, and the admin panel. This is a cohesive unit — everything the user sees and interacts with beyond login.
- Both members have end-to-end feature ownership they can independently demo. Member 1 demos login → register → profile → password change. Member 2 demos dashboard → expense CRUD → live search → admin panel.
- The line counts are reasonably balanced (~1,126 vs ~1,343) — Member 2 has more CSS lines but they are stylings, while Member 1 has more dense business logic with security implications.
