const rateLimit = require("express-rate-limit");

/**
 * Standard rate limiter response formatter
 */
const createLimiter = (options) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutes by default
    max: options.max || 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: options.message || "Too many requests from this IP. Please try again later.",
    },
    ...options,
  });
};

// General auth endpoint rate limiter (registration and login)
const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30, // 30 requests per 15 minutes
  message: "Too many authentication attempts. Please try again after 15 minutes.",
});

// Resend email verification rate limiter (strict to prevent mail bombing)
const resendVerificationLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10, // 10 verification requests per 15 minutes
  message: "Too many verification email requests. Please wait a few minutes before trying again.",
});

// Password recovery request rate limiter
const passwordResetLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10, // 10 password reset requests per 15 minutes
  message: "Too many password recovery requests. Please wait a few minutes before trying again.",
});

// Verification link validation rate limiter
const verifyEmailLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 60, // 60 attempts per 15 minutes
  message: "Too many verification attempts. Please try again later.",
});

module.exports = {
  authLimiter,
  resendVerificationLimiter,
  passwordResetLimiter,
  verifyEmailLimiter,
};
