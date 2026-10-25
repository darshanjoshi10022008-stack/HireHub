import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { authApi } from "../../api";
import { useAuth } from "../../context/AuthContext";
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Mail,
  ShieldCheck,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const VerifyEmail = () => {
  const { token } = useParams();
  const { user, setAuthData, refreshUser } = useAuth();
  // Status states: 'verifying' | 'success' | 'expired' | 'invalid' | 'server-error'
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");
  const [associatedEmail, setAssociatedEmail] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const performVerification = async () => {
      if (!token || !token.trim()) {
        setStatus("invalid");
        setMessage("No verification token was provided in the link.");
        return;
      }

      setStatus("verifying");

      try {
        const res = await authApi.verifyEmail(token.trim());

        if (!isMounted) return;

        if (res.success) {
          setStatus("success");
          setMessage(res.message || "Your email address has been successfully verified!");

          // Automatically authenticate user if session token returned
          if (res.token && res.user && setAuthData) {
            setAuthData({ token: res.token, user: res.user });
          } else if (user && refreshUser) {
            refreshUser();
          }
        } else {
          setStatus("invalid");
          setMessage(res.message || "Failed to verify email address.");
        }
      } catch (err) {
        if (!isMounted) return;

        console.error("Verification endpoint error:", err);

        const code = err.code || err.data?.code;
        const errMsg = err.message || "Verification request failed.";

        if (err.data?.email) {
          setAssociatedEmail(err.data.email);
        }

        if (code === "EXPIRED_TOKEN" || errMsg.toLowerCase().includes("expired")) {
          setStatus("expired");
          setMessage(
            errMsg || "This verification link has expired. Verification links are active for 24 hours."
          );
        } else if (
          code === "INVALID_TOKEN" ||
          errMsg.toLowerCase().includes("invalid") ||
          errMsg.toLowerCase().includes("already been used")
        ) {
          setStatus("invalid");
          setMessage(
            errMsg || "This verification link is invalid or has already been used to verify an account."
          );
        } else if (err.status >= 500 || err.status === 0 || !err.status) {
          setStatus("server-error");
          setMessage(
            "We were unable to communicate with the verification server. Please verify your internet connection or try again."
          );
        } else {
          setStatus("invalid");
          setMessage(errMsg);
        }
      }
    };

    performVerification();

    return () => {
      isMounted = false;
    };
  }, [token, retryCount]);

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
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
            maxWidth: "520px",
            width: "100%",
            textAlign: "center",
            padding: "44px 32px",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
          }}
        >
          {/* STATE 1: VERIFYING / LOADING */}
          {status === "verifying" && (
            <div>
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  border: "4px solid #e2e8f0",
                  borderTopColor: "#1264c8",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                  margin: "0 auto 24px",
                }}
              />
              <h2 style={{ fontSize: "22px", color: "#0b2749", marginBottom: "8px", fontWeight: 700 }}>
                Verifying your email...
              </h2>
              <p style={{ color: "#64748b", fontSize: "14px", lineHeight: 1.6, margin: 0 }}>
                Please wait while we validate your secure token with HireHub security servers.
              </p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {/* STATE 2: SUCCESS */}
          {status === "success" && (
            <div>
              <div
                style={{
                  width: "68px",
                  height: "68px",
                  borderRadius: "50%",
                  background: "#ecfdf5",
                  border: "2px solid #a7f3d0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                }}
              >
                <CheckCircle2 size={38} color="#059669" />
              </div>
              <h2 style={{ fontSize: "24px", color: "#065f46", marginBottom: "10px", fontWeight: 700 }}>
                Email Verified!
              </h2>
              <p style={{ color: "#475569", fontSize: "15px", lineHeight: "1.6", marginBottom: "28px" }}>
                {message}
              </p>

              <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                {user ? (
                  <Link
                    to={user.role === "recruiter" ? "/recruiter/dashboard" : "/candidate/dashboard"}
                    className="btn btn-primary"
                    style={{ padding: "10px 24px", fontSize: "15px", display: "inline-flex", alignItems: "center", gap: "8px" }}
                  >
                    <span>Proceed to Dashboard</span>
                    <ArrowRight size={16} />
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="btn btn-primary"
                    style={{ padding: "10px 24px", fontSize: "15px", display: "inline-flex", alignItems: "center", gap: "8px" }}
                  >
                    <span>Sign In to Your Account</span>
                    <ArrowRight size={16} />
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* STATE 3: EXPIRED TOKEN */}
          {status === "expired" && (
            <div>
              <div
                style={{
                  width: "68px",
                  height: "68px",
                  borderRadius: "50%",
                  background: "#fffbeb",
                  border: "2px solid #fde68a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                }}
              >
                <Clock size={36} color="#d97706" />
              </div>
              <h2 style={{ fontSize: "22px", color: "#92400e", marginBottom: "10px", fontWeight: 700 }}>
                Verification Link Expired
              </h2>
              <p style={{ color: "#64748b", fontSize: "14px", lineHeight: "1.6", marginBottom: "24px" }}>
                {message} Security tokens expire after 24 hours to protect your account.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
                <Link
                  to="/resend-verification"
                  state={{ email: associatedEmail }}
                  className="btn btn-primary"
                  style={{ width: "100%", justifyContent: "center", display: "inline-flex", alignItems: "center", gap: "8px" }}
                >
                  <RefreshCw size={15} />
                  <span>Request Fresh Verification Link</span>
                </Link>
                <Link
                  to="/login"
                  className="btn btn-secondary"
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  Return to Sign In
                </Link>
              </div>
            </div>
          )}

          {/* STATE 4: INVALID OR USED TOKEN */}
          {status === "invalid" && (
            <div>
              <div
                style={{
                  width: "68px",
                  height: "68px",
                  borderRadius: "50%",
                  background: "#fef2f2",
                  border: "2px solid #fecaca",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                }}
              >
                <XCircle size={36} color="#dc2626" />
              </div>
              <h2 style={{ fontSize: "22px", color: "#991b1b", marginBottom: "10px", fontWeight: 700 }}>
                Invalid Verification Link
              </h2>
              <p style={{ color: "#64748b", fontSize: "14px", lineHeight: "1.6", marginBottom: "24px" }}>
                {message}
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
                <Link
                  to="/resend-verification"
                  className="btn btn-primary"
                  style={{ width: "100%", justifyContent: "center", display: "inline-flex", alignItems: "center", gap: "8px" }}
                >
                  <Mail size={15} />
                  <span>Request New Verification Email</span>
                </Link>
                <Link
                  to="/login"
                  className="btn btn-secondary"
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  Go to Sign In
                </Link>
              </div>
            </div>
          )}

          {/* STATE 5: SERVER ERROR */}
          {status === "server-error" && (
            <div>
              <div
                style={{
                  width: "68px",
                  height: "68px",
                  borderRadius: "50%",
                  background: "#f8fafc",
                  border: "2px solid #cbd5e1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                }}
              >
                <AlertTriangle size={36} color="#475569" />
              </div>
              <h2 style={{ fontSize: "22px", color: "#1e293b", marginBottom: "10px", fontWeight: 700 }}>
                Verification Service Unavailable
              </h2>
              <p style={{ color: "#64748b", fontSize: "14px", lineHeight: "1.6", marginBottom: "24px" }}>
                {message}
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
                <button
                  type="button"
                  onClick={handleRetry}
                  className="btn btn-primary"
                  style={{ width: "100%", justifyContent: "center", display: "inline-flex", alignItems: "center", gap: "8px" }}
                >
                  <RefreshCw size={15} />
                  <span>Retry Verification</span>
                </button>
                <Link
                  to="/login"
                  className="btn btn-secondary"
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  Back to Sign In
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default VerifyEmail;
