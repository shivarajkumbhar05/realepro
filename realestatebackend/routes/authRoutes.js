const express = require("express");
const router = express.Router();

const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  resetPassword,
  logout,
} = require("../controllers/authController");

const { protect } = require("../middleware/auth");
const { uploadAvatar } = require("../middleware/upload");

// ==============================
// Public Authentication Routes
// ==============================

// Registration & Login
router.post("/register", register);
router.post("/login", login);

// Password Reset (no OTP)
router.post("/reset-password", resetPassword);

// ==============================
// Protected Routes
// ==============================

// User Profile
router.get("/me", protect, getMe);

// Update Profile
router.put(
  "/updateprofile",
  protect,
  uploadAvatar.single("avatar"),
  updateProfile
);

// Change Password
router.put("/changepassword", protect, changePassword);

// Logout
router.get("/logout", protect, logout);

module.exports = router;