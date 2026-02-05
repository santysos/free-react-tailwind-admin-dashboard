// src/services/api.ts
import axios from "axios";

const API_ROOT = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: `${API_ROOT}/api`,
  withCredentials: true,
});

// Request: token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response: 401 => signin
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      if (!window.location.pathname.startsWith("/signin")) {
        window.location.href = "/signin";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
