import axios from "axios";

// The base URL points to our FastAPI backend.
// In production, change this to your deployed API domain.
const api = axios.create({
  baseURL: "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
});

// Before every request, attach the JWT from localStorage if one exists.
// This way individual callers never have to manually add the Authorization header.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the API returns 401, the token has expired or is invalid.
// We clear storage and redirect the user to the login page automatically.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
