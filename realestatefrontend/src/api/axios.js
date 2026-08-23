// src/api/axios.js
import axios from "axios";

// ─── API URL Configuration ──────────────────────────────────────────────────
// Get API URL from environment with fallback
const ENVIRONMENT = import.meta.env.MODE || 'development';
const IS_DEV = ENVIRONMENT === 'development';
const API_URL = import.meta.env.VITE_API_URL || (
  import.meta.env.PROD ? "https://realepro.onrender.com/api" : "http://localhost:5000/api"
);

// Clean the URL (remove trailing slash and trim whitespace)
const cleanApiUrl = API_URL.replace(/\/$/, '').trim();

console.log(`🔌 API Base URL (${ENVIRONMENT}):`, cleanApiUrl);

// ─── Constants ──────────────────────────────────────────────────────────────
const TOKEN_KEY = 're_token';
const USER_KEY = 're_user';
const REFRESH_TOKEN_KEY = 're_refresh_token';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// ─── Create Axios Instance ──────────────────────────────────────────────────
const api = axios.create({
  baseURL: cleanApiUrl,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
  withCredentials: true,
  timeout: 30000, // 30 seconds timeout
});

// ─── Response Data Transformer ─────────────────────────────────────────────
const transformResponse = (response) => {
  // If response already has data, return it
  if (response?.data) {
    return response.data;
  }
  return response;
};

// ─── Token Management ──────────────────────────────────────────────────────
const getToken = () => {
  return localStorage.getItem(TOKEN_KEY) || localStorage.getItem("token");
};

const setToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
};

const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem("token");
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem("user");
  localStorage.removeItem("userData");
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  delete api.defaults.headers.common['Authorization'];
};

const getUser = () => {
  try {
    const userData = localStorage.getItem(USER_KEY) || localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
};

// ─── Request Interceptor ───────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request for debugging
    if (IS_DEV) {
      console.log(`📤 ${config.method?.toUpperCase() || 'GET'} ${config.url}`, {
        params: config.params,
        headers: config.headers,
      });
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
    if (IS_DEV) {
      console.log(`📥 ${response.config.url}`, response.status, response.data);
    }
    
    // Transform response data
    response.data = transformResponse(response);
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // ─── Handle Network / No-Response Errors ────────────────────────────────
    if (!error.response) {
      if (error.code === 'ERR_NAME_NOT_RESOLVED') {
        console.error('❌ DNS Error: Cannot resolve API URL');
        console.error('💡 Check your VITE_API_URL in .env file');
        console.error('💡 Current URL:', cleanApiUrl);
        error.message = 'Cannot connect to server. Please check your internet connection.';
      } else if (error.code === 'ECONNREFUSED') {
        console.error('❌ Connection Refused: Server is not running');
        console.error('💡 Make sure backend server is running');
        error.message = 'Cannot connect to server. Please try again later.';
      } else if (error.code === 'ERR_NETWORK') {
        console.error('❌ Network Error: Check your internet connection');
        error.message = 'Network error. Please check your internet connection.';
      } else if (error.code === 'ECONNABORTED') {
        console.error('❌ Timeout: Request took too long');
        error.message = 'Request timed out. Please try again.';
      } else {
        console.error('❌ Unknown Network Error:', error);
        error.message = 'An unexpected error occurred. Please try again.';
      }
      
      // Retry logic for network errors
      if (!originalRequest._retry && originalRequest?.url) {
        originalRequest._retry = true;
        const retryCount = originalRequest._retryCount || 0;
        
        if (retryCount < MAX_RETRIES) {
          originalRequest._retryCount = retryCount + 1;
          console.log(`🔄 Retrying request (${retryCount + 1}/${MAX_RETRIES})...`);
          
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
          return api(originalRequest);
        }
      }
      
      return Promise.reject(error);
    }

    // ─── Handle HTTP Errors ──────────────────────────────────────────────────
    const { status, data, config } = error.response;
    
    // Log full error details
    console.error('❌ API Error Response:', {
      url: config?.url,
      method: config?.method,
      status: status,
      data: data,
      message: data?.message || error.message,
    });

    // Set a baseline message from the server's generic `message` field first.
    if (data?.message) {
      error.message = data.message;
    }

    // Handle 401 Unauthorized - Try refresh token
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        if (refreshToken) {
          const response = await api.post('/auth/refresh', { refreshToken });
          const { token } = response.data;
          
          if (token) {
            setToken(token);
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('❌ Refresh token failed:', refreshError);
      }
      
      // If refresh fails, clear session and redirect
      console.warn('⚠️ Session expired. Redirecting to login...');
      removeToken();
      
      const currentPath = window.location.pathname;
      if (!['/login', '/', '/register'].includes(currentPath)) {
        window.location.href = '/login';
      }
      
      error.message = 'Session expired. Please login again.';
    }
    
    // Handle 403 Forbidden
    if (status === 403) {
      console.error('❌ Forbidden: You don\'t have permission to access this resource');
      error.message = data?.message || 'You do not have permission to perform this action.';
    }
    
    // Handle 404 Not Found
    if (status === 404) {
      console.error('❌ Not Found: Resource doesn\'t exist');
      error.message = data?.message || 'The requested resource was not found.';
    }
    
    // Handle 422 Validation Error
    if (status === 422) {
      console.error('❌ Validation Error:', data?.errors);
      const errors = data?.errors;
      if (errors && typeof errors === 'object') {
        const firstError = Object.values(errors)[0];
        error.message = Array.isArray(firstError) ? firstError[0] : firstError || 'Validation error.';
      } else {
        error.message = data?.message || 'Please check your input.';
      }
    }
    
    // Handle 429 Too Many Requests
    if (status === 429) {
      console.error('❌ Rate Limit: Too many requests');
      error.message = data?.message || 'Too many requests. Please try again later.';
    }
    
    // Handle 500+ Server Errors
    if (status >= 500) {
      console.error('❌ Server Error:', status);
      error.message = data?.message || 'Server error. Please try again later.';
    }

    return Promise.reject(error);
  }
);

// ─── API Helper Functions ──────────────────────────────────────────────────

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
 * @param {object} user - User data (optional)
 */
export const setAuthToken = (token, user = null) => {
  if (token) {
    setToken(token);
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  } else {
    removeToken();
  }
};

/**
 * Get current auth token
 * @returns {string|null} - Current JWT token
 */
export const getAuthToken = () => getToken();

/**
 * Get current user data
 * @returns {object|null} - Current user data
 */
export const getCurrentUser = () => getUser();

/**
 * Remove authorization token and user data
 */
export const removeAuthToken = () => {
  removeToken();
};

/**
 * Set refresh token
 * @param {string} token - Refresh token
 */
export const setRefreshToken = (token) => {
  if (token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean} - True if user has a valid token
 */
export const isAuthenticated = () => {
  const token = getToken();
  return !!token;
};

/**
 * Create a cancel token for request cancellation
 * @returns {object} - Cancel token source
 */
export const createCancelToken = () => {
  return axios.CancelToken.source();
};

/**
 * Upload file with progress tracking
 * @param {string} url - Upload URL
 * @param {FormData} formData - Form data with file
 * @param {Function} onProgress - Progress callback
 * @param {object} options - Additional options
 * @returns {Promise} - Upload promise
 */
export const uploadFile = async (url, formData, onProgress, options = {}) => {
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      }
    },
    ...options,
  };
  
  return api.post(url, formData, config);
};

// ─── Default Export ──────────────────────────────────────────────────────
export default api;