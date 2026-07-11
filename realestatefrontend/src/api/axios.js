import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || " https://realepro.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("re_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle Unauthorized Responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("re_token");
      localStorage.removeItem("re_user");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;