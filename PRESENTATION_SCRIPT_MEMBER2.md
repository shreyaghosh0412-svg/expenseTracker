# Presentation Script – Member 2 (Frontend + Dashboard + Admin Panel)

> **Time: ~1 minute 15 seconds** | **Focus: Dashboard, expense CRUD, live search, admin panel, UI/UX**

---

## 1. Introduction (10 seconds)

> "Hi, I'll show you the core Spendly experience — the expense dashboard with real-time analytics, live search, and the admin panel for user management."

---

## 2. Dashboard Overview (15 seconds)

> **Action:** Logged in as admin@spendly.com → On Dashboard page

> "The dashboard shows a summary of all your expenses at a glance. Four stat cards show total spending, number of transactions, average per expense, and your most-used category. Below that, a pie chart powered by Recharts breaks down spending by category, and a bar chart shows your monthly spending trend."

> **Action:** Point to each stat card → Point to pie chart → Point to bar chart

> "All charts update in real-time as expenses are added or modified — there's no page reload. This is a single-page application with React Router handling navigation."

---

## 3. Creating an Expense (15 seconds)

> **Action:** Click "Add Expense" button → Modal opens

> "Clicking Add Expense opens a modal overlay. I can enter a title, amount, date, pick a category from the dropdown, and add an optional description."

> **Action:** Fill in: Title: "Uber to City", Amount: 32.50, Category: "Transportation" → Click Save

> "The expense is saved via a POST request to our FastAPI backend, and it instantly appears in the list below. The stats and charts also update immediately because the dashboard re-fetches data after any mutation."

> **Action:** Show the new expense in the list → Point to updated stat numbers

---

## 4. Live Search (15 seconds)

> **Action:** Click the search bar → Slowly type "coffee"

> "The search bar uses a custom debounce hook — it waits 350 milliseconds after I stop typing before sending the request. This avoids hammering the API on every keystroke."

> **Action:** Show results filtering in real-time

> "The backend performs a MongoDB `$regex` search across the title, category, and description fields — so I can search by any of these. Notice the stats and charts also update to reflect only the filtered results."

> **Action:** Clear the search bar → Show all expenses return

---

## 5. Editing and Deleting Expenses (10 seconds)

> **Action:** Click edit icon on an expense → Change amount → Save

> "I can edit any expense by clicking the edit button — the same modal opens pre-filled with the current data. Changes are sent via a PUT request."

> **Action:** Click delete icon → Confirm in the deletion modal

> "Deleting triggers a confirmation dialog to prevent accidental removal. The expense is soft-deleted from the UI and removed from the database."

---

## 6. Admin Panel (10 seconds)

> **Action:** Click Admin tab (amber-colored, admin-only)

> "The admin panel has three tabs. The Users tab shows all registered accounts — I can search by username, email, or role. Non-admin users can be deleted, but I can't delete myself or other admins."

> **Action:** Search "alice" in users → Show result → Switch to Activity Log tab

> "The Activity Log shows every action tracked across the system — when users logged in, created expenses, or updated their profile. I can search by username, action type, or detail. The All Expenses tab gives a read-only view of every expense in the system."

> **Action:** Switch to All Expenses tab → Show the table

---

## 7. UI/UX and Design System (5 seconds)

> "Spendly uses a custom dark theme built with CSS custom properties. Everything — cards, buttons, inputs, modals, badges — follows a consistent design language defined in a single `index.css` file. The interface is fully responsive and works on mobile screens as well."

---

## Key Talking Points for Q&A

| Question | Answer |
|----------|--------|
| Why Recharts? | Recharts is a React-native charting library built on D3. It's declarative — you compose charts from React components like `<PieChart>`, `<BarChart>`, `<Tooltip>` — which fits naturally with React's component model. |
| Why a custom debounce hook instead of lodash? | It's only 17 lines of code using `useEffect` + `setTimeout` + `clearTimeout`. No dependency needed, and it's customized to our 350ms delay. |
| How does the search filter the charts too? | The stats and charts are computed from the same filtered data array. When the search parameter changes, the API returns only matching expenses, and all UI elements re-render from that single source of truth. |
| How does the modal work for both create and edit? | The ExpenseModal component accepts an optional `expense` prop. If provided, it pre-fills the form and calls the update API. If null, it starts empty and calls the create API. This avoids duplicating the form code. |
| Why CSS custom properties instead of a UI framework? | Gives us complete control over the design without fighting a framework's defaults. The dark theme variables in `index.css` make it trivial to change the entire color scheme from one place. |
| How does the delete confirmation work? | Before deleting, a confirmation modal opens. The actual expense is only deleted after the user clicks "Delete" in that modal. The delete API returns a 204, and we filter the expense out of local state. |
