import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { companyApi } from "../api";
import {
  Building2,
  MapPin,
  Users,
  Globe,
  Briefcase,
  ShieldCheck,
  Clock,
  ArrowRight,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LoadingSpinner from "../components/LoadingSpinner";

const CompanyDetail = () => {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCompany = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await companyApi.getCompanyById(id);
        if (res.success && res.company) {
          setCompany(res.company);
          setJobs(res.jobs || []);
        } else {
          setError("Company not found.");
        }
      } catch (err) {
        setError(err.message || "Failed to load company profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [id]);

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

  if (error || !company) {
    return (
      <div className="page-wrapper">
        <Navbar />
        <main className="page-content" style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "80px 20px" }}>
          <div className="card text-center" style={{ maxWidth: "480px", padding: "40px" }}>
            <h2 style={{ color: "#991b1b", marginBottom: "12px" }}>Company Not Found</h2>
            <p style={{ color: "#64748b", marginBottom: "20px" }}>
              The company profile you are searching for does not exist or is pending review.
            </p>
            <Link to="/companies" className="btn btn-primary btn-sm">
              Explore All Companies
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

      <main className="page-content">
        {/* Company Banner */}
        <section style={{ background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)", borderBottom: "1px solid var(--hh-border)", padding: "48px 0" }}>
          <div className="container">
            <div style={{ display: "flex", alignItems: "flex-start", gap: "24px", flexWrap: "wrap" }}>
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "12px",
                  background: "#ffffff",
                  border: "1px solid var(--hh-border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  boxShadow: "var(--hh-shadow-sm)",
                  flexShrink: 0,
                }}
              >
                {company.logo ? (
                  <img src={company.logo} alt={company.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <Building2 size={40} color="#1264c8" />
                )}
              </div>

              <div style={{ flex: 1, minWidth: "280px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <h1 style={{ fontSize: "28px", fontWeight: 800, color: "var(--hh-navy)", margin: 0 }}>
                    {company.name}
                  </h1>
                  <span className="badge badge-green" style={{ fontSize: "11px" }}>
                    <ShieldCheck size={13} /> Verified Employer
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "14px", color: "var(--hh-text-muted)", fontSize: "14px", marginTop: "8px" }}>
                  <span>{company.industry}</span>
                  <span className="meta-sep">•</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <MapPin size={14} /> {company.location || "Remote"}
                  </span>
                  <span className="meta-sep">•</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <Users size={14} /> {company.companySize || "11-50"} employees
                  </span>
                  {company.website && (
                    <>
                      <span className="meta-sep">•</span>
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noreferrer noopener"
                        style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--hh-primary)", fontWeight: 600 }}
                      >
                        <Globe size={14} /> Visit Website
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content Body */}
        <section style={{ padding: "48px 0 80px" }}>
          <div className="container" style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "32px" }}>
            {/* Left: About Company */}
            <div>
              <div className="card" style={{ padding: "28px" }}>
                <h3 style={{ fontSize: "18px", color: "var(--hh-navy)", fontWeight: 700, marginBottom: "14px" }}>
                  About {company.name}
                </h3>
                <p style={{ color: "#334155", lineHeight: "1.7", fontSize: "14px", whiteSpace: "pre-line" }}>
                  {company.about || "This company has not yet provided a detailed overview."}
                </p>
              </div>
            </div>

            {/* Right: Published Openings */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                <h3 style={{ fontSize: "20px", color: "var(--hh-navy)", fontWeight: 700, margin: 0 }}>
                  Active Job Openings ({jobs.length})
                </h3>
              </div>

              {jobs.length === 0 ? (
                <div className="card text-center" style={{ padding: "40px" }}>
                  <Briefcase size={32} color="#94a3b8" style={{ margin: "0 auto 12px" }} />
                  <h4 style={{ color: "#0b2749", marginBottom: "6px" }}>No Open Roles Currently</h4>
                  <p style={{ color: "#64748b", fontSize: "14px" }}>
                    Check back later for new openings posted by {company.name}.
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {jobs.map((job) => (
                    <div key={job._id} className="card" style={{ padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
                      <div>
                        <div style={{ display: "flex", gap: "6px", marginBottom: "6px" }}>
                          <span className="badge badge-blue">{job.jobType}</span>
                          <span className="badge badge-gray">{job.workMode}</span>
                        </div>
                        <h4 style={{ fontSize: "17px", fontWeight: 700, margin: "0 0 6px" }}>
                          <Link to={`/jobs/${job._id}`} style={{ color: "var(--hh-navy)" }}>
                            {job.title}
                          </Link>
                        </h4>
                        <div style={{ display: "flex", gap: "12px", fontSize: "13px", color: "#64748b" }}>
                          <span><MapPin size={12} style={{ display: "inline", verticalAlign: "middle" }} /> {job.location}</span>
                          {job.salary?.max > 0 && (
                            <span style={{ color: "#047857", fontWeight: 600 }}>
                              ${(job.salary.max / 1000).toFixed(0)}k/{job.salary.period}
                            </span>
                          )}
                        </div>
                      </div>

                      <Link to={`/jobs/${job._id}`} className="btn btn-primary btn-sm">
                        <span>View Role</span>
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default CompanyDetail;
