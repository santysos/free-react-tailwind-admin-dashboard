import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: { Accept: "application/json" },
});

api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token") ||
    "";

  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
