const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const CandidateProfile = require("../models/CandidateProfile");
const Company = require("../models/Company");
const { sendVerificationEmail, sendPasswordResetEmail } = require("../services/emailService");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );
};

// ==============================
// REGISTER WITH EMAIL & PASSWORD
// ==============================
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanName.length < 2 || cleanName.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Name must be between 2 and 100 characters",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    // Role mapping: student/candidate or recruiter
    let selectedRole = role || "student";
    if (selectedRole === "candidate") {
      selectedRole = "student";
    }

    if (!["student", "candidate", "recruiter"].includes(role || "student")) {
      return res.status(400).json({
        success: false,
        message: "Invalid role selected",
      });
    }

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate single-use, cryptographically secure email verification token
    const rawVerificationToken = crypto.randomBytes(32).toString("hex");
    const hashedVerificationToken = crypto
      .createHash("sha256")
      .update(rawVerificationToken)
      .digest("hex");

    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      password: hashedPassword,
      role: selectedRole,
      isEmailVerified: false,
      verificationToken: hashedVerificationToken,
      verificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    // Auto-seed candidate profile for student/candidate
    if (user.role === "student" || user.role === "candidate") {
      await CandidateProfile.create({
        user: user._id,
        headline: "",
        bio: "",
        skills: [],
      }).catch((err) => console.error("Auto profile creation notice:", err.message));
    }

    // Dispatch verification email
    const emailResult = await sendVerificationEmail({
      to: user.email,
      name: user.name,
      token: rawVerificationToken,
    });

    // Do not issue an active authenticated session until email is verified
    return res.status(201).json({
      success: true,
      message: emailResult.success
        ? "Registration successful! A verification email has been dispatched. Please verify your account before logging in."
        : "Account created successfully, but we encountered an issue delivering your verification email. Please use the resend verification option.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: false,
      },
      emailDelivered: emailResult.delivered,
      verificationUrl: emailResult.verificationUrl || undefined,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    console.error("Register error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Registration failed. Please try again.",
    });
  }
};

// ==============================
// LOGIN WITH EMAIL & PASSWORD
// ==============================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (user.status === "suspended") {
      return res.status(403).json({
        success: false,
        message: "This account has been suspended. Please contact support.",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Require email verification before allowing login
    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        isEmailVerified: false,
        code: "EMAIL_NOT_VERIFIED",
        message: "Your email address is not verified. Please verify your email before logging in.",
        email: user.email,
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
    });
  }
};

// ==============================
// VERIFY EMAIL ADDRESS
// ==============================
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token || typeof token !== "string" || token.trim().length === 0) {
      return res.status(400).json({
        success: false,
        code: "INVALID_TOKEN",
        message: "Verification token is required.",
      });
    }

    const hashedToken = crypto.createHash("sha256").update(token.trim()).digest("hex");

    const user = await User.findOne({
      verificationToken: hashedToken,
    }).select("+verificationToken +verificationTokenExpires");

    if (!user) {
      return res.status(400).json({
        success: false,
        code: "INVALID_TOKEN",
        message: "Verification link is invalid or has already been used.",
      });
    }

    if (user.verificationTokenExpires && user.verificationTokenExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        code: "EXPIRED_TOKEN",
        message: "Verification link has expired. Verification links are valid for 24 hours.",
        email: user.email,
      });
    }

    // Mark verified and invalidate single-use token
    user.isEmailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    const authToken = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Your email address has been successfully verified! You may now access all features.",
      token: authToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: true,
      },
    });
  } catch (error) {
    console.error("Verify email error:", error.message);
    return res.status(500).json({
      success: false,
      code: "SERVER_ERROR",
      message: "Email verification failed due to an internal server error. Please try again later.",
    });
  }
};

