import { useState, useEffect } from "react";
import { X } from "lucide-react";
import "./ExpenseModal.css";

const CATEGORIES = [
  "Food & Drink",
  "Transport",
  "Shopping",
  "Entertainment",
  "Health",
  "Housing",
  "Education",
  "Other",
];

// This single component handles both creating a new expense and editing an existing one.
// When `expense` prop is provided, we're in edit mode.
export default function ExpenseModal({ expense, onClose, onSave }) {
  const isEditing = !!expense;

  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "Food & Drink",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Populate the form when editing an existing expense
  useEffect(() => {
    if (expense) {
      setForm({
        title: expense.title,
        amount: expense.amount,
        category: expense.category,
        description: expense.description || "",
        date: expense.date.split("T")[0],
      });
    }
  }, [expense]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.title.trim()) return setError("Title is required.");
    if (!form.amount || Number(form.amount) <= 0) return setError("Enter a valid amount.");

    setLoading(true);
    try {
      await onSave({
        ...form,
        amount: parseFloat(form.amount),
        date: new Date(form.date).toISOString(),
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      {/* Stop clicks inside the modal from closing it */}
      <div className="modal-box fade-up" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? "Edit Expense" : "New Expense"}</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {error && <div className="toast toast-error">{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="input-group">
            <label className="input-label">Title</label>
            <input
              name="title"
              className="input"
              placeholder="e.g. Lunch at work"
              value={form.title}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <div className="input-group">
              <label className="input-label">Amount ($)</label>
              <input
                name="amount"
                type="number"
                min="0.01"
                step="0.01"
                className="input"
                placeholder="0.00"
                value={form.amount}
                onChange={handleChange}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Date</label>
              <input
                name="date"
                type="date"
                className="input"
                value={form.date}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Category</label>
            <select name="category" className="input" value={form.category} onChange={handleChange}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Description (optional)</label>
            <textarea
              name="description"
              className="input"
              rows={3}
              placeholder="Any extra notes..."
              value={form.description}
              onChange={handleChange}
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : isEditing ? "Save Changes" : "Add Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
