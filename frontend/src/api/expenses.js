import api from "./client";

// Fetch the current user's expenses.
// The optional `search` param lets us do live filtering via a query string.
export const getExpenses = (search = "") =>
  api.get("/expenses/", { params: { search } });

export const createExpense = (data) => api.post("/expenses/", data);

export const updateExpense = (id, data) => api.put(`/expenses/${id}`, data);

export const deleteExpense = (id) => api.delete(`/expenses/${id}`);
