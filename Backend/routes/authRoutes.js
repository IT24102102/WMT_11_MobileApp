const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword
} = require("../Controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
router.post("/forgot-password", forgotPassword);

// @desc    Reset password
// @route   POST /api/auth/reset-password
router.post("/reset-password", resetPassword);

// @desc    Register a new user
// @route   POST /api/auth/register
router.post("/register", registerUser);

// @desc    Authenticate a user
// @route   POST /api/auth/login
router.post("/login", loginUser);

// @desc    Get current user profile
// @route   GET /api/auth/me
router.get("/me", protect, getMe);

// @desc    Update user profile
// @route   PUT /api/auth/profile
router.put("/profile", protect, updateProfile);

// Backward Compatibility for legacy update routes
router.put("/update-profile", protect, updateProfile);
router.put("/update-asc", protect, updateProfile);
router.put("/update-districts", protect, updateProfile);

module.exports = router;
