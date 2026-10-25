import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { jobApi, companyApi } from "../../api";
import {
  Briefcase,
  Building2,
  DollarSign,
  MapPin,
  Calendar,
  Save,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import LoadingSpinner from "../../components/LoadingSpinner";
import Alert from "../../components/Alert";

const PostJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [alertInfo, setAlertInfo] = useState(null);

  const [form, setForm] = useState({
    title: "",
    category: "Technology & IT",
    jobType: "Full-time",
    workMode: "On-site",
    location: "",
    experienceLevel: "Mid Level",
    salaryMin: "",
    salaryMax: "",
    salaryCurrency: "USD",
    salaryPeriod: "yr",
    isNegotiable: false,
    description: "",
    requirements: "",
    responsibilities: "",
    skills: "",
    deadline: "",
    status: "published",
  });

  useEffect(() => {
    if (isEditing) {
      jobApi
        .getJobById(id)
        .then((res) => {
          if (res.success && res.job) {
            const j = res.job;
            setForm({
              title: j.title || "",
              category: j.category || "Technology & IT",
              jobType: j.jobType || "Full-time",
              workMode: j.workMode || "On-site",
              location: j.location || "",
              experienceLevel: j.experienceLevel || "Mid Level",
              salaryMin: j.salary?.min || "",
              salaryMax: j.salary?.max || "",
              salaryCurrency: j.salary?.currency || "USD",
              salaryPeriod: j.salary?.period || "yr",
              isNegotiable: j.salary?.isNegotiable || false,
              description: j.description || "",
              requirements: Array.isArray(j.requirements) ? j.requirements.join("\n") : "",
              responsibilities: Array.isArray(j.responsibilities) ? j.responsibilities.join("\n") : "",
              skills: Array.isArray(j.skills) ? j.skills.join(", ") : "",
              deadline: j.deadline ? j.deadline.substring(0, 10) : "",
              status: j.status || "published",
            });
          }
        })
        .catch((err) => {
          setAlertInfo({ type: "error", message: err.message || "Failed to load job." });
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlertInfo(null);

    if (!form.title.trim() || !form.location.trim() || !form.description.trim()) {
      setAlertInfo({ type: "error", message: "Please fill in all required fields (Title, Location, Description)." });
      return;
    }

    setSubmitting(true);

    const payload = {
      ...form,
      salaryMin: form.salaryMin ? Number(form.salaryMin) : 0,
      salaryMax: form.salaryMax ? Number(form.salaryMax) : 0,
      requirements: form.requirements.split("\n").map((r) => r.trim()).filter(Boolean),
      responsibilities: form.responsibilities.split("\n").map((r) => r.trim()).filter(Boolean),
      skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
    };

    try {
      let res;
      if (isEditing) {
        res = await jobApi.updateJob(id, payload);
      } else {
        res = await jobApi.createJob(payload);
      }

      if (res.success) {
        alert(isEditing ? "Job updated successfully!" : "Job published successfully!");
        navigate("/recruiter/jobs");
      }
    } catch (err) {
      setAlertInfo({ type: "error", message: err.message || "Failed to save job posting." });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <Navbar />
        <main className="page-content" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
          <LoadingSpinner text="Loading job listing details..." />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="page-content" style={{ padding: "40px 0 80px" }}>
        <div className="container" style={{ maxWidth: "840px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
            <div>
              <Link to="/recruiter/jobs" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#64748b", fontSize: "13px", marginBottom: "8px" }}>
                <ArrowLeft size={14} /> Back to Job Listings
              </Link>
              <h1 style={{ fontSize: "26px", fontWeight: 800, color: "var(--hh-navy)", margin: 0 }}>
                {isEditing ? "Edit Job Posting" : "Create New Job Opening"}
              </h1>
            </div>

            <button type="button" onClick={handleSubmit} className="btn btn-primary" disabled={submitting}>
              <Save size={16} />
              <span>{submitting ? "Saving..." : isEditing ? "Save Changes" : "Publish Job"}</span>
            </button>
          </div>

          {alertInfo && <Alert type={alertInfo.type} message={alertInfo.message} />}

          <form onSubmit={handleSubmit}>
            {/* Basic Info Card */}
            <div className="card" style={{ padding: "28px", marginBottom: "24px" }}>
              <h3 style={{ fontSize: "17px", fontWeight: 700, color: "var(--hh-navy)", marginBottom: "18px" }}>
                Position Details
              </h3>

              <div className="form-group">
                <label className="form-label">Job Title *</label>
                <input
                  type="text"
                  name="title"
                  className="form-input"
                  placeholder="e.g. Senior Full Stack Engineer (MERN)"
                  value={form.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select name="category" className="form-select" value={form.category} onChange={handleChange} required>
                    <option value="Technology & IT">Technology & IT</option>
                    <option value="Software Engineering">Software Engineering</option>
                    <option value="Product & Design">Product & Design</option>
                    <option value="Marketing & Sales">Marketing & Sales</option>
                    <option value="Finance & Accounting">Finance & Accounting</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Operations & Management">Operations & Management</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Employment Type *</label>
                  <select name="jobType" className="form-select" value={form.jobType} onChange={handleChange} required>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Work Arrangement *</label>
                  <select name="workMode" className="form-select" value={form.workMode} onChange={handleChange} required>
                    <option value="On-site">On-site</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Experience Level *</label>
                  <select name="experienceLevel" className="form-select" value={form.experienceLevel} onChange={handleChange} required>
                    <option value="Entry Level">Entry Level</option>
                    <option value="Mid Level">Mid Level</option>
                    <option value="Senior Level">Senior Level</option>
                    <option value="Lead / Executive">Lead / Executive</option>
                  </select>
                </div>

                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label className="form-label">Location (City, State / 'Remote') *</label>
                  <input
                    type="text"
                    name="location"
                    className="form-input"
                    placeholder="e.g. San Francisco, CA or Remote"
                    value={form.location}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Compensation & Status */}
            <div className="card" style={{ padding: "28px", marginBottom: "24px" }}>
              <h3 style={{ fontSize: "17px", fontWeight: 700, color: "var(--hh-navy)", marginBottom: "18px" }}>
                Compensation & Publishing Status
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                <div className="form-group">
                  <label className="form-label">Minimum Salary</label>
                  <input
                    type="number"
                    name="salaryMin"
                    className="form-input"
                    placeholder="e.g. 90000"
                    value={form.salaryMin}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Maximum Salary</label>
                  <input
                    type="number"
                    name="salaryMax"
                    className="form-input"
                    placeholder="e.g. 130000"
                    value={form.salaryMax}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Period</label>
                  <select name="salaryPeriod" className="form-select" value={form.salaryPeriod} onChange={handleChange}>
                    <option value="yr">Per Year (Annual)</option>
                    <option value="mo">Per Month</option>
                    <option value="hr">Per Hour</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Publishing Status</label>
                  <select name="status" className="form-select" value={form.status} onChange={handleChange}>
                    <option value="published">Published (Live & Accepting Applications)</option>
                    <option value="draft">Draft (Saved privately)</option>
                    <option value="closed">Closed (No longer accepting applications)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Application Deadline</label>
                  <input
                    type="date"
                    name="deadline"
                    className="form-input"
                    value={form.deadline}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group" style={{ display: "flex", alignItems: "center", paddingTop: "28px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "14px" }}>
                    <input
                      type="checkbox"
                      name="isNegotiable"
                      checked={form.isNegotiable}
                      onChange={handleChange}
                    />
                    <span>Salary is negotiable</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Description & Requirements */}
            <div className="card" style={{ padding: "28px", marginBottom: "28px" }}>
              <h3 style={{ fontSize: "17px", fontWeight: 700, color: "var(--hh-navy)", marginBottom: "18px" }}>
                Role Description & Requirements
              </h3>

              <div className="form-group">
                <label className="form-label">Full Job Description *</label>
                <textarea
                  name="description"
                  className="form-textarea"
                  rows={6}
                  placeholder="Provide a thorough overview of the team, role impact, and day-to-day work..."
                  value={form.description}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Key Responsibilities (One per line)</label>
                <textarea
                  name="responsibilities"
                  className="form-textarea"
                  rows={4}
                  placeholder="Architect and build scalable microservices&#10;Optimize database query performance&#10;Lead sprint planning and code reviews"
                  value={form.responsibilities}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Qualifications & Requirements (One per line)</label>
                <textarea
                  name="requirements"
                  className="form-textarea"
                  rows={4}
                  placeholder="3+ years of production experience with React and Node.js&#10;Strong understanding of REST APIs and MongoDB&#10;Experience with Docker or AWS cloud services"
                  value={form.requirements}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Skills & Technologies (Comma-separated)</label>
                <input
                  type="text"
                  name="skills"
                  className="form-input"
                  placeholder="React, Node.js, Express, MongoDB, Docker, Git"
                  value={form.skills}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <Link to="/recruiter/jobs" className="btn btn-secondary">
                Cancel
              </Link>
              <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
                <Save size={18} />
                <span>{submitting ? "Submitting..." : isEditing ? "Save Changes" : "Publish Job Listing"}</span>
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PostJob;
