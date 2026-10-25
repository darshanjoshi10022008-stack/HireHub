import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { companyApi } from "../api";
import {
  Building2,
  MapPin,
  Users,
  Search,
  Globe,
  Briefcase,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LoadingSpinner from "../components/LoadingSpinner";
import "./Companies.css";

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      try {
        const params = {};
        if (search.trim()) params.search = search.trim();
        if (industry !== "All") params.industry = industry;

        const res = await companyApi.getCompanies(params);
        if (res.success) {
          setCompanies(res.companies || []);
        }
      } catch (err) {
        console.error("Fetch companies error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [industry]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    companyApi.getCompanies({ search: search.trim(), industry }).then((res) => {
      if (res.success) {
        setCompanies(res.companies || []);
      }
    });
  };

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="page-content hh-companies-page">
        {/* Header Hero */}
        <section className="companies-hero">
          <div className="container">
            <span className="section-eyebrow">VERIFIED EMPLOYER DIRECTORY</span>
            <h1 className="companies-hero-title">Discover Great Companies Hiring Today</h1>
            <p className="companies-hero-sub">
              Browse approved companies actively recruiting top candidates on the HireHub platform.
            </p>

            {/* Filter Search Bar */}
            <form className="companies-search-bar card" onSubmit={handleSearchSubmit}>
              <div className="search-field">
                <Search size={18} color="#94a3b8" />
                <input
                  type="text"
                  placeholder="Search by company name or location..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="select-field">
                <select value={industry} onChange={(e) => setIndustry(e.target.value)}>
                  <option value="All">All Industries</option>
                  <option value="Technology">Technology</option>
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="Cloud & Infrastructure">Cloud & Infrastructure</option>
                  <option value="Product & Design">Product & Design</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary">
                Search
              </button>
            </form>
          </div>
        </section>

        {/* Companies Grid */}
        <section className="companies-grid-section">
          <div className="container">
            {loading ? (
              <LoadingSpinner text="Loading verified companies..." />
            ) : companies.length === 0 ? (
              <div className="card text-center" style={{ padding: "60px 20px" }}>
                <Building2 size={40} color="#94a3b8" style={{ margin: "0 auto 16px" }} />
                <h3>No companies found</h3>
                <p style={{ color: "#64748b" }}>Try searching for a different company or industry.</p>
              </div>
            ) : (
              <div className="companies-grid">
                {companies.map((company) => (
                  <div key={company._id} className="company-card card">
                    <div className="company-card-top">
                      <div className="comp-avatar">
                        {company.logo ? (
                          <img src={company.logo} alt={company.name} />
                        ) : (
                          <Building2 size={28} color="#1264c8" />
                        )}
                      </div>
                      <span className="verified-badge" title="Verified Employer">
                        <ShieldCheck size={14} color="#10b981" /> Verified
                      </span>
                    </div>

                    <h3 className="comp-title">
                      <Link to={`/companies/${company._id}`}>{company.name}</Link>
                    </h3>

                    <span className="comp-industry">{company.industry}</span>

                    <p className="comp-about">
                      {company.about
                        ? company.about.length > 130
                          ? `${company.about.substring(0, 130)}...`
                          : company.about
                        : "Forward-thinking employer recruiting on HireHub."}
                    </p>

                    <div className="comp-meta">
                      <span className="meta-item">
                        <MapPin size={13} /> {company.location || "Remote"}
                      </span>
                      <span className="meta-item">
                        <Users size={13} /> {company.companySize || "11-50"} employees
                      </span>
                    </div>

                    <div className="comp-card-footer">
                      <span className="jobs-count-tag">
                        <Briefcase size={13} /> {company.openJobsCount || 0} Openings
                      </span>
                      <Link to={`/companies/${company._id}`} className="btn btn-outline-primary btn-sm">
                        View Profile
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Companies;
