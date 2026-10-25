import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { authApi } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { Mail, CheckCircle2, AlertCircle } from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Alert from "../../components/Alert";

const ResendVerification = () => {
  const location = useLocation();
  const { user } = useAuth();

  // Extract email from location state or URL query parameter
  const searchParams = new URLSearchParams(location.search);
  const initialEmail = location.state?.email || searchParams.get("email") || user?.email || "";
  const isFromUnverifiedGuard = Boolean(location.state?.unverified);

  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [alertInfo, setAlertInfo] = useState(null);
  const [verificationUrl, setVerificationUrl] = useState("");

  useEffect(() => {
    if (initialEmail && !email) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setAlertInfo(null);
    setVerificationUrl("");

    try {
      const res = await authApi.resendVerification({ email: email.trim().toLowerCase() });

      setAlertInfo({
        type: res.alreadyVerified ? "info" : "success",
        message:
          res.message ||
          "If an account with that email is pending verification, a fresh verification link has been dispatched.",
      });

      if (res.verificationUrl) {
        setVerificationUrl(res.verificationUrl);
      }
    } catch (err) {
      setAlertInfo({
        type: "error",
        message: err.message || "Failed to resend verification email. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <main
        className="page-content"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 20px",
          minHeight: "70vh",
        }}
      >
        <div
          className="card"
          style={{
            maxWidth: "500px",
            width: "100%",
            padding: "40px 32px",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08)",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "50%",
                background: "#eff6ff",
                border: "1px solid #dbeafe",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px",
              }}
            >
              <Mail size={26} color="#1264c8" />
            </div>
            <h1 style={{ fontSize: "24px", color: "#0b2749", margin: "0 0 8px", fontWeight: 700 }}>
              Resend Verification Email
            </h1>
            <p style={{ color: "#64748b", fontSize: "14px", lineHeight: 1.5, margin: 0 }}>
              Enter your registered email address and we'll send a fresh, single-use activation link.
            </p>
          </div>

          {isFromUnverifiedGuard && !alertInfo && (
            <div
              style={{
                marginBottom: "20px",
                padding: "14px 16px",
                background: "#fffbeb",
                border: "1px solid #fde68a",
                borderRadius: "8px",
                display: "flex",
                gap: "10px",
                alignItems: "flex-start",
              }}
            >
              <AlertCircle size={18} color="#d97706" style={{ flexShrink: 0, marginTop: "2px" }} />
              <p style={{ fontSize: "13px", color: "#92400e", margin: 0, lineHeight: 1.5 }}>
                <strong>Verification Required:</strong> Your email address must be verified before you can access HireHub dashboards and features.
              </p>
            </div>
          )}

          {alertInfo && <Alert type={alertInfo.type} message={alertInfo.message} />}

          {verificationUrl && (
            <div
              style={{
                margin: "18px 0 24px",
                padding: "16px",
                background: "#f0fdf4",
                borderRadius: "10px",
                border: "1px dashed #86efac",
              }}
            >
              <p style={{ fontSize: "12px", color: "#166534", margin: "0 0 8px", fontWeight: "bold" }}>
                [Development Simulation Link]:
              </p>
              <a
                href={verificationUrl}
                style={{
                  fontSize: "13px",
                  color: "#1264c8",
                  wordBreak: "break-all",
                  fontWeight: 600,
                  textDecoration: "underline",
                }}
              >
                Click here to verify email directly
              </a>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ marginTop: "16px" }}>
            <div className="form-group" style={{ marginBottom: "20px" }}>
              <label className="form-label" style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600, color: "#334155" }}>
                Registered Email Address
              </label>
              <input
                type="email"
                className="form-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", padding: "12px", fontSize: "15px", fontWeight: 600, borderRadius: "8px" }}
              disabled={loading}
            >
              {loading ? "Dispatching verification email..." : "Send Verification Email"}
            </button>
          </form>

          <div style={{ marginTop: "24px", textAlign: "center", fontSize: "13px", color: "#64748b" }}>
            Already verified or ready to sign in?{" "}
            <Link to="/login" style={{ color: "#1264c8", fontWeight: 600 }}>
              Sign In
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ResendVerification;