// ==============================
// RESEND VERIFICATION EMAIL
// ==============================
const resendVerification = async (req, res) => {
  try {
    const email = req.body.email || (req.user && req.user.email);

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email address is required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail }).select("+verificationToken +verificationTokenExpires");

    // Avoid user enumeration
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If that email is registered and unverified, a verification link has been sent.",
      });
    }

    if (user.isEmailVerified) {
      return res.status(200).json({
        success: true,
        alreadyVerified: true,
        message: "This account has already been verified. You may log in directly.",
      });
    }

    // Invalidate prior token and issue fresh token
    const rawVerificationToken = crypto.randomBytes(32).toString("hex");
    const hashedVerificationToken = crypto
      .createHash("sha256")
      .update(rawVerificationToken)
      .digest("hex");

    user.verificationToken = hashedVerificationToken;
    user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    const emailResult = await sendVerificationEmail({
      to: user.email,
      name: user.name,
      token: rawVerificationToken,
    });

    return res.status(200).json({
      success: true,
      message: "A fresh verification email has been dispatched. Please check your inbox.",
      emailDelivered: emailResult.delivered,
      verificationUrl: emailResult.verificationUrl || undefined,
    });
  } catch (error) {
    console.error("Resend verification error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to resend verification email. Please try again later.",
    });
  }
};

// ==============================
// FORGOT PASSWORD
// ==============================
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email address is required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    // Prevent email enumeration
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If an account exists with this email, a password reset link has been dispatched.",
      });
    }

    const rawResetToken = crypto.randomBytes(32).toString("hex");
    const hashedResetToken = crypto.createHash("sha256").update(rawResetToken).digest("hex");

    user.resetPasswordToken = hashedResetToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const emailResult = await sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      token: rawResetToken,
    });

    return res.status(200).json({
      success: true,
      message: "If an account exists with this email, a password reset link has been dispatched.",
      resetUrl: emailResult.resetUrl || undefined,
    });
  } catch (error) {
    console.error("Forgot password error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Password recovery request failed",
    });
  }
};

// ==============================
// RESET PASSWORD
// ==============================
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: "Token and new password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select("+resetPasswordToken +resetPasswordExpires");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Password reset link is invalid or has expired.",
      });
    }

    user.password = await bcrypt.hash(password, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Your password has been successfully reset. You may now log in.",
    });
  } catch (error) {
    console.error("Reset password error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to reset password",
    });
  }
};

// ==============================
// GOOGLE SIGNUP / LOGIN
// ==============================
const googleLogin = async (req, res) => {
  try {
    const { credential, role } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: "Google credential is required",
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.sub || !payload.email || payload.email_verified !== true) {
      return res.status(401).json({
        success: false,
        message: "Please use a verified Google account",
      });
    }

    const cleanEmail = payload.email.toLowerCase();
    let user = await User.findOne({ email: cleanEmail });

    if (!user) {
      let selectedRole = role || "student";
      if (selectedRole === "candidate") selectedRole = "student";

      user = await User.create({
        name: payload.name || cleanEmail.split("@")[0],
        email: cleanEmail,
        password: crypto.randomBytes(32).toString("hex"),
        role: selectedRole,
        isEmailVerified: true, // Google accounts have pre-verified email addresses
        avatar: payload.picture || "",
      });

      if (user.role === "student" || user.role === "candidate") {
        await CandidateProfile.create({
          user: user._id,
        }).catch(() => {});
      }
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Google login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Google login error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Google authentication failed",
    });
  }
};

// ==============================
// GET CURRENT USER PROFILE (/me)
// ==============================
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let candidateProfile = null;
    let company = null;

    if (user.role === "student" || user.role === "candidate") {
      candidateProfile = await CandidateProfile.findOne({ user: user._id });
    } else if (user.role === "recruiter") {
      company = await Company.findOne({ owner: user._id });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        status: user.status,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
      candidateProfile,
      company,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load user profile",
    });
  }
};

// ==============================
// UPDATE PASSWORD
// ==============================
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters long",
      });
    }

    const user = await User.findById(req.user._id).select("+password");
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect current password",
      });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update password",
    });
  }
};

module.exports = {
  register,
  login,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  googleLogin,
  getMe,
  updatePassword,
};
