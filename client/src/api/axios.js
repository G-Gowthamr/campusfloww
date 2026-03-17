import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

export default api;
