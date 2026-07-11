import api from "./axios";

// ================= LOGIN =================

export const login = (data) =>
  api.post("/auth/login", data);

// ================= REGISTER =================

export const register = (data) =>
  api.post("/auth/register", data);

// ============== PASSWORD RESET ==============

export const forgotPassword = (email) =>
  api.post("/auth/forgot-password", { email });

export const resetPassword = (data) =>
  api.post("/auth/reset-password", data);

// ============== PROFILE ===================

export const getMe = () =>
  api.get("/auth/me");

export const updateProfile = (data) =>
  api.put("/auth/updateprofile", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const changePassword = (data) =>
  api.put("/auth/changepassword", data);

// ============== LOGOUT ====================

export const logout = () =>
  api.get("/auth/logout");