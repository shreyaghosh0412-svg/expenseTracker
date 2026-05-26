import api from "./client";

export const register = (data) => api.post("/auth/register", data);
export const login = (data) => api.post("/auth/login", data);

export const updateProfile = (data) => api.put("/users/me", data);
export const changePassword = (data) => api.put("/users/me/password", data);
