import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import GoogleLoginButton from "../../GoogleLoginButton";
import { Eye, EyeOff, AlertCircle, Mail, RefreshCw } from "lucide-react";
import "../Signup.css";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [unverifiedEmail, setUnverifiedEmail] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
    setUnverifiedEmail("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setUnverifiedEmail("");

    if (!form.email.trim() || !form.password) {
      setError("Please provide both email and password.");
      return;
    }

    setLoading(true);

    try {
      const res = await login(form.email.trim().toLowerCase(), form.password);

      if (res.success && res.user) {
        // Redirect to intended route or role dashboard
        const redirectPath = location.state?.from?.pathname;
        if (redirectPath) {
          navigate(redirectPath, { replace: true });
        } else if (res.user.role === "admin") {
          navigate("/admin/dashboard", { replace: true });
        } else if (res.user.role === "recruiter") {
          navigate("/recruiter/dashboard", { replace: true });
        } else {
          navigate("/candidate/dashboard", { replace: true });
        }
      }
    } catch (err) {
      console.error("Login failure:", err);
      const isUnverified =
        err.status === 403 &&
        (err.isEmailVerified === false ||
          err.code === "EMAIL_NOT_VERIFIED" ||
          err.data?.code === "EMAIL_NOT_VERIFIED" ||
          err.message?.toLowerCase().includes("not verified"));

      if (isUnverified) {
        setUnverifiedEmail(err.data?.email || form.email.trim());
        setError("Your email address is not verified. Please check your inbox or request a fresh verification link.");
      } else {
        setError(err.message || "Invalid credentials. Please verify and try again.");
      }
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
          <h1>Welcome back.</h1>
          <p className="signup-login">
            New to HireHub? <Link to="/signup">Create an account</Link>
          </p>

          <form onSubmit={handleSubmit}>
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
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
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

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "12px",
                margin: "4px 0 8px",
              }}
            >
              <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", color: "#64748b" }}>
                <input type="checkbox" defaultChecked />
                <span>Remember me</span>
              </label>

              <Link to="/forgot-password" style={{ color: "#1264c8", fontWeight: 600 }}>
                Forgot password?
              </Link>
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Authenticating..." : "Sign In to HireHub"}
              <span aria-hidden="true">{loading ? "..." : "→"}</span>
            </button>

            {unverifiedEmail ? (
              <div
                style={{
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  borderRadius: "8px",
                  padding: "14px",
                  marginTop: "16px",
                  textAlign: "left",
                }}
              >
                <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                  <Mail size={18} color="#1d4ed8" style={{ marginTop: "2px", flexShrink: 0 }} />
                  <div>
                    <strong style={{ fontSize: "13px", color: "#1e40af", display: "block", marginBottom: "4px" }}>
                      Account Not Verified
                    </strong>
                    <p style={{ margin: "0 0 10px 0", fontSize: "12px", color: "#3b82f6", lineHeight: 1.5 }}>
                      Please verify your email address to log in. You can request a fresh verification link below:
                    </p>
                    <Link
                      to="/resend-verification"
                      state={{ email: unverifiedEmail, unverified: true }}
                      className="btn btn-primary"
                      style={{
                        fontSize: "12px",
                        padding: "6px 12px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        borderRadius: "6px",
                      }}
                    >
                      <RefreshCw size={13} />
                      <span>Resend Verification Link</span>
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              error && (
                <p
                  role="status"
                  aria-live="polite"
                  className="signup-message error"
                  style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "12px" }}
                >
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </p>
              )
            )}
          </form>

          <div style={{ marginTop: "14px", textAlign: "center", fontSize: "12px", color: "#64748b" }}>
            Unverified account?{" "}
            <Link to="/resend-verification" style={{ color: "#1264c8", fontWeight: 600 }}>
              Resend verification email
            </Link>
          </div>

          <div className="social-signup">
            <div className="social-divider">
              <span>OR CONTINUE WITH</span>
            </div>

            <div className="social-options">
              <button
                className="linkedin-button"
                type="button"
                onClick={() =>
                  alert("LinkedIn login is available in production when credentials are configured.")
                }
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M6.5 8.5H3.25V20h3.25V8.5ZM4.88 3a1.88 1.88 0 1 0 0 3.76 1.88 1.88 0 0 0 0-3.76ZM20.75 13.4c0-3.47-1.85-5.08-4.32-5.08a3.73 3.73 0 0 0-3.36 1.85V8.5H9.82V20h3.25v-5.68c0-1.5.28-2.96 2.15-2.96 1.84 0 1.86 1.72 1.86 3.06V20h3.25l.42-6.6Z" />
                </svg>
                <span>LinkedIn</span>
              </button>

              <div className="google-button">
                <GoogleLoginButton />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="signup-right">
        <div className="signup-promo">
          <span className="promo-eyebrow">HIREHUB PLATFORM</span>
          <h2>Access your career dashboard.</h2>
          <p>
            Review job matches, manage applications, track interview progress, or hire top talent from our candidate network.
          </p>

          <div className="signup-start">
            <div>
              <span className="promo-stat">★</span>
              <h3>Verified Jobs</h3>
              <p>Direct from vetted employers</p>
            </div>

            <div>
              <span className="promo-stat">⚡</span>
              <h3>Fast Responses</h3>
              <p>Real-time status updates</p>
            </div>

            <div>
              <span className="promo-stat">🔒</span>
              <h3>Secure Platform</h3>
              <p>Confidential applicant data</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Login;
