import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { companyApi } from "../../api";
import {
  Building2,
  Globe,
  MapPin,
  Users,
  Upload,
  Save,
  ShieldCheck,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import LoadingSpinner from "../../components/LoadingSpinner";
import Alert from "../../components/Alert";

const RecruiterCompany = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [alertInfo, setAlertInfo] = useState(null);

  const [form, setForm] = useState({
    name: "",
    industry: "Technology",
    website: "",
    companySize: "11-50",
    location: "",
    about: "",
    logo: "",
  });

  useEffect(() => {
    companyApi
      .getMyCompany()
      .then((res) => {
        if (res.success && res.company) {
          const c = res.company;
          setForm({
            name: c.name || "",
            industry: c.industry || "Technology",
            website: c.website || "",
            companySize: c.companySize || "11-50",
            location: c.location || "",
            about: c.about || "",
            logo: c.logo || "",
          });
        }
      })
      .catch((err) => {
        console.error("Fetch company error:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingLogo(true);
    setAlertInfo(null);

    const formData = new FormData();
    formData.append("logo", file);

    try {
      const res = await companyApi.uploadLogo(formData);
      if (res.success && res.logoUrl) {
        setForm((prev) => ({ ...prev, logo: res.logoUrl }));
        setAlertInfo({ type: "success", message: "Company logo uploaded successfully!" });
      }
    } catch (err) {
      setAlertInfo({ type: "error", message: err.message || "Failed to upload logo." });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setAlertInfo({ type: "error", message: "Company name is required." });
      return;
    }

    setSaving(true);
    setAlertInfo(null);

    try {
      const res = await companyApi.saveCompany(form);
      if (res.success) {
        setAlertInfo({ type: "success", message: "Company profile updated successfully!" });
      }
    } catch (err) {
      setAlertInfo({ type: "error", message: err.message || "Failed to save company profile." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <Navbar />
        <main className="page-content" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
          <LoadingSpinner text="Loading company profile..." />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="page-content" style={{ padding: "40px 0 80px" }}>
        <div className="container" style={{ maxWidth: "800px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <div>
              <h1 style={{ fontSize: "26px", fontWeight: 800, color: "var(--hh-navy)", margin: "0 0 4px" }}>
                Company Profile
              </h1>
              <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
                This profile is presented to candidates when they review your vacancies.
              </p>
            </div>
            <button type="button" onClick={handleSubmit} className="btn btn-primary" disabled={saving}>
              <Save size={16} />
              <span>{saving ? "Saving..." : "Save Profile"}</span>
            </button>
          </div>

          {alertInfo && <Alert type={alertInfo.type} message={alertInfo.message} />}

          <form onSubmit={handleSubmit}>
            {/* Logo & Branding */}
            <div className="card" style={{ padding: "28px", marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                <div
                  style={{
                    width: "72px",
                    height: "72px",
                    borderRadius: "12px",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    flexShrink: 0,
                  }}
                >
                  {form.logo ? (
                    <img src={form.logo} alt="Company logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <Building2 size={36} color="#1264c8" />
                  )}
                </div>

                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--hh-navy)", marginBottom: "6px" }}>
                    Company Logo
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <label className="btn btn-secondary btn-sm" style={{ cursor: "pointer" }}>
                      <Upload size={14} />
                      <span>{uploadingLogo ? "Uploading..." : "Upload Logo"}</span>
                      <input
                        type="file"
                        accept=".png,.jpg,.jpeg,.svg,.webp"
                        style={{ display: "none" }}
                        onChange={handleLogoUpload}
                        disabled={uploadingLogo}
                      />
                    </label>
                    <span style={{ fontSize: "12px", color: "#94a3b8" }}>PNG, JPG, SVG or WebP (Max 3MB)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Company Info */}
            <div className="card" style={{ padding: "28px", marginBottom: "28px" }}>
              <h3 style={{ fontSize: "17px", fontWeight: 700, color: "var(--hh-navy)", marginBottom: "18px" }}>
                Company Details
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label className="form-label">Company Name *</label>
                  <input
                    type="text"
                    name="name"
                    className="form-input"
                    placeholder="e.g. Acme Technologies Inc."
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Industry</label>
                  <input
                    type="text"
                    name="industry"
                    className="form-input"
                    placeholder="e.g. Software & Cloud"
                    value={form.industry}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Company Size</label>
                  <select name="companySize" className="form-select" value={form.companySize} onChange={handleChange}>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="501-1000">501-1000 employees</option>
                    <option value="1000+">1000+ employees</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Headquarters Location</label>
                  <input
                    type="text"
                    name="location"
                    className="form-input"
                    placeholder="e.g. Austin, TX or Remote"
                    value={form.location}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Company Website URL</label>
                  <input
                    type="url"
                    name="website"
                    className="form-input"
                    placeholder="https://company.com"
                    value={form.website}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label className="form-label">About the Company</label>
                  <textarea
                    name="about"
                    className="form-textarea"
                    rows={5}
                    placeholder="Describe your company mission, culture, technologies, and what makes working at your organization rewarding..."
                    value={form.about}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
                <Save size={18} />
                <span>{saving ? "Saving Changes..." : "Save Company Profile"}</span>
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RecruiterCompany;
