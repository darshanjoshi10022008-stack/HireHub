import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { applicationApi, jobApi } from "../../api";
import {
  Users,
  Briefcase,
  FileText,
  Download,
  CheckCircle2,
  Filter,
  MessageSquare,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import LoadingSpinner from "../../components/LoadingSpinner";
import Modal from "../../components/Modal";
import Alert from "../../components/Alert";

const RecruiterApplications = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialJobId = searchParams.get("jobId") || "All";

  const [applications, setApplications] = useState([]);
  const [recruiterJobs, setRecruiterJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(initialJobId);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [loading, setLoading] = useState(true);
  const [alertInfo, setAlertInfo] = useState(null);

  // Status Note Modal
  const [activeApp, setActiveApp] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [recruiterNote, setRecruiterNote] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    jobApi.getRecruiterJobs().then((res) => {
      if (res.success) {
        setRecruiterJobs(res.jobs || []);
      }
    });
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedJobId !== "All") params.jobId = selectedJobId;
      if (selectedStatus !== "All") params.status = selectedStatus;

      const res = await applicationApi.getRecruiterApplications(params);
      if (res.success) {
        setApplications(res.applications || []);
      }
    } catch (err) {
      console.error("Fetch recruiter applications error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [selectedJobId, selectedStatus]);

  const handleOpenStatusModal = (app, status) => {
    setActiveApp(app);
    setNewStatus(status);
    setRecruiterNote(app.recruiterNotes || "");
    setIsModalOpen(true);
  };

  const handleUpdateStatusSubmit = async (e) => {
    e.preventDefault();
    if (!activeApp || !newStatus) return;

    setUpdating(true);
    try {
      const res = await applicationApi.updateStatus(activeApp._id, newStatus, recruiterNote);
      if (res.success) {
        setApplications(
          applications.map((a) =>
            a._id === activeApp._id
              ? { ...a, status: newStatus, recruiterNotes: recruiterNote }
              : a
          )
        );
        setAlertInfo({
          type: "success",
          message: `Candidate status updated to '${newStatus}'!`,
        });
        setIsModalOpen(false);
      }
    } catch (err) {
      setAlertInfo({
        type: "error",
        message: err.message || "Failed to update candidate status.",
      });
    } finally {
      setUpdating(false);
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
                Candidate Applications Review
              </h1>
              <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
                Review candidate profiles, inspect uploaded resumes, and progress applicants through hiring rounds.
              </p>
            </div>
            <Link to="/recruiter/dashboard" className="btn btn-secondary btn-sm">
              Recruiter Hub
            </Link>
          </div>

          {alertInfo && <Alert type={alertInfo.type} message={alertInfo.message} />}

          {/* Filter Bar */}
          <div className="card" style={{ padding: "16px 20px", marginBottom: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Filter size={16} color="#1264c8" />
                <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--hh-navy)" }}>Filter by:</span>
              </div>

              <div style={{ minWidth: "220px" }}>
                <select
                  value={selectedJobId}
                  onChange={(e) => {
                    setSelectedJobId(e.target.value);
                    setSearchParams({ jobId: e.target.value });
                  }}
                  className="form-select form-select-sm"
                >
                  <option value="All">All Job Openings ({recruiterJobs.length})</option>
                  {recruiterJobs.map((j) => (
                    <option key={j._id} value={j._id}>
                      {j.title}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ minWidth: "160px" }}>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="form-select form-select-sm"
                >
                  <option value="All">All Statuses</option>
                  <option value="Applied">Applied</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Interview">Interview</option>
                  <option value="Hired">Hired</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          {/* Candidates List */}
          {loading ? (
            <LoadingSpinner text="Loading applicant profiles..." />
          ) : applications.length === 0 ? (
            <div className="card text-center" style={{ padding: "60px 20px" }}>
              <Users size={44} color="#94a3b8" style={{ margin: "0 auto 16px" }} />
              <h3 style={{ fontSize: "18px", color: "var(--hh-navy)", marginBottom: "8px" }}>
                No candidate applications match your filters
              </h3>
              <p style={{ color: "#64748b", fontSize: "14px" }}>
                Select a different job or reset status filters to view all applicants.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {applications.map((app) => (
                <div key={app._id} className="card" style={{ padding: "28px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap", marginBottom: "16px" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--hh-navy)", margin: 0 }}>
                          {app.candidate?.name || "Candidate Name"}
                        </h3>
                        {app.candidate?.isEmailVerified && (
                          <span className="badge badge-green" style={{ fontSize: "11px" }}>
                            <ShieldCheck size={12} /> Verified Email
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "6px" }}>
                        {app.candidate?.email}
                        {app.candidateProfile?.phone ? ` • ${app.candidateProfile.phone}` : ""}
                        {app.candidateProfile?.location ? ` • ${app.candidateProfile.location}` : ""}
                      </div>

                      {app.candidateProfile?.headline && (
                        <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--hh-primary)" }}>
                          {app.candidateProfile.headline}
                        </div>
                      )}
                    </div>

                    {/* Status Changer & Resume Download */}
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                      {app.resume?.url && (
                        <a
                          href={app.resume.url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="btn btn-secondary btn-sm"
                          style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                        >
                          <Download size={14} /> Download Resume
                        </a>
                      )}

                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>Status:</span>
                        <select
                          value={app.status}
                          onChange={(e) => handleOpenStatusModal(app, e.target.value)}
                          className="form-select form-select-sm"
                          style={{ width: "140px", fontWeight: 600 }}
                        >
                          <option value="Applied">Applied</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Shortlisted">Shortlisted</option>
                          <option value="Interview">Interview</option>
                          <option value="Hired">Hired</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Applied Position Badge */}
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 12px", background: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0", marginBottom: "16px", fontSize: "13px" }}>
                    <Briefcase size={14} color="#1264c8" />
                    <span>Applied for: <strong>{app.job?.title}</strong></span>
                    <span style={{ color: "#94a3b8" }}>({new Date(app.createdAt).toLocaleDateString()})</span>
                  </div>

                  {/* Cover Note Pitch */}
                  {app.coverNote && (
                    <div style={{ padding: "14px 16px", background: "#eff6ff", borderRadius: "8px", border: "1px solid #bfdbfe", marginBottom: "16px" }}>
                      <strong style={{ fontSize: "12px", textTransform: "uppercase", color: "#1e3a8a", display: "block", marginBottom: "4px" }}>
                        Candidate Pitch / Note:
                      </strong>
                      <p style={{ color: "#1e293b", fontSize: "13px", lineHeight: "1.6", margin: 0 }}>
                        {app.coverNote}
                      </p>
                    </div>
                  )}

                  {/* Skills tags */}
                  {app.candidateProfile?.skills && app.candidateProfile.skills.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "12px" }}>
                      {app.candidateProfile.skills.map((skill, idx) => (
                        <span key={idx} className="skill-pill">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Recruiter Private Notes */}
                  {app.recruiterNotes && (
                    <div style={{ fontSize: "12px", color: "#475569", paddingTop: "10px", borderTop: "1px solid #f1f5f9" }}>
                      <strong>Your Internal Note: </strong> {app.recruiterNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Status & Feedback Note Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Update Status: ${activeApp?.candidate?.name}`}
      >
        <form onSubmit={handleUpdateStatusSubmit}>
          <div style={{ marginBottom: "16px" }}>
            <span style={{ fontSize: "14px", color: "#64748b" }}>
              Advancing candidate to: <strong style={{ color: "var(--hh-navy)" }}>{newStatus}</strong>
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">
              Internal / Feedback Note (Optional)
            </label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="e.g. Cleared technical screening; scheduled for system design round on Monday..."
              value={recruiterNote}
              onChange={(e) => setRecruiterNote(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={updating}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={updating}>
              {updating ? "Saving..." : "Confirm Status Change"}
            </button>
          </div>
        </form>
      </Modal>

      <Footer />
    </div>
  );
};

export default RecruiterApplications;
