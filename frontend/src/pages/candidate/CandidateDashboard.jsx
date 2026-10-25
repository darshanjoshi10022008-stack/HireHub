import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { candidateApi } from "../../api";
import {
  FileText,
  Bookmark,
  CheckCircle2,
  Clock,
  Briefcase,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  UserCheck,
  Building2,
  MapPin,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import LoadingSpinner from "../../components/LoadingSpinner";
import Alert from "../../components/Alert";

const CandidateDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await candidateApi.getDashboardStats();
        if (res.success && res.stats) {
          setStats(res.stats);
        }
      } catch (err) {
        console.error("Fetch candidate stats error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="page-content" style={{ padding: "40px 0 80px" }}>
        <div className="container">
          {/* Email verification reminder if unverified */}
          {user && !user.isEmailVerified && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 20px",
                background: "#fffbeb",
                border: "1px solid #fde68a",
                borderRadius: "8px",
                marginBottom: "24px",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <AlertTriangle size={20} color="#d97706" />
                <div>
                  <strong style={{ color: "#92400e", fontSize: "14px", display: "block" }}>
                    Your email address is pending verification
                  </strong>
                  <span style={{ color: "#b45309", fontSize: "13px" }}>
                    Please verify your email to ensure uninterrupted application notifications from recruiters.
                  </span>
                </div>
              </div>
              <Link to="/resend-verification" className="btn btn-primary btn-sm">
                Resend Verification Link
              </Link>
            </div>
          )}

          {/* Welcome Banner */}
          <div
            className="card"
            style={{
              padding: "28px 32px",
              background: "linear-gradient(135deg, #0b2749 0%, #1264c8 100%)",
              color: "#ffffff",
              marginBottom: "28px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "20px",
            }}
          >
            <div>
              <span style={{ fontSize: "12px", letterSpacing: "1px", textTransform: "uppercase", color: "#93c5fd", fontWeight: 700 }}>
                CANDIDATE DASHBOARD
              </span>
              <h1 style={{ fontSize: "28px", fontWeight: 800, margin: "6px 0 8px", color: "#ffffff" }}>
                Welcome, {user?.name}!
              </h1>
              <p style={{ color: "#e2e8f0", fontSize: "14px", maxWidth: "600px", margin: 0 }}>
                Track your active job applications, manage your resume profile, and discover personalized career matches.
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <Link to="/jobs" className="btn btn-secondary btn-sm" style={{ backgroundColor: "#ffffff", color: "#0b2749" }}>
                Browse Openings
              </Link>
              <Link to="/candidate/profile" className="btn btn-primary btn-sm" style={{ backgroundColor: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.4)" }}>
                Edit Profile
              </Link>
            </div>
          </div>

          {loading ? (
            <LoadingSpinner text="Loading your dashboard..." />
          ) : (
            <>
              {/* Profile Completion Bar */}
              <div className="card" style={{ padding: "20px 24px", marginBottom: "28px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <UserCheck size={18} color="#1264c8" />
                    <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--hh-navy)" }}>
                      Profile Strength
                    </span>
                  </div>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "#1264c8" }}>
                    {stats?.profileCompletion || 0}% Complete
                  </span>
                </div>

                <div style={{ width: "100%", height: "8px", background: "#f1f5f9", borderRadius: "4px", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${stats?.profileCompletion || 0}%`,
                      height: "100%",
                      background: "linear-gradient(90deg, #1264c8, #10b981)",
                      borderRadius: "4px",
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>

                {stats?.profileCompletion < 100 && (
                  <p style={{ fontSize: "12px", color: "#64748b", marginTop: "8px", margin: "8px 0 0" }}>
                    Add your headline, skills, work experience, and upload a resume to reach 100% and rank higher with recruiters.{" "}
                    <Link to="/candidate/profile" style={{ color: "#1264c8", fontWeight: 600 }}>
                      Complete Profile →
                    </Link>
                  </p>
                )}
              </div>

              {/* Real Stats Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "20px",
                  marginBottom: "36px",
                }}
              >
                <div className="card" style={{ padding: "22px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b", marginBottom: "8px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 600 }}>Total Applied</span>
                    <Briefcase size={18} color="#1264c8" />
                  </div>
                  <div style={{ fontSize: "30px", fontWeight: 800, color: "var(--hh-navy)" }}>
                    {stats?.totalApplications || 0}
                  </div>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>Submitted applications</span>
                </div>

                <div className="card" style={{ padding: "22px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b", marginBottom: "8px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 600 }}>Under Review</span>
                    <Clock size={18} color="#f59e0b" />
                  </div>
                  <div style={{ fontSize: "30px", fontWeight: 800, color: "#d97706" }}>
                    {stats?.underReview || 0}
                  </div>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>Being reviewed by teams</span>
                </div>

                <div className="card" style={{ padding: "22px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b", marginBottom: "8px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 600 }}>Shortlisted</span>
                    <TrendingUp size={18} color="#059669" />
                  </div>
                  <div style={{ fontSize: "30px", fontWeight: 800, color: "#059669" }}>
                    {stats?.shortlisted || 0}
                  </div>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>Advanced to next stage</span>
                </div>

                <div className="card" style={{ padding: "22px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b", marginBottom: "8px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 600 }}>Saved Bookmarks</span>
                    <Bookmark size={18} color="#7c3aed" />
                  </div>
                  <div style={{ fontSize: "30px", fontWeight: 800, color: "#7c3aed" }}>
                    {stats?.savedJobsCount || 0}
                  </div>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>Saved for later</span>
                </div>
              </div>

              {/* Recent Applications Section */}
              <div className="card" style={{ padding: "28px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <div>
                    <h3 style={{ fontSize: "18px", color: "var(--hh-navy)", fontWeight: 700, margin: "0 0 4px" }}>
                      Recent Job Applications
                    </h3>
                    <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>
                      Live status updates on your submitted applications.
                    </p>
                  </div>
                  <Link to="/candidate/applications" className="btn btn-secondary btn-sm">
                    View All Applications
                  </Link>
                </div>

                {stats?.recentApplications && stats.recentApplications.length > 0 ? (
                  <div className="table-container">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Job Position</th>
                          <th>Company</th>
                          <th>Applied Date</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recentApplications.map((app) => (
                          <tr key={app._id}>
                            <td>
                              <strong style={{ color: "var(--hh-navy)" }}>
                                {app.job?.title || "Position Filled / Archived"}
                              </strong>
                              <span style={{ display: "block", fontSize: "12px", color: "#64748b" }}>
                                {app.job?.location}
                              </span>
                            </td>
                            <td>{app.company?.name || "Company"}</td>
                            <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                            <td>
                              <span
                                className={`badge ${
                                  app.status === "Shortlisted"
                                    ? "badge-green"
                                    : app.status === "Interview"
                                    ? "badge-blue"
                                    : app.status === "Under Review"
                                    ? "badge-amber"
                                    : app.status === "Rejected"
                                    ? "badge-red"
                                    : "badge-gray"
                                }`}
                              >
                                {app.status}
                              </span>
                            </td>
                            <td>
                              {app.job?._id && (
                                <Link to={`/jobs/${app.job._id}`} className="btn btn-secondary btn-sm">
                                  View Job
                                </Link>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748b" }}>
                    <Briefcase size={36} color="#94a3b8" style={{ margin: "0 auto 12px" }} />
                    <h4 style={{ color: "#0b2749", marginBottom: "6px" }}>No applications submitted yet</h4>
                    <p style={{ fontSize: "14px", marginBottom: "18px" }}>
                      Start discovering opportunities that match your skill set.
                    </p>
                    <Link to="/jobs" className="btn btn-primary btn-sm">
                      Browse Jobs
                    </Link>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CandidateDashboard;
