import api from "./client";

export const getAllUsers = () => api.get("/admin/users");
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);
export const getAllActivities = () => api.get("/admin/activities");
export const getUserActivities = (userId) => api.get(`/admin/activities/${userId}`);
export const getAllExpenses = () => api.get("/admin/expenses");
