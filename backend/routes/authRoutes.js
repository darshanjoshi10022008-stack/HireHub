const express = require("express");
const {
  register,
  login,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  googleLogin,
  getMe,
  updatePassword,
} = require("../controllers/authController");
const { protect, requireVerified } = require("../middleware/authMiddleware");
const {
  authLimiter,
  resendVerificationLimiter,
  passwordResetLimiter,
  verifyEmailLimiter,
} = require("../middleware/rateLimiter");

const router = express.Router();

// Public auth endpoints with rate limiting
router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.get("/verify-email/:token", verifyEmailLimiter, verifyEmail);
router.post("/resend-verification", resendVerificationLimiter, resendVerification);
router.post("/forgot-password", passwordResetLimiter, forgotPassword);
router.post("/reset-password/:token", passwordResetLimiter, resetPassword);
router.post("/google", authLimiter, googleLogin);

// Protected auth endpoints
router.get("/me", protect, getMe);
router.put("/update-password", protect, requireVerified, updatePassword);

module.exports = router;
