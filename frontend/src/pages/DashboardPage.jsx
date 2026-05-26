import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Pencil, Trash2, TrendingUp } from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";

import { getExpenses, createExpense, updateExpense, deleteExpense } from "../api/expenses";
import { useDebounce } from "../hooks/useDebounce";
import { useAuth } from "../context/AuthContext";
import ExpenseModal from "../components/ExpenseModal";
import "./DashboardPage.css";

// A fixed color palette for the pie chart slices
const COLORS = ["#7c6af7", "#34d399", "#f87171", "#fbbf24", "#60a5fa", "#f472b6", "#a78bfa", "#fb923c"];

// Format a number as a dollar amount
const fmt = (n) => `$${Number(n).toFixed(2)}`;

export default function DashboardPage() {
  const { user } = useAuth();

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // null = create, object = edit
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Only fire the API call after the user stops typing for 350ms
  const debouncedSearch = useDebounce(searchInput, 350);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getExpenses(debouncedSearch);
      setExpenses(data);
    } catch {
      // Axios interceptor handles 401; other errors are silently ignored here
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // Aggregate spending by category for the pie chart
  const categoryData = expenses.reduce((acc, e) => {
    const existing = acc.find((x) => x.name === e.category);
    if (existing) {
      existing.value += e.amount;
    } else {
      acc.push({ name: e.category, value: e.amount });
    }
    return acc;
  }, []);

  // Group spending by month for the bar chart
  const monthlyData = expenses.reduce((acc, e) => {
    const month = new Date(e.date).toLocaleString("default", { month: "short", year: "2-digit" });
    const existing = acc.find((x) => x.month === month);
    if (existing) {
      existing.total += e.amount;
    } else {
      acc.push({ month, total: e.amount });
    }
    return acc;
  }, []).slice(-6); // Show the last 6 months

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  const handleSave = async (formData) => {
    if (editTarget) {
      await updateExpense(editTarget.id, formData);
    } else {
      await createExpense(formData);
    }
    fetchExpenses();
  };

  const handleDelete = async (id) => {
    await deleteExpense(id);
    setDeleteConfirm(null);
    fetchExpenses();
  };

  const openEdit = (expense) => {
    setEditTarget(expense);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditTarget(null);
  };

  return (
    <div className="dashboard-page">
      <div className="container">
        {/* Page header */}
        <div className="dashboard-header">
          <div>
            <h1>Hello, {user.username}</h1>
            <p className="header-sub">Here's your spending overview</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => { setEditTarget(null); setModalOpen(true); }}
          >
            <Plus size={17} />
            Add Expense
          </button>
        </div>

        {/* Summary stat cards */}
        <div className="stat-grid">
          <div className="stat-card">
            <span className="stat-label">Total Spent</span>
            <span className="stat-value">{fmt(total)}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Transactions</span>
            <span className="stat-value">{expenses.length}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Avg per item</span>
            <span className="stat-value">{expenses.length ? fmt(total / expenses.length) : "$0.00"}</span>
          </div>
          <div className="stat-card stat-card-accent">
            <TrendingUp size={18} />
            <span className="stat-label">Top category</span>
            <span className="stat-value">
              {categoryData.sort((a, b) => b.value - a.value)[0]?.name || "—"}
            </span>
          </div>
        </div>

        {/* Charts */}
        {expenses.length > 0 && (
          <div className="charts-grid">
            <div className="card">
              <h3 className="chart-title">By Category</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => fmt(v)}
                    contentStyle={{ background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: "8px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Legend */}
              <div className="pie-legend">
                {categoryData.map((c, i) => (
                  <span key={c.name} className="legend-item">
                    <span className="legend-dot" style={{ background: COLORS[i % COLORS.length] }} />
                    {c.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="chart-title">Monthly Spending</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    formatter={(v) => fmt(v)}
                    contentStyle={{ background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: "8px" }}
                  />
                  <Bar dataKey="total" fill="var(--accent)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Search bar */}
        <div className="search-row">
          <div className="search-wrap">
            <Search size={16} className="search-icon" />
            <input
              className="input search-input"
              placeholder="Search by title, category, or description..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
        </div>

        {/* Expense list */}
        <div className="expense-list">
          {loading ? (
            <div className="list-empty"><span className="spinner" /></div>
          ) : expenses.length === 0 ? (
            <div className="list-empty">
              <p>{searchInput ? "No results found." : "No expenses yet. Add your first one!"}</p>
            </div>
          ) : (
            expenses.map((e) => (
              <div key={e.id} className="expense-row fade-up">
                <div className="expense-left">
                  <span className="expense-category-dot" />
                  <div>
                    <p className="expense-title">{e.title}</p>
                    <p className="expense-meta">
                      {e.category} · {new Date(e.date).toLocaleDateString()}
                      {e.description && ` · ${e.description}`}
                    </p>
                  </div>
                </div>
                <div className="expense-right">
                  <span className="expense-amount">{fmt(e.amount)}</span>
                  <button className="icon-btn" onClick={() => openEdit(e)} title="Edit">
                    <Pencil size={15} />
                  </button>
                  <button className="icon-btn icon-btn-danger" onClick={() => setDeleteConfirm(e.id)} title="Delete">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create / Edit modal */}
      {modalOpen && (
        <ExpenseModal expense={editTarget} onClose={closeModal} onSave={handleSave} />
      )}

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-box confirm-box fade-up" onClick={(e) => e.stopPropagation()}>
            <h3>Delete this expense?</h3>
            <p>This action cannot be undone.</p>
            <div className="confirm-actions">
              <button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
