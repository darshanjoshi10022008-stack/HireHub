import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { authApi } from "../../api";
import {
  Lock,
  Mail,
  ShieldCheck,
  AlertTriangle,
  Eye,
  EyeOff,
  Save,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Alert from "../../components/Alert";

const CandidateSettings = () => {
  const { user } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alertInfo, setAlertInfo] = useState(null);

  const [resending, setResending] = useState(false);
  const [verifyAlert, setVerifyAlert] = useState(null);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setAlertInfo(null);

    if (newPassword.length < 8) {
      setAlertInfo({ type: "error", message: "New password must be at least 8 characters long." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setAlertInfo({ type: "error", message: "New passwords do not match." });
      return;
    }

    setLoading(true);

    try {
      const res = await authApi.updatePassword({ currentPassword, newPassword });
      setAlertInfo({ type: "success", message: res.message || "Password updated successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setAlertInfo({ type: "error", message: err.message || "Failed to update password." });
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setResending(true);
    setVerifyAlert(null);
    try {
      const res = await authApi.resendVerification({ email: user?.email });
      setVerifyAlert({
        type: "success",
        message: res.message || "Verification email sent. Please check your inbox.",
      });
    } catch (err) {
      setVerifyAlert({
        type: "error",
        message: err.message || "Failed to send verification email.",
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="page-content" style={{ padding: "40px 0 80px" }}>
        <div className="container" style={{ maxWidth: "680px" }}>
          <h1 style={{ fontSize: "26px", fontWeight: 800, color: "var(--hh-navy)", marginBottom: "6px" }}>
            Account Security & Settings
          </h1>
          <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "28px" }}>
            Manage your login credentials, email verification status, and security preferences.
          </p>

          {/* Email Verification Status Card */}
          <div className="card" style={{ padding: "24px", marginBottom: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <Mail size={20} color="#1264c8" />
              <h3 style={{ fontSize: "17px", fontWeight: 700, color: "var(--hh-navy)", margin: 0 }}>
                Email Verification Status
              </h3>
            </div>

            {verifyAlert && <Alert type={verifyAlert.type} message={verifyAlert.message} />}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <div style={{ fontSize: "14px", color: "var(--hh-navy)", fontWeight: 600 }}>
                  {user?.email}
                </div>
                <div style={{ marginTop: "4px" }}>
                  {user?.isEmailVerified ? (
                    <span className="badge badge-green">
                      <ShieldCheck size={13} /> Email Verified
                    </span>
                  ) : (
                    <span className="badge badge-amber">
                      <AlertTriangle size={13} /> Verification Pending
                    </span>
                  )}
                </div>
              </div>

              {!user?.isEmailVerified && (
                <button
                  type="button"
                  onClick={handleResendEmail}
                  className="btn btn-secondary btn-sm"
                  disabled={resending}
                >
                  {resending ? "Sending..." : "Send Verification Email"}
                </button>
              )}
            </div>
          </div>

          {/* Change Password Card */}
          <div className="card" style={{ padding: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
              <Lock size={20} color="#1264c8" />
              <h3 style={{ fontSize: "17px", fontWeight: 700, color: "var(--hh-navy)", margin: 0 }}>
                Change Password
              </h3>
            </div>

            {alertInfo && <Alert type={alertInfo.type} message={alertInfo.message} />}

            <form onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Password (minimum 8 characters)</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-input"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
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

              <button type="submit" className="btn btn-primary" style={{ marginTop: "8px" }} disabled={loading}>
                <Save size={16} />
                <span>{loading ? "Updating..." : "Update Password"}</span>
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CandidateSettings;
