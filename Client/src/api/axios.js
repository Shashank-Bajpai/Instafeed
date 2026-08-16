import axios from "axios";

// This is a pre-configured "waiter" — every API call goes through here
// so we don't repeat http://localhost:5000 everywhere in the app.
const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Before EVERY request, automatically attach the wristband (JWT token)
// if we have one saved — so protected routes work without extra code.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;