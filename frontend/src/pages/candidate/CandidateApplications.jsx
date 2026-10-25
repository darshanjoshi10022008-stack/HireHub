import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { applicationApi } from "../../api";
import {
  Briefcase,
  Building2,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Eye,
  FileText,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import LoadingSpinner from "../../components/LoadingSpinner";
import Modal from "../../components/Modal";
import Alert from "../../components/Alert";

const CandidateApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertInfo, setAlertInfo] = useState(null);

  // Withdraw state
  const [selectedApp, setSelectedApp] = useState(null);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  const fetchApplications = async () => {
    try {
      const res = await applicationApi.getMyApplications();
      if (res.success) {
        setApplications(res.applications || []);
      }
    } catch (err) {
      console.error("Fetch applications error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleWithdrawClick = (app) => {
    setSelectedApp(app);
    setIsWithdrawOpen(true);
  };

  const handleConfirmWithdraw = async () => {
    if (!selectedApp) return;

    setWithdrawing(true);
    setAlertInfo(null);

    try {
      const res = await applicationApi.withdrawApplication(selectedApp._id);
      if (res.success) {
        setApplications(applications.filter((a) => a._id !== selectedApp._id));
        setAlertInfo({ type: "success", message: "Application has been successfully withdrawn." });
        setIsWithdrawOpen(false);
      }
    } catch (err) {
      setAlertInfo({ type: "error", message: err.message || "Failed to withdraw application." });
    } finally {
      setWithdrawing(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Shortlisted":
        return <span className="badge badge-green">Shortlisted</span>;
      case "Interview":
        return <span className="badge badge-blue">Interview Scheduled</span>;
      case "Under Review":
        return <span className="badge badge-amber">Under Review</span>;
      case "Hired":
        return <span className="badge badge-green">🎉 Offer / Hired</span>;
      case "Rejected":
        return <span className="badge badge-red">Not Selected</span>;
      default:
        return <span className="badge badge-gray">Application Submitted</span>;
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="page-content" style={{ padding: "40px 0 80px" }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h1 style={{ fontSize: "26px", fontWeight: 800, color: "var(--hh-navy)", margin: "0 0 4px" }}>
                My Job Applications
              </h1>
              <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
                Real-time tracking for every job you've applied to on HireHub.
              </p>
            </div>
            <Link to="/jobs" className="btn btn-primary btn-sm">
              Discover More Roles
            </Link>
          </div>

          {alertInfo && <Alert type={alertInfo.type} message={alertInfo.message} />}

          {loading ? (
            <LoadingSpinner text="Fetching your submitted applications..." />
          ) : applications.length === 0 ? (
            <div className="card text-center" style={{ padding: "60px 20px" }}>
              <Briefcase size={44} color="#94a3b8" style={{ margin: "0 auto 16px" }} />
              <h3 style={{ fontSize: "18px", color: "var(--hh-navy)", marginBottom: "8px" }}>
                No active applications found
              </h3>
              <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "20px" }}>
                You have not submitted any job applications yet.
              </p>
              <Link to="/jobs" className="btn btn-primary btn-sm">
                Explore Verified Job Openings
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {applications.map((app) => (
                <div key={app._id} className="card" style={{ padding: "24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap", marginBottom: "16px" }}>
                    <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                      <div
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "8px",
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden",
                        }}
                      >
                        {app.company?.logo ? (
                          <img src={app.company.logo} alt={app.company.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <Building2 size={24} color="#1264c8" />
                        )}
                      </div>

                      <div>
                        <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 4px" }}>
                          <Link to={`/jobs/${app.job?._id}`} style={{ color: "var(--hh-navy)" }}>
                            {app.job?.title || "Position Archived"}
                          </Link>
                        </h3>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#64748b" }}>
                          <span>{app.company?.name}</span>
                          <span>•</span>
                          <span><MapPin size={12} style={{ display: "inline" }} /> {app.job?.location}</span>
                          <span>•</span>
                          <span>Applied on {new Date(app.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      {getStatusBadge(app.status)}

                      {["Applied", "Under Review"].includes(app.status) && (
                        <button
                          type="button"
                          onClick={() => handleWithdrawClick(app)}
                          style={{
                            color: "#ef4444",
                            background: "#fef2f2",
                            border: "1px solid #fecaca",
                            borderRadius: "6px",
                            padding: "6px 10px",
                            fontSize: "12px",
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            cursor: "pointer",
                          }}
                          title="Withdraw Application"
                        >
                          <Trash2 size={13} /> Withdraw
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Recruiter Feedback / Notes if available */}
                  {app.recruiterNotes && (
                    <div style={{ padding: "12px 16px", background: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0", marginBottom: "16px", fontSize: "13px" }}>
                      <strong style={{ color: "var(--hh-navy)" }}>Note from Employer: </strong>
                      <span style={{ color: "#475569" }}>{app.recruiterNotes}</span>
                    </div>
                  )}

                  {/* Status Timeline History */}
                  {app.statusHistory && app.statusHistory.length > 0 && (
                    <div style={{ marginTop: "14px", paddingTop: "14px", borderTop: "1px solid #f1f5f9" }}>
                      <span style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.5px" }}>
                        Application Timeline
                      </span>
                      <div style={{ display: "flex", gap: "20px", marginTop: "8px", flexWrap: "wrap" }}>
                        {app.statusHistory.map((h, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#475569" }}>
                            <CheckCircle2 size={14} color="#10b981" />
                            <strong>{h.status}</strong>
                            <span style={{ color: "#94a3b8" }}>({new Date(h.changedAt).toLocaleDateString()})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Withdraw Confirmation Modal */}
      <Modal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        title="Withdraw Job Application?"
      >
        <p style={{ color: "#475569", fontSize: "14px", lineHeight: "1.6", marginBottom: "20px" }}>
          Are you sure you want to withdraw your application for{" "}
          <strong>{selectedApp?.job?.title}</strong> at{" "}
          <strong>{selectedApp?.company?.name}</strong>? This action cannot be undone.
        </p>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setIsWithdrawOpen(false)}
            disabled={withdrawing}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleConfirmWithdraw}
            disabled={withdrawing}
          >
            {withdrawing ? "Withdrawing..." : "Confirm Withdrawal"}
          </button>
        </div>
      </Modal>

      <Footer />
    </div>
  );
};

export default CandidateApplications;
