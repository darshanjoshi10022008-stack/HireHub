import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { authApi } from "../../api";
import { Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Alert from "../../components/Alert";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alertInfo, setAlertInfo] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlertInfo(null);

    if (password.length < 8) {
      setAlertInfo({ type: "error", message: "Password must be at least 8 characters long." });
      return;
    }

    if (password !== confirmPassword) {
      setAlertInfo({ type: "error", message: "Passwords do not match." });
      return;
    }

    setLoading(true);

    try {
      const res = await authApi.resetPassword(token, { password });
      setIsSuccess(true);
      setAlertInfo({
        type: "success",
        message: res.message || "Your password has been successfully updated. You may now log in.",
      });
    } catch (err) {
      setAlertInfo({
        type: "error",
        message: err.message || "Password reset token is invalid or has expired.",
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
              <Lock size={24} color="#1264c8" />
            </div>
            <h1 style={{ fontSize: "24px", color: "#0b2749", margin: "0 0 8px" }}>
              Set New Password
            </h1>
            <p style={{ color: "#64748b", fontSize: "14px" }}>
              Choose a strong password containing at least 8 characters.
            </p>
          </div>

          {alertInfo && <Alert type={alertInfo.type} message={alertInfo.message} />}

          {isSuccess ? (
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <Link to="/login" className="btn btn-primary" style={{ width: "100%" }}>
                Go to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-input"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={8}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "8px" }} disabled={loading}>
                {loading ? "Updating password..." : "Update Password"}
              </button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ResetPassword;
