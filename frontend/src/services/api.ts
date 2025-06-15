import axios from "axios";
import { message } from "antd";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || `${window.location.origin}/api/v1`;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          message.error("Authentication required. Please log in.");
          localStorage.removeItem("token");
          window.location.href = "/login";
          break;
        case 403:
          message.error(
            "Access denied. You do not have permission to perform this action."
          );
          break;
        case 404:
          message.error("Resource not found.");
          break;
        case 422:
          message.error(data.error || "Validation error occurred.");
          break;
        case 500:
          message.error("Internal server error. Please try again later.");
          break;
        default:
          message.error(data.error || "An unexpected error occurred.");
      }
    } else if (error.request) {
      message.error("Network error. Please check your connection.");
    } else {
      message.error("An unexpected error occurred.");
    }

    return Promise.reject(error);
  }
);

export default api;
