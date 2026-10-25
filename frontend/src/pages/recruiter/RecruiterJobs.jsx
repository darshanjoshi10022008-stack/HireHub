import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { jobApi } from "../../api";
import {
  Briefcase,
  PlusCircle,
  Eye,
  Users,
  Edit,
  Trash2,
  ExternalLink,
  Clock,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import LoadingSpinner from "../../components/LoadingSpinner";
import Alert from "../../components/Alert";

const RecruiterJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertInfo, setAlertInfo] = useState(null);

  const fetchJobs = async () => {
    try {
      const res = await jobApi.getRecruiterJobs();
      if (res.success) {
        setJobs(res.jobs || []);
      }
    } catch (err) {
      console.error("Fetch recruiter jobs error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleStatusChange = async (jobId, newStatus) => {
    try {
      const res = await jobApi.updateJobStatus(jobId, newStatus);
      if (res.success) {
        setJobs(
          jobs.map((j) => (j._id === jobId ? { ...j, status: newStatus } : j))
        );
        setAlertInfo({ type: "success", message: `Job status updated to '${newStatus}'` });
      }
    } catch (err) {
      setAlertInfo({ type: "error", message: err.message || "Failed to update status." });
    }
  };

  const handleDeleteJob = async (jobId, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete '${title}'?`)) {
      return;
    }

    try {
      const res = await jobApi.deleteJob(jobId);
      if (res.success) {
        setJobs(jobs.filter((j) => j._id !== jobId));
        setAlertInfo({ type: "success", message: "Job listing deleted successfully." });
      }
    } catch (err) {
      setAlertInfo({ type: "error", message: err.message || "Failed to delete job." });
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
                Manage Job Vacancies
              </h1>
              <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
                Publish, edit, and monitor application numbers for your company's roles.
              </p>
            </div>
            <Link to="/recruiter/jobs/new" className="btn btn-primary">
              <PlusCircle size={16} /> Post a New Job
            </Link>
          </div>

          {alertInfo && <Alert type={alertInfo.type} message={alertInfo.message} />}

          {loading ? (
            <LoadingSpinner text="Loading your job postings..." />
          ) : jobs.length === 0 ? (
            <div className="card text-center" style={{ padding: "60px 20px" }}>
              <Briefcase size={44} color="#94a3b8" style={{ margin: "0 auto 16px" }} />
              <h3 style={{ fontSize: "18px", color: "var(--hh-navy)", marginBottom: "8px" }}>
                You haven't posted any jobs yet
              </h3>
              <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "20px" }}>
                Start reaching qualified engineering, product, and tech candidates today.
              </p>
              <Link to="/recruiter/jobs/new" className="btn btn-primary btn-sm">
                Create First Job Opening
              </Link>
            </div>
          ) : (
            <div className="card" style={{ padding: "24px" }}>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Job Title</th>
                      <th>Category</th>
                      <th>Applicants</th>
                      <th>Views</th>
                      <th>Status</th>
                      <th>Posted Date</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job) => (
                      <tr key={job._id}>
                        <td>
                          <strong style={{ fontSize: "15px", color: "var(--hh-navy)" }}>{job.title}</strong>
                          <span style={{ display: "block", fontSize: "12px", color: "#64748b" }}>
                            {job.workMode} • {job.location}
                          </span>
                        </td>
                        <td>{job.category}</td>
                        <td>
                          <Link
                            to={`/recruiter/applications?jobId=${job._id}`}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "5px",
                              color: "var(--hh-primary)",
                              fontWeight: 600,
                            }}
                          >
                            <Users size={14} /> {job.applicationsCount} applicants
                          </Link>
                        </td>
                        <td>
                          <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#64748b", fontSize: "13px" }}>
                            <Eye size={13} /> {job.viewsCount}
                          </span>
                        </td>
                        <td>
                          <select
                            value={job.status}
                            onChange={(e) => handleStatusChange(job._id, e.target.value)}
                            className="form-select form-select-sm"
                            style={{ width: "115px" }}
                          >
                            <option value="published">Published</option>
                            <option value="draft">Draft</option>
                            <option value="closed">Closed</option>
                          </select>
                        </td>
                        <td style={{ fontSize: "13px", color: "#64748b" }}>
                          {new Date(job.createdAt).toLocaleDateString()}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: "8px" }}>
                            <Link
                              to={`/jobs/${job._id}`}
                              className="btn btn-secondary btn-sm"
                              title="View Public Listing"
                            >
                              <ExternalLink size={13} />
                            </Link>
                            <Link
                              to={`/recruiter/jobs/${job._id}/edit`}
                              className="btn btn-secondary btn-sm"
                              title="Edit Job"
                            >
                              <Edit size={13} />
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleDeleteJob(job._id, job.title)}
                              className="btn btn-danger btn-sm"
                              title="Delete Job"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RecruiterJobs;
