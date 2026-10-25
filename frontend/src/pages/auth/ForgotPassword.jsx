import React, { useState } from "react";
import { Link } from "react-router-dom";
import { authApi } from "../../api";
import { KeyRound, ArrowLeft } from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Alert from "../../components/Alert";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [alertInfo, setAlertInfo] = useState(null);
  const [resetUrl, setResetUrl] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setAlertInfo(null);
    setResetUrl("");

    try {
      const res = await authApi.forgotPassword({ email: email.trim().toLowerCase() });
      setAlertInfo({
        type: "success",
        message:
          res.message ||
          "If an account is associated with this email, a password reset link has been dispatched.",
      });
      if (res.resetUrl) {
        setResetUrl(res.resetUrl);
      }
    } catch (err) {
      setAlertInfo({
        type: "error",
        message: err.message || "Failed to process password reset request.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="page-content" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 20px" }}>
        <div className="card" style={{ maxWidth: "480px", width: "100%", padding: "36px 30px" }}>
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "#eff6ff",
                border: "1px solid #dbeafe",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "12px",
              }}
            >
              <KeyRound size={24} color="#1264c8" />
            </div>
            <h1 style={{ fontSize: "24px", color: "#0b2749", margin: "0 0 8px" }}>
              Recover Password
            </h1>
            <p style={{ color: "#64748b", fontSize: "14px" }}>
              Provide your account's email address and we'll send you instructions to safely reset your password.
            </p>
          </div>

          {alertInfo && <Alert type={alertInfo.type} message={alertInfo.message} />}

          {resetUrl && (
            <div style={{ margin: "16px 0 24px", padding: "14px", background: "#f0fdf4", borderRadius: "8px", border: "1px dashed #86efac" }}>
              <p style={{ fontSize: "12px", color: "#166534", marginBottom: "6px", fontWeight: "bold" }}>
                [Development Simulation Link]:
              </p>
              <a href={resetUrl} style={{ fontSize: "13px", color: "#1264c8", wordBreak: "break-all" }}>
                Click here to set a new password
              </a>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
              {loading ? "Dispatched reset email..." : "Send Password Reset Link"}
            </button>
          </form>

          <div style={{ marginTop: "24px", textAlign: "center" }}>
            <Link
              to="/login"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                color: "#64748b",
                fontSize: "13px",
                fontWeight: 500,
              }}
            >
              <ArrowLeft size={14} /> Back to Sign In
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ForgotPassword;
