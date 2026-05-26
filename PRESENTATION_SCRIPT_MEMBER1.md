# Presentation Script – Member 1 (Backend + Authentication + User Profile)

> **Time: ~1 minute 15 seconds** | **Focus: Auth flows, security, profile management**

---

## 1. Introduction (10 seconds)

> "Hi, I'll walk you through the authentication system and user management of Spendly, our expense tracker built with React, FastAPI, and MongoDB."

---

## 2. Registration (20 seconds)

> **Action:** Open browser to http://localhost:5173 → click "Sign Up" tab

> "When a new user registers, we do client-side validation first — checking that passwords match and meet minimum length. On the backend, the password is hashed using bcrypt before it ever touches the database. No plain-text passwords are stored."

> **Action:** Fill in username: "DemoUser", email: "demo@test.com", password: "demo123" → Click Register

> "The user is created, a JWT token is issued, and they're automatically redirected to the dashboard."

---

## 3. Login + JWT Demonstration (15 seconds)

> **Action:** Log out → Click "Login" tab → Enter credentials → Before clicking login, open DevTools (F12 → Application → Local Storage)

> "When I log in with admin@spendly.com, the server verifies the bcrypt hash and returns a signed JWT. The token is stored in localStorage and attached to every API request via an Axios interceptor."

> **Action:** Click Login → Show the token appears in localStorage → Show Network tab with Authorization header

> "If a token expires or is invalid, the 401 interceptor automatically clears storage and redirects to login — the user never sees a broken page."

---

## 4. Role-Based Access Control (10 seconds)

> **Action:** Log in as alice@example.com / alice123

> "Our app has two roles — regular users and admins. Alice is a regular user — notice she can only access Dashboard and Profile. The Admin tab is hidden."

> **Action:** Log out → Log in as admin@spendly.com / admin123

> "But when the admin logs in, they see an additional Admin tab. On the backend, a `require_admin` dependency checks the JWT role claim. If a non-admin tries to call an admin endpoint, they get a 403 Forbidden."

---

## 5. Profile Management (15 seconds)

> **Action:** Click Profile tab

> "The profile page has three sections. Under Account Info, I can update my username and email. Under Change Password, I need to provide my current password before setting a new one — the backend verifies the old hash before updating."

> **Action:** Change username to "Admin Updated" → Save → Show success message

> "The Activity Log tab shows a timeline of all user actions — logins, expense creations, profile updates. This is powered by our activity service that logs every significant action to the database."

---

## 6. Backend Architecture Summary (5 seconds)

> "The backend is organized into clean layers — routes handle HTTP concerns, services contain business logic, and models define validation schemas. The database uses Motor for async MongoDB access, and settings are managed through Pydantic's BaseSettings from environment variables. All of this follows separation of concerns so the codebase is maintainable and testable."

---

## Key Talking Points for Q&A

| Question | Answer |
|----------|--------|
| Why JWT instead of sessions? | JWTs are stateless — no server-side session storage needed. The token carries the user ID and role, verified by signature on every request. |
| Why bcrypt? | bcrypt is a slow, salted hashing algorithm designed specifically for passwords. It's resistant to rainbow table and brute-force attacks. |
| How does the 401 interceptor work? | An Axios response interceptor checks every API response. If status is 401, it clears localStorage and redirects to /login — this handles expired tokens gracefully. |
| What is Motor? | Motor is an async MongoDB driver for Python's asyncio. It integrates natively with FastAPI's async routes, so database calls don't block the event loop. |
| How is role-based access enforced? | The JWT payload includes a `role` claim. The `require_admin` FastAPI dependency decodes the token and checks the role — if it's not 'admin', it raises a 403 error before the route handler executes. |
