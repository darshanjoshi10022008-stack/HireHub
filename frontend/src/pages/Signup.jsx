import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import GoogleLoginButton from "../GoogleLoginButton";
import { Eye, EyeOff, CheckCircle2, Mail, RefreshCw } from "lucide-react";
import "./Signup.css";

function Signup() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [role, setRole] = useState("candidate");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [registeredSuccess, setRegisteredSuccess] = useState(false);
  const [verificationUrl, setVerificationUrl] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setMessage("");
    setMessageType("");
  };

  const validateForm = () => {
    if (!form.fullName.trim() || !form.email.trim() || !form.password || !form.confirmPassword) {
      setMessage("Please fill in all required fields.");
      setMessageType("error");
      return false;
    }

    if (form.fullName.trim().length < 2) {
      setMessage("Full name must contain at least 2 characters.");
      setMessageType("error");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) {
      setMessage("Please enter a valid email address.");
      setMessageType("error");
      return false;
    }

    if (form.password.length < 8) {
      setMessage("Password must be at least 8 characters long.");
      setMessageType("error");
      return false;
    }

    if (form.password !== form.confirmPassword) {
      setMessage("Passwords do not match.");
      setMessageType("error");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      const selectedRole = role === "employer" ? "recruiter" : "student";

      const res = await register({
        name: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: selectedRole,
      });

      if (!res.success) {
        throw new Error(res.message || "Registration failed.");
      }

      setRegisteredSuccess(true);
      setMessage(
        "Registration successful! A verification email has been dispatched. Please verify your email to unlock all features."
      );
      setMessageType("success");
      if (res.verificationUrl) {
        setVerificationUrl(res.verificationUrl);
      }
    } catch (error) {
      console.error("Signup error:", error);
      setMessage(error.message || "Something went wrong. Please try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="signup-page">
      <section className="signup-left">
        <Link className="signup-brand" to="/" aria-label="HireHub home">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 7.5h16a1.5 1.5 0 0 1 1.5 1.5v10A1.5 1.5 0 0 1 20 20.5H4A1.5 1.5 0 0 1 2.5 19V9A1.5 1.5 0 0 1 4 7.5Z" />
            <path d="M8 7.5V5.75A1.75 1.75 0 0 1 9.75 4h4.5A1.75 1.75 0 0 1 16 5.75V7.5M2.75 12h18.5M10 12v2h4v-2" />
          </svg>
          <span>HireHub</span>
        </Link>

        <div className="signup-content">
          <h1>Create account.</h1>

          <p className="signup-login">
            Already have an account? <Link to="/login">Log in</Link>
          </p>

          {registeredSuccess ? (
            <div
              style={{
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: "12px",
                padding: "32px 24px",
                textAlign: "center",
                marginTop: "16px",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  background: "#dcfce7",
                  border: "1px solid #86efac",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "16px",
                }}
              >
                <Mail size={28} color="#15803d" />
              </div>
              <h3 style={{ color: "#166534", fontSize: "20px", marginBottom: "8px", fontWeight: 700 }}>
                Check Your Email
              </h3>
              <p style={{ color: "#166534", fontSize: "14px", lineHeight: "1.6", marginBottom: "16px" }}>
                We've sent a verification link to <strong>{form.email}</strong>.
                Please click the link in your email to activate your account and access your dashboard.
              </p>

              {verificationUrl && (
                <div style={{ margin: "16px 0", padding: "14px", background: "#ffffff", borderRadius: "8px", border: "1px dashed #86efac", textAlign: "left" }}>
                  <p style={{ fontSize: "12px", color: "#166534", marginBottom: "6px", fontWeight: "bold" }}>
                    [Development Testing Link]:
                  </p>
                  <a
                    href={verificationUrl}
                    style={{ fontSize: "13px", color: "#1264c8", wordBreak: "break-all", fontWeight: 600 }}
                  >
                    Click here to instantly verify your email
                  </a>
                </div>
              )}

              <p style={{ color: "#64748b", fontSize: "12px", margin: "16px 0 20px" }}>
                Verification links expire in 24 hours. Didn't receive the email? Check your spam folder or request a new one below.
              </p>

              <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
                <Link
                  to="/resend-verification"
                  state={{ email: form.email }}
                  className="btn btn-secondary btn-sm"
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  <RefreshCw size={13} />
                  <span>Resend Email</span>
                </Link>
                <Link to="/login" className="btn btn-primary btn-sm">
                  Go to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="role-selector" aria-label="Choose account type">
                <span className="role-selector-label">Create account as</span>
                <div className="role-box">
                  <button
                    type="button"
                    className={role === "candidate" ? "selected" : ""}
                    aria-pressed={role === "candidate"}
                    onClick={() => setRole("candidate")}
                  >
                    Candidate
                  </button>

                  <button
                    type="button"
                    className={role === "employer" ? "selected" : ""}
                    aria-pressed={role === "employer"}
                    onClick={() => setRole("employer")}
                  >
                    Employer
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Full Name (e.g. Alex Morgan)"
                  value={form.fullName}
                  onChange={handleChange}
                  autoComplete="name"
                  minLength={2}
                  maxLength={100}
                  required
                />

                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />

                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password (minimum 8 characters)"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#94a3b8",
                      display: "flex",
                      alignItems: "center",
                    }}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <div style={{ position: "relative" }}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#94a3b8",
                      display: "flex",
                      alignItems: "center",
                    }}
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <label className="terms-label">
                  <input type="checkbox" required />
                  <span>
                    I've read and agree with HireHub's{" "}
                    <Link to="/terms">Terms of Service</Link> and{" "}
                    <Link to="/privacy">Privacy Policy</Link>.
                  </span>
                </label>

                <button type="submit" disabled={loading}>
                  {loading ? "Creating your account..." : "Create Account"}
                  <span aria-hidden="true">{loading ? "..." : "→"}</span>
                </button>

                {message && (
                  <p
                    role="status"
                    aria-live="polite"
                    className={`signup-message ${messageType}`}
                  >
                    {message}
                  </p>
                )}
              </form>

              <div className="social-signup">
                <div className="social-divider">
                  <span>OR</span>
                </div>

                <div className="social-options">
                  <button
                    className="linkedin-button"
                    type="button"
                    onClick={() =>
                      alert("LinkedIn OAuth is available in production when client credentials are provided.")
                    }
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M6.5 8.5H3.25V20h3.25V8.5ZM4.88 3a1.88 1.88 0 1 0 0 3.76 1.88 1.88 0 0 0 0-3.76ZM20.75 13.4c0-3.47-1.85-5.08-4.32-5.08a3.73 3.73 0 0 0-3.36 1.85V8.5H9.82V20h3.25v-5.68c0-1.5.28-2.96 2.15-2.96 1.84 0 1.86 1.72 1.86 3.06V20h3.25l.42-6.6Z" />
                    </svg>
                    <span>Continue with LinkedIn</span>
                  </button>

                  <div className="google-button">
                    <GoogleLoginButton role={role === "employer" ? "recruiter" : "student"} />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="signup-right">
        <div className="signup-promo">
          <span className="promo-eyebrow">YOUR CAREER STARTS HERE</span>
          <h2>Meet your next opportunity.</h2>
          <p>Find the right job. Connect with great companies. Build your future.</p>

          <div className="signup-start">
            <div>
              <span className="promo-stat">01</span>
              <h3>Live Jobs</h3>
              <p>Explore verified openings</p>
            </div>

            <div>
              <span className="promo-stat">02</span>
              <h3>Companies</h3>
              <p>Discover top employers</p>
            </div>

            <div>
              <span className="promo-stat">03</span>
              <h3>Fast Apply</h3>
              <p>Instant application tracking</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Signup;
