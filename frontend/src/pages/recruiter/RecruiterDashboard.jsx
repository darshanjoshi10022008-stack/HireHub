import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { jobApi, applicationApi, companyApi } from "../../api";
import {
  Briefcase,
  Users,
  CheckCircle2,
  TrendingUp,
  PlusCircle,
  Building2,
  FileText,
  Clock,
  ArrowRight,
  Eye,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import LoadingSpinner from "../../components/LoadingSpinner";

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [jobsRes, appsRes, compRes] = await Promise.all([
          jobApi.getRecruiterJobs(),
          applicationApi.getRecruiterApplications({ limit: 8 }),
          companyApi.getMyCompany(),
        ]);

        if (jobsRes.success) setJobs(jobsRes.jobs || []);
        if (appsRes.success) setApplications(appsRes.applications || []);
        if (compRes.success) setCompany(compRes.company);
      } catch (err) {
        console.error("Recruiter dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const totalViews = jobs.reduce((acc, j) => acc + (j.viewsCount || 0), 0);
  const totalAppsCount = jobs.reduce((acc, j) => acc + (j.applicationsCount || 0), 0);
  const publishedJobsCount = jobs.filter((j) => j.status === "published").length;

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="page-content" style={{ padding: "40px 0 80px" }}>
        <div className="container">
          {/* Welcome Banner */}
          <div
            className="card"
            style={{
              padding: "28px 32px",
              background: "linear-gradient(135deg, #071a34 0%, #0b2749 60%, #1264c8 100%)",
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
              <span style={{ fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase", color: "#93c5fd", fontWeight: 700 }}>
                EMPLOYER HIRING SUITE
              </span>
              <h1 style={{ fontSize: "28px", fontWeight: 800, margin: "6px 0 8px", color: "#ffffff" }}>
                {company?.name ? `${company.name} Talent Hub` : "Recruiter Dashboard"}
              </h1>
              <p style={{ color: "#e2e8f0", fontSize: "14px", maxWidth: "600px", margin: 0 }}>
                Manage live vacancies, review applicant resumes, and advance candidates through your interview pipeline.
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <Link to="/recruiter/jobs/new" className="btn btn-primary" style={{ backgroundColor: "#1264c8" }}>
                <PlusCircle size={16} /> Post a Job
              </Link>
              <Link to="/recruiter/company" className="btn btn-secondary" style={{ backgroundColor: "#ffffff", color: "#0b2749" }}>
                <Building2 size={16} /> Company Profile
              </Link>
            </div>
          </div>

          {loading ? (
            <LoadingSpinner text="Loading recruiter data..." />
          ) : (
            <>
              {/* Real Stats Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "20px",
                  marginBottom: "36px",
                }}
              >
                <div className="card" style={{ padding: "22px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b", marginBottom: "8px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 600 }}>Active Vacancies</span>
                    <Briefcase size={18} color="#1264c8" />
                  </div>
                  <div style={{ fontSize: "32px", fontWeight: 800, color: "var(--hh-navy)" }}>
                    {publishedJobsCount}
                  </div>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>Of {jobs.length} total listings</span>
                </div>

                <div className="card" style={{ padding: "22px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b", marginBottom: "8px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 600 }}>Total Applicants</span>
                    <Users size={18} color="#059669" />
                  </div>
                  <div style={{ fontSize: "32px", fontWeight: 800, color: "#059669" }}>
                    {totalAppsCount}
                  </div>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>Candidates applied</span>
                </div>

                <div className="card" style={{ padding: "22px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b", marginBottom: "8px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 600 }}>Total Job Views</span>
                    <Eye size={18} color="#7c3aed" />
                  </div>
                  <div style={{ fontSize: "32px", fontWeight: 800, color: "#7c3aed" }}>
                    {totalViews}
                  </div>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>Listing impressions</span>
                </div>

                <div className="card" style={{ padding: "22px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b", marginBottom: "8px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 600 }}>Company Status</span>
                    <CheckCircle2 size={18} color="#10b981" />
                  </div>
                  <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--hh-navy)", marginTop: "6px" }}>
                    {company ? "Verified" : "Setup Required"}
                  </div>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>Employer account active</span>
                </div>
              </div>

              {/* Recent Applicants */}
              <div className="card" style={{ padding: "28px", marginBottom: "32px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <div>
                    <h3 style={{ fontSize: "18px", color: "var(--hh-navy)", fontWeight: 700, margin: "0 0 4px" }}>
                      Recent Candidate Applications
                    </h3>
                    <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>
                      Latest talent submissions across your active job postings.
                    </p>
                  </div>
                  <Link to="/recruiter/applications" className="btn btn-secondary btn-sm">
                    View All Candidates
                  </Link>
                </div>

                {applications.length > 0 ? (
                  <div className="table-container">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Candidate</th>
                          <th>Applied Role</th>
                          <th>Applied Date</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {applications.map((app) => (
                          <tr key={app._id}>
                            <td>
                              <strong style={{ color: "var(--hh-navy)", fontSize: "14px" }}>
                                {app.candidate?.name || "Candidate"}
                              </strong>
                              <span style={{ display: "block", fontSize: "12px", color: "#64748b" }}>
                                {app.candidate?.email}
                              </span>
                            </td>
                            <td>
                              <strong style={{ color: "#334155" }}>{app.job?.title}</strong>
                              <span style={{ display: "block", fontSize: "12px", color: "#64748b" }}>
                                {app.job?.jobType}
                              </span>
                            </td>
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
                              <Link
                                to={`/recruiter/applications?jobId=${app.job?._id}`}
                                className="btn btn-secondary btn-sm"
                              >
                                Review Candidate
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                    <Users size={36} color="#94a3b8" style={{ margin: "0 auto 12px" }} />
                    <h4 style={{ color: "#0b2749", marginBottom: "6px" }}>No applications yet</h4>
                    <p style={{ fontSize: "14px", marginBottom: "16px" }}>
                      Publish your job listings to begin receiving qualified candidates.
                    </p>
                    <Link to="/recruiter/jobs/new" className="btn btn-primary btn-sm">
                      Post an Opening
                    </Link>
                  </div>
                )}
              </div>

              {/* Recruiter's Jobs Summary Table */}
              <div className="card" style={{ padding: "28px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <div>
                    <h3 style={{ fontSize: "18px", color: "var(--hh-navy)", fontWeight: 700, margin: "0 0 4px" }}>
                      My Job Listings ({jobs.length})
                    </h3>
                    <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>
                      Manage your vacancy statuses and view applicant numbers.
                    </p>
                  </div>
                  <Link to="/recruiter/jobs" className="btn btn-secondary btn-sm">
                    Manage All Vacancies
                  </Link>
                </div>

                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Job Title</th>
                        <th>Category</th>
                        <th>Status</th>
                        <th>Applicants</th>
                        <th>Views</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobs.map((j) => (
                        <tr key={j._id}>
                          <td>
                            <strong>{j.title}</strong>
                            <span style={{ display: "block", fontSize: "12px", color: "#64748b" }}>
                              {j.location} • {j.jobType}
                            </span>
                          </td>
                          <td>{j.category}</td>
                          <td>
                            <span className={`badge ${j.status === "published" ? "badge-green" : j.status === "draft" ? "badge-amber" : "badge-gray"}`}>
                              {j.status}
                            </span>
                          </td>
                          <td>
                            <strong>{j.applicationsCount}</strong> candidates
                          </td>
                          <td>{j.viewsCount} views</td>
                          <td>
                            <Link to={`/recruiter/jobs/${j._id}/edit`} className="btn btn-secondary btn-sm" style={{ marginRight: "6px" }}>
                              Edit
                            </Link>
                            <Link to={`/jobs/${j._id}`} className="btn btn-secondary btn-sm">
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RecruiterDashboard;
