import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../../api";
import {
  Shield,
  Users,
  Briefcase,
  Building2,
  FileText,
  UserX,
  UserCheck,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import LoadingSpinner from "../../components/LoadingSpinner";
import Alert from "../../components/Alert";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState("users"); // 'users', 'jobs', 'companies'

  // Users tab state
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [userRole, setUserRole] = useState("All");

  // Jobs tab state
  const [jobs, setJobs] = useState([]);
  const [jobSearch, setJobSearch] = useState("");

  // Companies tab state
  const [companies, setCompanies] = useState([]);

  const [loading, setLoading] = useState(true);
  const [alertInfo, setAlertInfo] = useState(null);

  useEffect(() => {
    adminApi
      .getStats()
      .then((res) => {
        if (res.success && res.stats) {
          setStats(res.stats);
        }
      })
      .catch((err) => console.error("Admin stats error:", err));
  }, []);

  // Fetch data depending on active tab
  useEffect(() => {
    setLoading(true);
    setAlertInfo(null);

    if (activeTab === "users") {
      const params = {};
      if (userSearch.trim()) params.search = userSearch.trim();
      if (userRole !== "All") params.role = userRole;

      adminApi
        .getUsers(params)
        .then((res) => {
          if (res.success) setUsers(res.users || []);
        })
        .finally(() => setLoading(false));
    } else if (activeTab === "jobs") {
      const params = {};
      if (jobSearch.trim()) params.search = jobSearch.trim();

      adminApi
        .getAllJobs(params)
        .then((res) => {
          if (res.success) setJobs(res.jobs || []);
        })
        .finally(() => setLoading(false));
    } else if (activeTab === "companies") {
      adminApi
        .getAllCompanies()
        .then((res) => {
          if (res.success) setCompanies(res.companies || []);
        })
        .finally(() => setLoading(false));
    }
  }, [activeTab, userRole]);

  const handleUserStatusToggle = async (userId, currentStatus) => {
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    try {
      const res = await adminApi.updateUserStatus(userId, newStatus);
      if (res.success) {
        setUsers(users.map((u) => (u._id === userId ? { ...u, status: newStatus } : u)));
        setAlertInfo({ type: "success", message: `User marked as '${newStatus}'` });
      }
    } catch (err) {
      setAlertInfo({ type: "error", message: err.message || "Failed to update user." });
    }
  };

  const handleJobModerate = async (jobId, newStatus) => {
    try {
      const res = await adminApi.moderateJob(jobId, newStatus);
      if (res.success) {
        setJobs(jobs.map((j) => (j._id === jobId ? { ...j, status: newStatus } : j)));
        setAlertInfo({ type: "success", message: `Job status updated to '${newStatus}'` });
      }
    } catch (err) {
      setAlertInfo({ type: "error", message: err.message || "Failed to moderate job." });
    }
  };

  const handleCompanyVerifyToggle = async (companyId) => {
    try {
      const res = await adminApi.toggleVerifyCompany(companyId);
      if (res.success) {
        setCompanies(
          companies.map((c) => (c._id === companyId ? { ...c, isVerified: res.company.isVerified } : c))
        );
        setAlertInfo({ type: "success", message: res.message || "Company verification updated." });
      }
    } catch (err) {
      setAlertInfo({ type: "error", message: err.message || "Failed to toggle verification." });
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="page-content" style={{ padding: "40px 0 80px" }}>
        <div className="container">
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "10px",
                background: "#eff6ff",
                border: "1px solid #bfdbfe",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Shield size={24} color="#1264c8" />
            </div>
            <div>
              <h1 style={{ fontSize: "26px", fontWeight: 800, color: "var(--hh-navy)", margin: 0 }}>
                Platform Administration
              </h1>
              <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
                Server-authorized management of users, job moderation, and verified companies.
              </p>
            </div>
          </div>

          {alertInfo && <Alert type={alertInfo.type} message={alertInfo.message} />}

          {/* Stats Cards */}
          {stats && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "18px",
                marginBottom: "32px",
              }}
            >
              <div className="card" style={{ padding: "20px" }}>
                <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>Total Accounts</span>
                <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--hh-navy)", margin: "4px 0" }}>
                  {stats.totalUsers}
                </div>
                <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                  {stats.totalCandidates} candidates, {stats.totalRecruiters} recruiters
                </span>
              </div>

              <div className="card" style={{ padding: "20px" }}>
                <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>Total Companies</span>
                <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--hh-navy)", margin: "4px 0" }}>
                  {stats.totalCompanies}
                </div>
                <span style={{ fontSize: "11px", color: "#94a3b8" }}>Registered organizations</span>
              </div>

              <div className="card" style={{ padding: "20px" }}>
                <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>Active Vacancies</span>
                <div style={{ fontSize: "28px", fontWeight: 800, color: "#059669", margin: "4px 0" }}>
                  {stats.publishedJobs}
                </div>
                <span style={{ fontSize: "11px", color: "#94a3b8" }}>Of {stats.totalJobs} total postings</span>
              </div>

              <div className="card" style={{ padding: "20px" }}>
                <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>Applications</span>
                <div style={{ fontSize: "28px", fontWeight: 800, color: "#7c3aed", margin: "4px 0" }}>
                  {stats.totalApplications}
                </div>
                <span style={{ fontSize: "11px", color: "#94a3b8" }}>Across all jobs</span>
              </div>
            </div>
          )}

          {/* Navigation Tabs */}
          <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--hh-border)", marginBottom: "24px" }}>
            <button
              onClick={() => setActiveTab("users")}
              style={{
                padding: "10px 18px",
                fontSize: "14px",
                fontWeight: 600,
                color: activeTab === "users" ? "var(--hh-primary)" : "#64748b",
                borderBottom: activeTab === "users" ? "2px solid var(--hh-primary)" : "none",
                background: "none",
                cursor: "pointer",
              }}
            >
              <Users size={16} style={{ display: "inline", verticalAlign: "middle", marginRight: "6px" }} />
              User Accounts
            </button>

            <button
              onClick={() => setActiveTab("jobs")}
              style={{
                padding: "10px 18px",
                fontSize: "14px",
                fontWeight: 600,
                color: activeTab === "jobs" ? "var(--hh-primary)" : "#64748b",
                borderBottom: activeTab === "jobs" ? "2px solid var(--hh-primary)" : "none",
                background: "none",
                cursor: "pointer",
              }}
            >
              <Briefcase size={16} style={{ display: "inline", verticalAlign: "middle", marginRight: "6px" }} />
              Job Moderation
            </button>

            <button
              onClick={() => setActiveTab("companies")}
              style={{
                padding: "10px 18px",
                fontSize: "14px",
                fontWeight: 600,
                color: activeTab === "companies" ? "var(--hh-primary)" : "#64748b",
                borderBottom: activeTab === "companies" ? "2px solid var(--hh-primary)" : "none",
                background: "none",
                cursor: "pointer",
              }}
            >
              <Building2 size={16} style={{ display: "inline", verticalAlign: "middle", marginRight: "6px" }} />
              Company Verification
            </button>
          </div>

          {/* Tab 1: User Management */}
          {activeTab === "users" && (
            <div className="card" style={{ padding: "24px" }}>
              <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: "220px" }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Search by name or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        adminApi.getUsers({ search: userSearch, role: userRole }).then((r) => setUsers(r.users || []));
                      }
                    }}
                  />
                  <button
                    onClick={() =>
                      adminApi.getUsers({ search: userSearch, role: userRole }).then((r) => setUsers(r.users || []))
                    }
                    className="btn btn-primary btn-sm"
                  >
                    Search
                  </button>
                </div>

                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                  className="form-select form-select-sm"
                  style={{ width: "160px" }}
                >
                  <option value="All">All Roles</option>
                  <option value="student">Candidate / Student</option>
                  <option value="recruiter">Recruiter</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              {loading ? (
                <LoadingSpinner text="Loading users..." />
              ) : (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>User Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Email Verified</th>
                        <th>Account Status</th>
                        <th>Joined</th>
                        <th style={{ textAlign: "right" }}>Moderation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u._id}>
                          <td><strong>{u.name}</strong></td>
                          <td>{u.email}</td>
                          <td>
                            <span className="badge badge-blue" style={{ textTransform: "capitalize" }}>
                              {u.role === "student" ? "Candidate" : u.role}
                            </span>
                          </td>
                          <td>
                            {u.isEmailVerified ? (
                              <span style={{ color: "#059669", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                <CheckCircle2 size={13} /> Verified
                              </span>
                            ) : (
                              <span style={{ color: "#d97706", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                <XCircle size={13} /> Unverified
                              </span>
                            )}
                          </td>
                          <td>
                            <span className={`badge ${u.status === "suspended" ? "badge-red" : "badge-green"}`}>
                              {u.status || "active"}
                            </span>
                          </td>
                          <td style={{ fontSize: "13px", color: "#64748b" }}>
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <button
                              type="button"
                              onClick={() => handleUserStatusToggle(u._id, u.status || "active")}
                              className={`btn btn-sm ${u.status === "suspended" ? "btn-primary" : "btn-danger"}`}
                            >
                              {u.status === "suspended" ? "Reactivate" : "Suspend"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Job Moderation */}
          {activeTab === "jobs" && (
            <div className="card" style={{ padding: "24px" }}>
              <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search job postings by title..."
                  value={jobSearch}
                  onChange={(e) => setJobSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      adminApi.getAllJobs({ search: jobSearch }).then((r) => setJobs(r.jobs || []));
                    }
                  }}
                />
                <button
                  onClick={() => adminApi.getAllJobs({ search: jobSearch }).then((r) => setJobs(r.jobs || []))}
                  className="btn btn-primary btn-sm"
                >
                  Search
                </button>
              </div>

              {loading ? (
                <LoadingSpinner text="Loading jobs..." />
              ) : (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Job Title</th>
                        <th>Company</th>
                        <th>Recruiter</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th style={{ textAlign: "right" }}>Moderate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobs.map((j) => (
                        <tr key={j._id}>
                          <td>
                            <Link to={`/jobs/${j._id}`} style={{ fontWeight: 700, color: "var(--hh-navy)" }}>
                              {j.title}
                            </Link>
                            <span style={{ display: "block", fontSize: "12px", color: "#64748b" }}>
                              {j.category} • {j.jobType}
                            </span>
                          </td>
                          <td>{j.company?.name || "Company"}</td>
                          <td>{j.recruiter?.name}</td>
                          <td>
                            <span className={`badge ${j.status === "published" ? "badge-green" : j.status === "draft" ? "badge-amber" : "badge-gray"}`}>
                              {j.status}
                            </span>
                          </td>
                          <td style={{ fontSize: "13px", color: "#64748b" }}>
                            {new Date(j.createdAt).toLocaleDateString()}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <select
                              value={j.status}
                              onChange={(e) => handleJobModerate(j._id, e.target.value)}
                              className="form-select form-select-sm"
                              style={{ width: "120px" }}
                            >
                              <option value="published">Published</option>
                              <option value="draft">Draft</option>
                              <option value="closed">Closed</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Company Verification */}
          {activeTab === "companies" && (
            <div className="card" style={{ padding: "24px" }}>
              {loading ? (
                <LoadingSpinner text="Loading companies..." />
              ) : (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Company Name</th>
                        <th>Industry</th>
                        <th>Location</th>
                        <th>Owner</th>
                        <th>Verification Status</th>
                        <th style={{ textAlign: "right" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {companies.map((c) => (
                        <tr key={c._id}>
                          <td>
                            <strong>{c.name}</strong>
                          </td>
                          <td>{c.industry}</td>
                          <td>{c.location || "Remote"}</td>
                          <td>{c.owner?.name} ({c.owner?.email})</td>
                          <td>
                            <span className={`badge ${c.isVerified ? "badge-green" : "badge-amber"}`}>
                              {c.isVerified ? "Verified" : "Pending Verification"}
                            </span>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <button
                              type="button"
                              onClick={() => handleCompanyVerifyToggle(c._id)}
                              className={`btn btn-sm ${c.isVerified ? "btn-secondary" : "btn-primary"}`}
                            >
                              {c.isVerified ? "Revoke Approval" : "Approve Company"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
