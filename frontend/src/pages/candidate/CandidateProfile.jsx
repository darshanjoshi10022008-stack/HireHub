import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { candidateApi } from "../../api";
import {
  User,
  FileText,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  Download,
  Building,
  GraduationCap,
  Save,
  Briefcase,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import LoadingSpinner from "../../components/LoadingSpinner";
import Alert from "../../components/Alert";

const CandidateProfile = () => {
  const { user, refreshUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alertInfo, setAlertInfo] = useState(null);

  // Form state
  const [name, setName] = useState(user?.name || "");
  const [headline, setHeadline] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");

  // Skills
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");

  // Experience & Education
  const [experience, setExperience] = useState([]);
  const [education, setEducation] = useState([]);

  // Resume
  const [currentResume, setCurrentResume] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);

  // Experience modal/inline form
  const [showExpForm, setShowExpForm] = useState(false);
  const [expForm, setExpForm] = useState({
    title: "",
    company: "",
    location: "",
    startDate: "",
    endDate: "",
    current: false,
    description: "",
  });

  // Education inline form
  const [showEduForm, setShowEduForm] = useState(false);
  const [eduForm, setEduForm] = useState({
    degree: "",
    institution: "",
    fieldOfStudy: "",
    graduationYear: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await candidateApi.getProfile();
        if (res.success && res.profile) {
          const p = res.profile;
          setHeadline(p.headline || "");
          setPhone(p.phone || "");
          setLocation(p.location || "");
          setBio(p.bio || "");
          setWebsite(p.website || "");
          setGithub(p.github || "");
          setLinkedin(p.linkedin || "");
          setSkills(p.skills || []);
          setExperience(p.experience || []);
          setEducation(p.education || []);
          setCurrentResume(p.resume || null);
        }
      } catch (err) {
        console.error("Fetch profile error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleAddExperience = (e) => {
    e.preventDefault();
    if (!expForm.title || !expForm.company) return;
    setExperience([...experience, { ...expForm }]);
    setExpForm({
      title: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
    });
    setShowExpForm(false);
  };

  const handleRemoveExperience = (idx) => {
    setExperience(experience.filter((_, i) => i !== idx));
  };

  const handleAddEducation = (e) => {
    e.preventDefault();
    if (!eduForm.degree || !eduForm.institution) return;
    setEducation([...education, { ...eduForm }]);
    setEduForm({
      degree: "",
      institution: "",
      fieldOfStudy: "",
      graduationYear: "",
    });
    setShowEduForm(false);
  };

  const handleRemoveEducation = (idx) => {
    setEducation(education.filter((_, i) => i !== idx));
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingResume(true);
    setAlertInfo(null);

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await candidateApi.uploadResume(formData);
      if (res.success && res.resume) {
        setCurrentResume(res.resume);
        setAlertInfo({ type: "success", message: "Resume uploaded successfully!" });
      }
    } catch (err) {
      setAlertInfo({ type: "error", message: err.message || "Failed to upload resume." });
    } finally {
      setUploadingResume(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setAlertInfo(null);

    try {
      const res = await candidateApi.updateProfile({
        name,
        headline,
        phone,
        location,
        bio,
        website,
        github,
        linkedin,
        skills,
        experience,
        education,
      });

      if (res.success) {
        setAlertInfo({ type: "success", message: "Profile saved successfully!" });
        refreshUser();
      }
    } catch (err) {
      setAlertInfo({ type: "error", message: err.message || "Failed to save profile." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <Navbar />
        <main className="page-content" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
          <LoadingSpinner text="Loading your candidate profile..." />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="page-content" style={{ padding: "40px 0 80px" }}>
        <div className="container" style={{ maxWidth: "860px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <div>
              <h1 style={{ fontSize: "26px", fontWeight: 800, color: "var(--hh-navy)", margin: "0 0 4px" }}>
                Candidate Profile & Resume
              </h1>
              <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
                This information is shared with recruiters when you submit job applications.
              </p>
            </div>
            <button
              onClick={handleSaveProfile}
              className="btn btn-primary"
              disabled={saving}
            >
              <Save size={16} />
              <span>{saving ? "Saving..." : "Save Profile"}</span>
            </button>
          </div>

          {alertInfo && <Alert type={alertInfo.type} message={alertInfo.message} />}

          <form onSubmit={handleSaveProfile}>
            {/* Resume Upload Card */}
            <div className="card" style={{ padding: "28px", marginBottom: "28px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <FileText size={20} color="#1264c8" />
                <h3 style={{ fontSize: "17px", fontWeight: 700, color: "var(--hh-navy)", margin: 0 }}>
                  Resume Document
                </h3>
              </div>

              {currentResume?.url ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "16px",
                    background: "#eff6ff",
                    border: "1px solid #bfdbfe",
                    borderRadius: "8px",
                    marginBottom: "16px",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <FileText size={24} color="#1264c8" />
                    <div>
                      <strong style={{ fontSize: "14px", color: "#1e3a8a", display: "block" }}>
                        {currentResume.originalName || "Uploaded Resume"}
                      </strong>
                      <span style={{ fontSize: "12px", color: "#64748b" }}>
                        Uploaded on {new Date(currentResume.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <a
                    href={currentResume.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="btn btn-secondary btn-sm"
                  >
                    <Download size={14} /> Preview Resume
                  </a>
                </div>
              ) : (
                <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "14px" }}>
                  You have not uploaded a resume yet. Upload a PDF or DOCX file to enable 1-click applications.
                </p>
              )}

              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <label className="btn btn-secondary btn-sm" style={{ cursor: "pointer" }}>
                  <Upload size={14} />
                  <span>{uploadingResume ? "Uploading..." : "Upload New Resume File"}</span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    style={{ display: "none" }}
                    onChange={handleResumeUpload}
                    disabled={uploadingResume}
                  />
                </label>
                <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                  Supported formats: PDF, DOCX (Max 5MB)
                </span>
              </div>
            </div>

            {/* Basic Information */}
            <div className="card" style={{ padding: "28px", marginBottom: "28px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
                <User size={20} color="#1264c8" />
                <h3 style={{ fontSize: "17px", fontWeight: 700, color: "var(--hh-navy)", margin: 0 }}>
                  Personal Information
                </h3>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address (Registered)</label>
                  <input
                    type="email"
                    className="form-input"
                    value={user?.email || ""}
                    disabled
                    style={{ background: "#f8fafc", color: "#94a3b8" }}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label className="form-label">Professional Headline</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Senior Frontend Engineer | React, TypeScript & Node.js"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    maxLength={120}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Location (City, State / Country)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. San Francisco, CA"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label className="form-label">Professional Summary / Bio</label>
                  <textarea
                    className="form-textarea"
                    rows={4}
                    placeholder="A brief summary of your technical background, projects, and career aspirations..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">GitHub Profile URL</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://github.com/yourhandle"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">LinkedIn Profile URL</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://linkedin.com/in/yourhandle"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Skills Card */}
            <div className="card" style={{ padding: "28px", marginBottom: "28px" }}>
              <h3 style={{ fontSize: "17px", fontWeight: 700, color: "var(--hh-navy)", marginBottom: "14px" }}>
                Core Skills & Proficiencies
              </h3>

              <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Type a skill and click Add (e.g. React, MongoDB, Docker)"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill(e);
                    }
                  }}
                />
                <button type="button" onClick={handleAddSkill} className="btn btn-secondary btn-sm">
                  <Plus size={16} /> Add Skill
                </button>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {skills.map((s, idx) => (
                  <span
                    key={idx}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "6px 12px",
                      background: "#eff6ff",
                      border: "1px solid #bfdbfe",
                      borderRadius: "6px",
                      fontSize: "13px",
                      color: "#1e40af",
                      fontWeight: 600,
                    }}
                  >
                    {s}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(s)}
                      style={{ color: "#ef4444", fontSize: "14px", lineHeight: 1 }}
                      aria-label={`Remove ${s}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Experience Card */}
            <div className="card" style={{ padding: "28px", marginBottom: "28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Building size={20} color="#1264c8" />
                  <h3 style={{ fontSize: "17px", fontWeight: 700, color: "var(--hh-navy)", margin: 0 }}>
                    Work Experience
                  </h3>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowExpForm(!showExpForm)}
                >
                  <Plus size={14} /> Add Role
                </button>
              </div>

              {/* Inline Experience Form */}
              {showExpForm && (
                <div style={{ padding: "18px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "20px" }}>
                  <h4 style={{ fontSize: "14px", color: "var(--hh-navy)", marginBottom: "12px" }}>New Position</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Job Title (e.g. Software Engineer)"
                      value={expForm.title}
                      onChange={(e) => setExpForm({ ...expForm, title: e.target.value })}
                    />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Company Name"
                      value={expForm.company}
                      onChange={(e) => setExpForm({ ...expForm, company: e.target.value })}
                    />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Start Date (e.g. Jan 2023)"
                      value={expForm.startDate}
                      onChange={(e) => setExpForm({ ...expForm, startDate: e.target.value })}
                    />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="End Date (or 'Present')"
                      value={expForm.endDate}
                      onChange={(e) => setExpForm({ ...expForm, endDate: e.target.value })}
                    />
                    <textarea
                      className="form-textarea"
                      placeholder="Key accomplishments and technical responsibilities..."
                      style={{ gridColumn: "1 / -1" }}
                      value={expForm.description}
                      onChange={(e) => setExpForm({ ...expForm, description: e.target.value })}
                    />
                  </div>
                  <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                    <button type="button" onClick={handleAddExperience} className="btn btn-primary btn-sm">
                      Add to Profile
                    </button>
                    <button type="button" onClick={() => setShowExpForm(false)} className="btn btn-secondary btn-sm">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Existing Experience List */}
              {experience.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {experience.map((exp, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: "16px",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: "15px", color: "var(--hh-navy)" }}>{exp.title}</strong>
                        <div style={{ fontSize: "13px", color: "#64748b", margin: "2px 0 6px" }}>
                          {exp.company} • {exp.startDate} - {exp.endDate || "Present"}
                        </div>
                        {exp.description && <p style={{ fontSize: "13px", color: "#334155", margin: 0 }}>{exp.description}</p>}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveExperience(idx)}
                        style={{ color: "#ef4444", padding: "4px" }}
                        aria-label="Remove role"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: "#94a3b8", fontSize: "13px", margin: 0 }}>No work experience added yet.</p>
              )}
            </div>

            {/* Education Card */}
            <div className="card" style={{ padding: "28px", marginBottom: "28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <GraduationCap size={20} color="#1264c8" />
                  <h3 style={{ fontSize: "17px", fontWeight: 700, color: "var(--hh-navy)", margin: 0 }}>
                    Education
                  </h3>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowEduForm(!showEduForm)}
                >
                  <Plus size={14} /> Add Degree
                </button>
              </div>

              {showEduForm && (
                <div style={{ padding: "18px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "20px" }}>
                  <h4 style={{ fontSize: "14px", color: "var(--hh-navy)", marginBottom: "12px" }}>New Education</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Degree (e.g. B.Tech in Computer Science)"
                      value={eduForm.degree}
                      onChange={(e) => setEduForm({ ...eduForm, degree: e.target.value })}
                    />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Institution (e.g. University Name)"
                      value={eduForm.institution}
                      onChange={(e) => setEduForm({ ...eduForm, institution: e.target.value })}
                    />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Graduation Year (e.g. 2025)"
                      value={eduForm.graduationYear}
                      onChange={(e) => setEduForm({ ...eduForm, graduationYear: e.target.value })}
                    />
                  </div>
                  <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                    <button type="button" onClick={handleAddEducation} className="btn btn-primary btn-sm">
                      Add Education
                    </button>
                    <button type="button" onClick={() => setShowEduForm(false)} className="btn btn-secondary btn-sm">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {education.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {education.map((edu, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: "14px",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: "14px", color: "var(--hh-navy)" }}>{edu.degree}</strong>
                        <div style={{ fontSize: "13px", color: "#64748b" }}>
                          {edu.institution} {edu.graduationYear ? `• ${edu.graduationYear}` : ""}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveEducation(idx)}
                        style={{ color: "#ef4444", padding: "4px" }}
                        aria-label="Remove education"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: "#94a3b8", fontSize: "13px", margin: 0 }}>No education records added yet.</p>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
                <Save size={18} />
                <span>{saving ? "Saving Changes..." : "Save Candidate Profile"}</span>
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CandidateProfile;
