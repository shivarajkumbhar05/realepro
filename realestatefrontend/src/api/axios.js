// src/api/axios.js
import axios from "axios";

// ─── API URL Configuration ──────────────────────────────────────────────────
// Get API URL from environment with fallback
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Clean the URL (remove trailing slash and trim whitespace)
const cleanApiUrl = API_URL.replace(/\/$/, '').trim();

console.log('🔌 API Base URL:', cleanApiUrl);

// ─── Create Axios Instance ──────────────────────────────────────────────────
const api = axios.create({
  baseURL: cleanApiUrl,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
  withCredentials: true,
  timeout: 30000, // 30 seconds timeout
});

// ─── Request Interceptor ───────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    // Try multiple token keys for compatibility
    const token = localStorage.getItem("re_token") || localStorage.getItem("token");
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request for debugging (remove in production)
    if (import.meta.env.DEV) {
      console.log(`📤 ${config.method?.toUpperCase() || 'GET'} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// ─── Response Interceptor ──────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (import.meta.env.DEV) {
      console.log(`📥 ${response.config.url}`, response.status);
    }
    return response;
  },
  (error) => {
    // ─── Handle Network Errors ──────────────────────────────────────────────
    if (error.code === 'ERR_NAME_NOT_RESOLVED') {
      console.error('❌ DNS Error: Cannot resolve API URL');
      console.error('💡 Check your VITE_API_URL in .env file');
      console.error('💡 Current URL:', cleanApiUrl);
      
      // Show user-friendly error
      error.message = 'Cannot connect to server. Please check your internet connection.';
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Connection Refused: Server is not running');
      console.error('💡 Make sure backend server is running on port 5000');
      
      error.message = 'Cannot connect to server. Please try again later.';
    }
    
    if (error.code === 'ERR_NETWORK') {
      console.error('❌ Network Error: Check your internet connection');
      error.message = 'Network error. Please check your internet connection.';
    }

    // ─── Handle HTTP Errors ──────────────────────────────────────────────────
    if (error.response) {
      // Log full error details
      console.error('❌ API Error Response:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data,
        message: error.response?.data?.message || error.message,
      });

      // Handle 401 Unauthorized
      if (error.response?.status === 401) {
        console.warn('⚠️ Session expired. Redirecting to login...');
        
        // Clear all auth data
        localStorage.removeItem("re_token");
        localStorage.removeItem("token");
        localStorage.removeItem("re_user");
        localStorage.removeItem("user");
        localStorage.removeItem("userData");
        
        // Redirect to login if not already there
        const currentPath = window.location.pathname;
        if (!['/login', '/', '/register'].includes(currentPath)) {
          window.location.href = '/login';
        }
      }
      
      // Handle 403 Forbidden
      if (error.response?.status === 403) {
        console.error('❌ Forbidden: You don\'t have permission to access this resource');
        error.message = error.response?.data?.message || 'You do not have permission to perform this action.';
      }
      
      // Handle 404 Not Found
      if (error.response?.status === 404) {
        console.error('❌ Not Found: Resource doesn\'t exist');
        error.message = error.response?.data?.message || 'The requested resource was not found.';
      }
      
      // Handle 422 Validation Error
      if (error.response?.status === 422) {
        console.error('❌ Validation Error:', error.response?.data?.errors);
        const errors = error.response?.data?.errors;
        if (errors && typeof errors === 'object') {
          const firstError = Object.values(errors)[0];
          error.message = Array.isArray(firstError) ? firstError[0] : firstError || 'Validation error.';
        } else {
          error.message = error.response?.data?.message || 'Please check your input.';
        }
      }
      
      // Handle 429 Too Many Requests
      if (error.response?.status === 429) {
        console.error('❌ Rate Limit: Too many requests');
        error.message = 'Too many requests. Please try again later.';
      }
      
      // Handle 500 Server Error
      if (error.response?.status >= 500) {
        console.error('❌ Server Error: Internal server error');
        error.message = 'Server error. Please try again later.';
      }

      // Use custom message from server if available
      if (error.response?.data?.message) {
        error.message = error.response.data.message;
      }
    }

    return Promise.reject(error);
  }
);

// ─── Helper Functions ──────────────────────────────────────────────────────

/**
 * Check if the API is reachable
 * @returns {Promise<boolean>} - True if API is reachable
 */
export const checkApiHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.status === 200;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
};

/**
 * Get the current API URL
 * @returns {string} - Current API base URL
 */
export const getApiUrl = () => cleanApiUrl;

/**
 * Set authorization token manually
 * @param {string} token - JWT token
 */
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
};

/**
 * Remove authorization token
 */
export const removeAuthToken = () => {
  delete api.defaults.headers.common['Authorization'];
  localStorage.removeItem('token');
  localStorage.removeItem('re_token');
  localStorage.removeItem('user');
  localStorage.removeItem('re_user');
};

export default api;