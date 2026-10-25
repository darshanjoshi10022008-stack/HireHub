const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Authentication token required.",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account no longer exists.",
      });
    }

    if (user.status === "suspended") {
      return res.status(403).json({
        success: false,
        message: "This account has been suspended. Please contact support.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication session. Please log in again.",
    });
  }
};

/**
 * Middleware requiring that the authenticated user has verified their email address.
 */
const requireVerified = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  if (!req.user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      isEmailVerified: false,
      message: "Please verify your email address to access this feature.",
    });
  }

  next();
};

/**
 * Role-based authorization middleware.
 * Treats 'student' and 'candidate' as equivalent roles.
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access.",
      });
    }

    // Normalize candidate roles
    const userRole = req.user.role === "student" ? "candidate" : req.user.role;
    const normalizedRoles = roles.map((r) => (r === "student" ? "candidate" : r));

    if (!normalizedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: role '${req.user.role}' is not authorized to access this resource.`,
      });
    }

    next();
  };
};

module.exports = {
  protect,
  requireVerified,
  authorize,
};
