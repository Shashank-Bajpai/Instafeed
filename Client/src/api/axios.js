import axios from "axios";

// Automatically uses VITE_API_URL in production (Vercel)
// and falls back to localhost during local development
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://instafeed-ahel.onrender.com",
});

// Automatically attaches JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;