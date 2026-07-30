const express = require("express");
const router = express.Router();

const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  logout,
  googleRegister,
} = require("../controllers/authController");

const { protect } = require("../middleware/auth");
const { uploadAvatar } = require("../middleware/upload");

// ==============================
// Public Authentication Routes
// ==============================

// @route  POST /api/auth/register
// @desc   Register a new user
// @access Public
router.post("/register", register);

// @route  POST /api/auth/login
// @desc   Login user
// @access Public
router.post("/login", login);

// @route  POST /api/auth/google-register
// @desc   Register/Login with Google
// @access Public
router.post("/google-register", googleRegister);

// @route  POST /api/auth/forgot-password
// @desc   Initiate password reset flow
// @access Public
router.post("/forgot-password", forgotPassword);

// @route  POST /api/auth/reset-password
// @desc   Reset password
// @access Public
router.post("/reset-password", resetPassword);

// ==============================
// Protected Routes (Authentication Required)
// ==============================

// @route  GET /api/auth/me
// @desc   Get current user profile
// @access Private
router.get("/me", protect, getMe);

// @route  PUT /api/auth/updateprofile
// @desc   Update user profile
// @access Private
router.put(
  "/updateprofile",
  protect,
  uploadAvatar.single("avatar"),
  updateProfile
);

// @route  PUT /api/auth/changepassword
// @desc   Change user password
// @access Private
router.put("/changepassword", protect, changePassword);

// @route  GET /api/auth/logout
// @desc   Logout user
// @access Private
router.get("/logout", protect, logout);

// ==============================
// ✅ EXPORT ROUTER
// ==============================
module.exports = router;