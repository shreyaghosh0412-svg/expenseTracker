import { useState, useEffect, useMemo } from "react";
import { Users, Activity, Trash2, DollarSign, Search } from "lucide-react";
import { getAllUsers, deleteUser, getAllActivities, getAllExpenses } from "../api/admin";
import "./AdminPage.css";

const TABS = [
  { id: "users",      label: "Users",       icon: Users },
  { id: "activities", label: "Activity Log", icon: Activity },
  { id: "expenses",   label: "All Expenses", icon: DollarSign },
];

const fmt = (n) => `$${Number(n).toFixed(2)}`;

export default function AdminPage() {
  const [activeTab, setActiveTab]     = useState("users");
  const [users, setUsers]             = useState([]);
  const [activities, setActivities]   = useState([]);
  const [expenses, setExpenses]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Search state — one for users, one for activities
  const [userSearch, setUserSearch]       = useState("");
  const [activitySearch, setActivitySearch] = useState("");

  // Fetch all three datasets in parallel when the page loads
  useEffect(() => {
    Promise.all([getAllUsers(), getAllActivities(), getAllExpenses()])
      .then(([u, a, e]) => {
        setUsers(u.data);
        setActivities(a.data);
        setExpenses(e.data);
      })
      .finally(() => setLoading(false));
  }, []);

  // Client-side filtering — no extra API call needed since the full list is already loaded
  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    );
  }, [users, userSearch]);

  const filteredActivities = useMemo(() => {
    const q = activitySearch.trim().toLowerCase();
    if (!q) return activities;
    return activities.filter(
      (a) =>
        a.username.toLowerCase().includes(q) ||
        a.action.toLowerCase().includes(q) ||
        a.detail.toLowerCase().includes(q)
    );
  }, [activities, activitySearch]);

  const handleDeleteUser = async (userId) => {
    await deleteUser(userId);
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    setDeleteConfirm(null);
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <span className="spinner" />
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-header">
          <h1>Admin Panel</h1>
          <p className="header-sub">{users.length} users · {expenses.length} expenses</p>
        </div>

        {/* Tab navigation */}
        <div className="tab-bar">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`tab-btn ${activeTab === id ? "active" : ""}`}
              onClick={() => setActiveTab(id)}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* ── Users tab ── */}
        {activeTab === "users" && (
          <>
            {/* Search bar for users */}
            <div className="admin-search-row">
              <div className="search-wrap">
                <Search size={15} className="search-icon" />
                <input
                  className="input search-input"
                  placeholder="Search by username, email, or role..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>
              <span className="result-count">{filteredUsers.length} result{filteredUsers.length !== 1 ? "s" : ""}</span>
            </div>

            <div className="data-table fade-up">
              <div className="table-header users-grid">
                <span>Username</span>
                <span>Email</span>
                <span>Role</span>
                <span>Joined</span>
                <span>Actions</span>
              </div>
              {filteredUsers.length === 0 ? (
                <div className="table-empty">No users match that search.</div>
              ) : (
                filteredUsers.map((u) => (
                  <div key={u.id} className="table-row users-grid">
                    <span className="fw-medium">@{u.username}</span>
                    <span className="text-muted">{u.email}</span>
                    <span>
                      <span className={`badge ${u.role === "admin" ? "badge-admin" : "badge-user"}`}>
                        {u.role}
                      </span>
                    </span>
                    <span className="text-muted">{new Date(u.created_at).toLocaleDateString()}</span>
                    <span>
                      {u.role !== "admin" && (
                        <button
                          className="icon-btn icon-btn-danger"
                          onClick={() => setDeleteConfirm(u)}
                          title="Delete user"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </span>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* ── Activity Log tab ── */}
        {activeTab === "activities" && (
          <>
            <div className="admin-search-row">
              <div className="search-wrap">
                <Search size={15} className="search-icon" />
                <input
                  className="input search-input"
                  placeholder="Search by username, action, or detail..."
                  value={activitySearch}
                  onChange={(e) => setActivitySearch(e.target.value)}
                />
              </div>
              <span className="result-count">{filteredActivities.length} result{filteredActivities.length !== 1 ? "s" : ""}</span>
            </div>

            <div className="data-table fade-up">
              <div className="table-header activities-grid">
                <span>User</span>
                <span>Action</span>
                <span>Detail</span>
                <span>Time</span>
              </div>
              {filteredActivities.length === 0 ? (
                <div className="table-empty">No activity matches that search.</div>
              ) : (
                filteredActivities.map((a) => (
                  <div key={a.id} className="table-row activities-grid">
                    <span className="fw-medium">@{a.username}</span>
                    <span className="text-muted">{a.action}</span>
                    <span className="text-muted">{a.detail}</span>
                    <span className="text-muted">{new Date(a.created_at).toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* ── All Expenses tab ── */}
        {activeTab === "expenses" && (
          <div className="data-table fade-up">
            <div className="table-header expenses-grid">
              <span>Title</span>
              <span>Category</span>
              <span>Amount</span>
              <span>User ID</span>
              <span>Date</span>
            </div>
            {expenses.map((e) => (
              <div key={e.id} className="table-row expenses-grid">
                <span className="fw-medium">{e.title}</span>
                <span className="text-muted">{e.category}</span>
                <span className="amount-col">{fmt(e.amount)}</span>
                <span className="text-muted mono">{e.user_id.slice(0, 10)}…</span>
                <span className="text-muted">{new Date(e.date).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete user confirmation modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-box confirm-box fade-up" onClick={(e) => e.stopPropagation()}>
            <h3>Delete @{deleteConfirm.username}?</h3>
            <p>This permanently removes their account and all associated expenses.</p>
            <div className="confirm-actions">
              <button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDeleteUser(deleteConfirm.id)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
