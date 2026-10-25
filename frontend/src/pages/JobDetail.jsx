import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { jobApi, applicationApi, candidateApi } from "../api";
import { useAuth } from "../context/AuthContext";
import {
  Building2,
  MapPin,
  Clock,
  DollarSign,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Globe,
  Users,
  Briefcase,
  FileText,
  Upload,
  ArrowRight,
  ShieldCheck,
  Eye,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LoadingSpinner from "../components/LoadingSpinner";
import Modal from "../components/Modal";
import Alert from "../components/Alert";
import "./JobDetail.css";

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isCandidate, isRecruiter } = useAuth();

  const [job, setJob] = useState(null);
  const [relatedJobs, setRelatedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [hasApplied, setHasApplied] = useState(false);
  const [existingApplication, setExistingApplication] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

  // Apply Modal state
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [candidateProfile, setCandidateProfile] = useState(null);
  const [coverNote, setCoverNote] = useState("");
  const [newResumeFile, setNewResumeFile] = useState(null);
  const [useProfileResume, setUseProfileResume] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [applyAlert, setApplyAlert] = useState(null);

  useEffect(() => {
    const fetchJobData = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await jobApi.getJobById(id);
        if (res.success && res.job) {
          setJob(res.job);
          setRelatedJobs(res.relatedJobs || []);
        } else {
          setError("Job listing not found.");
        }
      } catch (err) {
        setError(err.message || "Failed to load job details.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobData();
  }, [id]);

  // Check if candidate has applied or saved this job
  useEffect(() => {
    if (isCandidate && id) {
      applicationApi
        .checkJobApplied(id)
        .then((res) => {
          if (res.success && res.hasApplied) {
            setHasApplied(true);
            setExistingApplication(res.application);
          }
        })
        .catch(() => {});

      candidateApi
        .getProfile()
        .then((res) => {
          if (res.success && res.profile) {
            setCandidateProfile(res.profile);
            const saved = res.profile.savedJobs?.some((j) => (j._id || j) === id);
            setIsSaved(!!saved);
          }
        })
        .catch(() => {});
    }
  }, [isCandidate, id]);

  const handleToggleSave = async () => {
    if (!user) {
      alert("Please sign in as a candidate to save jobs.");
      return;
    }
    if (!isCandidate) {
      alert("Only candidates can save jobs.");
      return;
    }

    try {
      const res = await candidateApi.toggleSaveJob(id);
      if (res.success) {
        setIsSaved(res.isSaved);
      }
    } catch (err) {
      alert(err.message || "Failed to bookmark job.");
    }
  };

  const handleOpenApplyModal = () => {
    if (!user) {
      navigate(`/login?redirect=/jobs/${id}`);
      return;
    }
    if (isRecruiter) {
      alert("Recruiter accounts cannot apply to job postings. Please use a candidate account.");
      return;
    }
    setIsApplyModalOpen(true);
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setApplyAlert(null);

    // Validate resume availability
    if (!useProfileResume && !newResumeFile) {
      setApplyAlert({
        type: "error",
        message: "Please select a resume file (PDF or DOCX) to upload.",
      });
      return;
    }

    if (useProfileResume && (!candidateProfile?.resume || !candidateProfile.resume.url)) {
      setApplyAlert({
        type: "error",
        message: "You have not saved a resume on your profile yet. Please upload a resume file below.",
      });
      return;
    }

    setSubmitting(true);

    try {
      let res;
      if (newResumeFile) {
        const formData = new FormData();
        formData.append("resume", newResumeFile);
        formData.append("coverNote", coverNote);
        res = await applicationApi.applyToJob(id, formData);
      } else {
        res = await applicationApi.applyToJob(id, { coverNote });
      }

      if (res.success) {
        setHasApplied(true);
        setExistingApplication(res.application);
        setIsApplyModalOpen(false);
        alert("Application submitted successfully! You can track its status in your dashboard.");
      }
    } catch (err) {
      setApplyAlert({
        type: "error",
        message: err.message || "Failed to submit application.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <Navbar />
        <main className="page-content" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
          <LoadingSpinner text="Loading job opportunity..." />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="page-wrapper">
        <Navbar />
        <main className="page-content" style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "80px 20px" }}>
          <div className="card text-center" style={{ maxWidth: "480px", padding: "40px" }}>
            <h2 style={{ color: "#991b1b", marginBottom: "12px" }}>Listing Unavailable</h2>
            <p style={{ color: "#64748b", marginBottom: "20px" }}>
              {error || "The job posting you are looking for has expired or does not exist."}
            </p>
            <Link to="/jobs" className="btn btn-primary btn-sm">
              Explore Available Jobs
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="page-content hh-job-detail-page">
        {/* Top Header Banner */}
        <section className="hh-detail-hero">
          <div className="container">
            <div className="detail-hero-content">
              <div className="detail-header-left">
                <div className="detail-company-logo">
                  {job.company?.logo ? (
                    <img src={job.company.logo} alt={job.company.name} />
                  ) : (
                    <Building2 size={36} color="#1264c8" />
                  )}
                </div>

                <div>
                  <div className="detail-tags-top">
                    <span className="badge badge-blue">{job.jobType}</span>
                    <span className="badge badge-gray">{job.workMode}</span>
                    <span className="badge badge-purple">{job.experienceLevel}</span>
                  </div>

                  <h1 className="detail-job-title">{job.title}</h1>

                  <div className="detail-company-row">
                    <Link to={`/companies/${job.company?._id}`} className="detail-company-link">
                      {job.company?.name || "Verified Employer"}
                    </Link>
                    <span className="meta-sep">•</span>
                    <span className="detail-location">
                      <MapPin size={15} /> {job.location}
                    </span>
                    <span className="meta-sep">•</span>
                    <span className="detail-date">
                      <Clock size={15} /> Posted on {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="detail-header-actions">
                <button
                  type="button"
                  className={`btn btn-secondary save-action-btn ${isSaved ? "saved" : ""}`}
                  onClick={handleToggleSave}
                >
                  {isSaved ? <BookmarkCheck size={18} color="#1264c8" /> : <Bookmark size={18} />}
                  <span>{isSaved ? "Saved" : "Save Job"}</span>
                </button>

                {hasApplied ? (
                  <div className="already-applied-pill">
                    <CheckCircle2 size={18} color="#059669" />
                    <span>Applied ({existingApplication?.status || "Under Review"})</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary btn-lg apply-main-btn"
                    onClick={handleOpenApplyModal}
                  >
                    Apply for this Position
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Applied Status Notice if candidate already applied */}
        {hasApplied && (
          <div className="container" style={{ marginTop: "24px" }}>
            <div className="card applied-status-card">
              <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                <CheckCircle2 size={24} color="#059669" />
                <div>
                  <h4 style={{ color: "#065f46", fontSize: "16px", margin: "0 0 2px" }}>
                    You have already applied for this position
                  </h4>
                  <p style={{ color: "#475569", fontSize: "14px", margin: 0 }}>
                    Current Status: <strong>{existingApplication?.status}</strong> • Submitted on{" "}
                    {new Date(existingApplication?.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Link to="/candidate/applications" className="btn btn-secondary btn-sm">
                View My Applications
              </Link>
            </div>
          </div>
        )}

        {/* Body Content Grid */}
        <section className="hh-detail-body">
          <div className="container hh-detail-grid">
            {/* Left Column: Full Description, Responsibilities, Requirements */}
            <div className="detail-main-column">
              <div className="card detail-card">
                <h3 className="section-heading">About the Role</h3>
                <div className="prose-content">
                  <p style={{ whiteSpace: "pre-line", lineHeight: "1.7", color: "#334155" }}>
                    {job.description}
                  </p>
                </div>

                {job.responsibilities && job.responsibilities.length > 0 && (
                  <div className="detail-subblock">
                    <h4 className="subblock-heading">Key Responsibilities</h4>
                    <ul className="bullet-list">
                      {job.responsibilities.map((resp, idx) => (
                        <li key={idx}>{resp}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {job.requirements && job.requirements.length > 0 && (
                  <div className="detail-subblock">
                    <h4 className="subblock-heading">Qualifications & Requirements</h4>
                    <ul className="bullet-list">
                      {job.requirements.map((req, idx) => (
                        <li key={idx}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {job.skills && job.skills.length > 0 && (
                  <div className="detail-subblock">
                    <h4 className="subblock-heading">Technologies & Required Skills</h4>
                    <div className="skills-tag-cloud">
                      {job.skills.map((skill, idx) => (
                        <span key={idx} className="skill-pill-lg">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Related Jobs */}
              {relatedJobs.length > 0 && (
                <div className="related-jobs-block">
                  <h3 className="section-heading" style={{ marginBottom: "18px" }}>
                    Similar Opportunities in {job.category}
                  </h3>
                  <div className="related-grid">
                    {relatedJobs.map((rj) => (
                      <Link to={`/jobs/${rj._id}`} key={rj._id} className="related-card card">
                        <h4>{rj.title}</h4>
                        <span className="related-company">{rj.company?.name}</span>
                        <div className="related-meta">
                          <span className="meta-item">
                            <MapPin size={13} /> {rj.location}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Company Card & Job Overview */}
            <div className="detail-sidebar-column">
              {/* Job Overview Card */}
              <div className="card overview-card">
                <h4 className="overview-title">Job Overview</h4>

                <div className="overview-item">
                  <Briefcase size={18} className="overview-icon" />
                  <div>
                    <span className="label">Employment Type</span>
                    <strong>{job.jobType}</strong>
                  </div>
                </div>

                <div className="overview-item">
                  <MapPin size={18} className="overview-icon" />
                  <div>
                    <span className="label">Work Arrangement</span>
                    <strong>{job.workMode} ({job.location})</strong>
                  </div>
                </div>

                <div className="overview-item">
                  <DollarSign size={18} className="overview-icon" />
                  <div>
                    <span className="label">Offered Compensation</span>
                    <strong>
                      {job.salary?.max > 0
                        ? `$${job.salary.min ? `${job.salary.min.toLocaleString()} - ` : ""}$${job.salary.max.toLocaleString()} / ${job.salary.period}`
                        : "Competitive / Negotiable"}
                    </strong>
                  </div>
                </div>

                <div className="overview-item">
                  <Users size={18} className="overview-icon" />
                  <div>
                    <span className="label">Experience Level</span>
                    <strong>{job.experienceLevel}</strong>
                  </div>
                </div>

                {job.deadline && (
                  <div className="overview-item">
                    <Clock size={18} className="overview-icon" />
                    <div>
                      <span className="label">Application Deadline</span>
                      <strong>{new Date(job.deadline).toLocaleDateString()}</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Company Card */}
              <div className="card company-snapshot-card">
                <div className="company-snap-header">
                  <div className="company-snap-logo">
                    {job.company?.logo ? (
                      <img src={job.company.logo} alt={job.company.name} />
                    ) : (
                      <Building2 size={28} color="#1264c8" />
                    )}
                  </div>
                  <div>
                    <h4 className="company-snap-name">{job.company?.name}</h4>
                    <span className="company-snap-industry">{job.company?.industry}</span>
                  </div>
                </div>

                {job.company?.about && (
                  <p className="company-snap-desc">
                    {job.company.about.length > 180
                      ? `${job.company.about.substring(0, 180)}...`
                      : job.company.about}
                  </p>
                )}

                <div className="company-snap-stats">
                  <div>
                    <span className="label">Company Size</span>
                    <strong>{job.company?.companySize || "11-50"} members</strong>
                  </div>
                  <div>
                    <span className="label">HQ Location</span>
                    <strong>{job.company?.location || "Remote"}</strong>
                  </div>
                </div>

                {job.company?.website && (
                  <a
                    href={job.company.website}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="company-website-link"
                  >
                    <Globe size={14} /> Visit Website
                  </a>
                )}

                <Link
                  to={`/companies/${job.company?._id}`}
                  className="btn btn-secondary btn-sm"
                  style={{ width: "100%", marginTop: "14px" }}
                >
                  View All Openings at {job.company?.name}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Apply Modal */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title={`Apply for ${job.title}`}
      >
        <form onSubmit={handleApplySubmit}>
          {applyAlert && <Alert type={applyAlert.type} message={applyAlert.message} />}

          <div style={{ marginBottom: "20px" }}>
            <span style={{ fontSize: "14px", fontWeight: 600, color: "#0b2749", display: "block", marginBottom: "8px" }}>
              Select Resume to Submit:
            </span>

            {candidateProfile?.resume?.url ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "14px" }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "12px",
                    border: useProfileResume ? "2px solid #1264c8" : "1px solid #e2e8f0",
                    borderRadius: "8px",
                    background: useProfileResume ? "#eff6ff" : "#ffffff",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="resumeChoice"
                    checked={useProfileResume}
                    onChange={() => {
                      setUseProfileResume(true);
                      setNewResumeFile(null);
                    }}
                  />
                  <FileText size={18} color="#1264c8" />
                  <div>
                    <strong style={{ fontSize: "13px", color: "#1e293b" }}>
                      Profile Resume: {candidateProfile.resume.originalName || "Uploaded Resume"}
                    </strong>
                    <span style={{ display: "block", fontSize: "11px", color: "#64748b" }}>
                      Saved on your candidate profile
                    </span>
                  </div>
                </label>

                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "12px",
                    border: !useProfileResume ? "2px solid #1264c8" : "1px solid #e2e8f0",
                    borderRadius: "8px",
                    background: !useProfileResume ? "#eff6ff" : "#ffffff",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="resumeChoice"
                    checked={!useProfileResume}
                    onChange={() => setUseProfileResume(false)}
                  />
                  <Upload size={18} color="#1264c8" />
                  <div>
                    <strong style={{ fontSize: "13px", color: "#1e293b" }}>
                      Upload a different resume for this application
                    </strong>
                    <span style={{ display: "block", fontSize: "11px", color: "#64748b" }}>
                      PDF, DOC, or DOCX (up to 5MB)
                    </span>
                  </div>
                </label>
              </div>
            ) : (
              <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "12px" }}>
                Please upload your resume file to accompany your application:
              </p>
            )}

            {(!useProfileResume || !candidateProfile?.resume?.url) && (
              <div style={{ marginTop: "10px" }}>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setNewResumeFile(e.target.files[0])}
                  className="form-input"
                  required={!useProfileResume || !candidateProfile?.resume?.url}
                />
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              Cover Note / Pitch (Optional)
            </label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Introduce yourself and explain why you're a great fit for this role..."
              value={coverNote}
              onChange={(e) => setCoverNote(e.target.value)}
              maxLength={2000}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsApplyModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Submitting Application..." : "Submit Application"}
            </button>
          </div>
        </form>
      </Modal>

      <Footer />
    </div>
  );
};

export default JobDetail;
