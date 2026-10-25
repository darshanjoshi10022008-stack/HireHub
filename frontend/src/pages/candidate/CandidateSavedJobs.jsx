import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { candidateApi } from "../../api";
import {
  Bookmark,
  Building2,
  MapPin,
  Clock,
  Trash2,
  Briefcase,
  ArrowRight,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import LoadingSpinner from "../../components/LoadingSpinner";
import Alert from "../../components/Alert";

const CandidateSavedJobs = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertInfo, setAlertInfo] = useState(null);

  useEffect(() => {
    const fetchSavedJobs = async () => {
      try {
        const res = await candidateApi.getSavedJobs();
        if (res.success) {
          setSavedJobs(res.savedJobs || []);
        }
      } catch (err) {
        console.error("Fetch saved jobs error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedJobs();
  }, []);

  const handleRemove = async (jobId) => {
    try {
      const res = await candidateApi.toggleSaveJob(jobId);
      if (res.success) {
        setSavedJobs(savedJobs.filter((j) => j._id !== jobId));
        setAlertInfo({ type: "success", message: "Job removed from saved bookmarks." });
      }
    } catch (err) {
      setAlertInfo({ type: "error", message: err.message || "Failed to remove job." });
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="page-content" style={{ padding: "40px 0 80px" }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <div>
              <h1 style={{ fontSize: "26px", fontWeight: 800, color: "var(--hh-navy)", margin: "0 0 4px" }}>
                Saved Jobs
              </h1>
              <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
                Positions you have bookmarked to review or apply to later.
              </p>
            </div>
            <Link to="/jobs" className="btn btn-secondary btn-sm">
              Explore More Roles
            </Link>
          </div>

          {alertInfo && <Alert type={alertInfo.type} message={alertInfo.message} />}

          {loading ? (
            <LoadingSpinner text="Loading saved bookmarks..." />
          ) : savedJobs.length === 0 ? (
            <div className="card text-center" style={{ padding: "60px 20px" }}>
              <Bookmark size={44} color="#94a3b8" style={{ margin: "0 auto 16px" }} />
              <h3 style={{ fontSize: "18px", color: "var(--hh-navy)", marginBottom: "8px" }}>
                No saved jobs yet
              </h3>
              <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "20px" }}>
                Click the bookmark icon on any job posting to save it here for quick access.
              </p>
              <Link to="/jobs" className="btn btn-primary btn-sm">
                Browse Jobs Now
              </Link>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "20px" }}>
              {savedJobs.map((job) => (
                <div key={job._id} className="card" style={{ padding: "24px", display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                      <div
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "8px",
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden",
                        }}
                      >
                        {job.company?.logo ? (
                          <img src={job.company.logo} alt={job.company.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <Building2 size={24} color="#1264c8" />
                        )}
                      </div>
                      <div>
                        <span style={{ fontSize: "13px", color: "#64748b" }}>{job.company?.name}</span>
                        <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                          <MapPin size={11} style={{ display: "inline" }} /> {job.location}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemove(job._id)}
                      style={{ color: "#94a3b8", padding: "4px" }}
                      title="Remove from saved"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <h3 style={{ fontSize: "17px", fontWeight: 700, margin: "0 0 10px" }}>
                    <Link to={`/jobs/${job._id}`} style={{ color: "var(--hh-navy)" }}>
                      {job.title}
                    </Link>
                  </h3>

                  <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
                    <span className="badge badge-blue">{job.jobType}</span>
                    <span className="badge badge-gray">{job.workMode}</span>
                  </div>

                  <div style={{ marginTop: "auto", paddingTop: "14px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                      <Clock size={12} style={{ display: "inline" }} /> Saved
                    </span>
                    <Link to={`/jobs/${job._id}`} className="btn btn-primary btn-sm">
                      Apply Now
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CandidateSavedJobs;
