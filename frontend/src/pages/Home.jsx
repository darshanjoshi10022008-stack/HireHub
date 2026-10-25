import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { jobApi } from "../api";
import {
  Search,
  MapPin,
  Briefcase,
  Layers,
  ArrowRight,
  TrendingUp,
  Building2,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Bookmark,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LoadingSpinner from "../components/LoadingSpinner";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();

  const [searchTitle, setSearchTitle] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [searchCategory, setSearchCategory] = useState("All");

  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsRes, catRes] = await Promise.all([
          jobApi.getFeaturedJobs(),
          jobApi.getCategories(),
        ]);

        if (jobsRes.success) {
          setFeaturedJobs(jobsRes.jobs || []);
        }
        if (catRes.success) {
          setCategories(catRes.categories || []);
        }
      } catch (err) {
        console.error("Home data error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTitle.trim()) params.append("search", searchTitle.trim());
    if (searchLocation.trim()) params.append("location", searchLocation.trim());
    if (searchCategory !== "All") params.append("category", searchCategory);
    navigate(`/jobs?${params.toString()}`);
  };

  const handleQuickTagClick = (tag) => {
    navigate(`/jobs?search=${encodeURIComponent(tag)}`);
  };

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="page-content">
        {/* Hero Section */}
        <section className="hh-hero">
          <div className="container">
            <div className="hh-hero-badge">
              <ShieldCheck size={16} color="#10b981" />
              <span>THE TRUSTED EMPLOYMENT PLATFORM FOR MODERN TEAMS</span>
            </div>

            <h1 className="hh-hero-title">
              Find the opportunity that elevates your career.
            </h1>

            <p className="hh-hero-subtitle">
              HireHub connects high-caliber talent with transparent, forward-thinking employers. Discover verified engineering, product, and leadership roles.
            </p>

            {/* Main Search Bar Form */}
            <form className="hh-hero-search-box" onSubmit={handleSearchSubmit}>
              <div className="hh-search-field">
                <Search size={20} className="field-icon" />
                <input
                  type="text"
                  placeholder="Job title, keywords, or skills..."
                  value={searchTitle}
                  onChange={(e) => setSearchTitle(e.target.value)}
                />
              </div>

              <div className="hh-search-divider" />

              <div className="hh-search-field">
                <MapPin size={20} className="field-icon" />
                <input
                  type="text"
                  placeholder="Location or 'Remote'..."
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                />
              </div>

              <div className="hh-search-divider" />

              <div className="hh-search-field select-field">
                <Layers size={20} className="field-icon" />
                <select
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                >
                  <option value="All">All Categories</option>
                  <option value="Technology & IT">Technology & IT</option>
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="Product & Design">Product & Design</option>
                  <option value="Marketing & Sales">Marketing & Sales</option>
                  <option value="Finance & Accounting">Finance & Accounting</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary btn-search">
                <span>Find Jobs</span>
                <ArrowRight size={18} />
              </button>
            </form>

            {/* Quick Keyword Tags */}
            <div className="hh-hero-tags">
              <span className="tags-label">Popular Searches:</span>
              {["React", "Node.js", "Remote", "Internship", "UI/UX", "Full Stack", "DevOps"].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className="hh-quick-tag"
                  onClick={() => handleQuickTagClick(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Platform Metric Ribbon */}
        <section className="hh-metrics-ribbon">
          <div className="container">
            <div className="hh-metrics-grid">
              <div className="hh-metric-item">
                <div className="metric-number">2,500+</div>
                <div className="metric-label">Active Job Openings</div>
              </div>
              <div className="hh-metric-item">
                <div className="metric-number">450+</div>
                <div className="metric-label">Vetted Partner Companies</div>
              </div>
              <div className="hh-metric-item">
                <div className="metric-number">98%</div>
                <div className="metric-label">Direct Employer Interviews</div>
              </div>
              <div className="hh-metric-item">
                <div className="metric-number">&lt; 48h</div>
                <div className="metric-label">Average Response Time</div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Job Openings */}
        <section className="hh-section">
          <div className="container">
            <div className="hh-section-header">
              <div>
                <span className="section-eyebrow">VERIFIED OPPORTUNITIES</span>
                <h2 className="section-title">Featured Career Openings</h2>
                <p className="section-desc">
                  Curated positions from industry-leading companies with transparent compensation.
                </p>
              </div>
              <Link to="/jobs" className="btn btn-secondary btn-sm">
                <span>View All Jobs</span>
                <ArrowRight size={15} />
              </Link>
            </div>

            {loading ? (
              <LoadingSpinner text="Loading featured jobs..." />
            ) : featuredJobs.length === 0 ? (
              <div className="card text-center" style={{ padding: "40px", color: "#64748b" }}>
                <Briefcase size={36} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
                <h3>No jobs posted yet.</h3>
                <p>Check back soon or post an opening as an employer.</p>
              </div>
            ) : (
              <div className="hh-jobs-grid">
                {featuredJobs.map((job) => (
                  <div key={job._id} className="hh-job-card card">
                    <div className="job-card-top">
                      <div className="company-logo-badge">
                        {job.company?.logo ? (
                          <img src={job.company.logo} alt={job.company.name} />
                        ) : (
                          <Building2 size={24} color="#1264c8" />
                        )}
                      </div>
                      <div className="job-badges">
                        <span className="badge badge-blue">{job.jobType}</span>
                        <span className="badge badge-gray">{job.workMode}</span>
                      </div>
                    </div>

                    <h3 className="job-title">
                      <Link to={`/jobs/${job._id}`}>{job.title}</Link>
                    </h3>

                    <div className="job-company-name">
                      {job.company?.name || "HireHub Employer"}
                    </div>

                    <div className="job-meta-row">
                      <span className="meta-item">
                        <MapPin size={14} />
                        {job.location}
                      </span>
                      {job.salary?.max > 0 && (
                        <span className="meta-item salary-meta">
                          ${job.salary.min ? `${(job.salary.min / 1000).toFixed(0)}k - ` : ""}
                          ${(job.salary.max / 1000).toFixed(0)}k/{job.salary.period}
                        </span>
                      )}
                    </div>

                    <div className="job-skills-row">
                      {job.skills?.slice(0, 3).map((s, idx) => (
                        <span key={idx} className="skill-pill">
                          {s}
                        </span>
                      ))}
                    </div>

                    <div className="job-card-footer">
                      <span className="posted-time">
                        <Clock size={13} />
                        {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                      <Link to={`/jobs/${job._id}`} className="btn btn-outline-primary btn-sm">
                        View Role
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Explore Categories */}
        <section className="hh-section bg-alt">
          <div className="container">
            <div className="hh-section-header text-center">
              <div>
                <span className="section-eyebrow">EXPLORE ROLES</span>
                <h2 className="section-title">Popular Job Categories</h2>
                <p className="section-desc">
                  Find roles tailored to your specialty across engineering, product, and business.
                </p>
              </div>
            </div>

            <div className="hh-categories-grid">
              {categories.map((cat, idx) => (
                <div
                  key={idx}
                  className="hh-category-card card"
                  onClick={() => navigate(`/jobs?category=${encodeURIComponent(cat.name)}`)}
                >
                  <div className="cat-icon-wrapper">
                    <Briefcase size={22} color="#1264c8" />
                  </div>
                  <h4 className="cat-name">{cat.name}</h4>
                  <span className="cat-count">{cat.count} Open Roles</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why HireHub Value Pillars */}
        <section className="hh-section">
          <div className="container">
            <div className="hh-pillars-layout">
              <div className="pillars-intro">
                <span className="section-eyebrow">A BETTER WAY TO HIRE</span>
                <h2 className="section-title">Designed for trust, speed, and fairness.</h2>
                <p className="section-desc">
                  Unlike traditional cluttered boards, HireHub eliminates spam listings and opaque application processes.
                </p>
                <div className="pillars-list">
                  <div className="pillar-item">
                    <CheckCircle2 size={20} color="#10b981" />
                    <div>
                      <strong>Verified Employer Profiles</strong>
                      <p>Every recruiter and company undergoes validation to guarantee legitimate job postings.</p>
                    </div>
                  </div>

                  <div className="pillar-item">
                    <CheckCircle2 size={20} color="#10b981" />
                    <div>
                      <strong>Transparent Application Tracking</strong>
                      <p>Always know whether your application is under review, shortlisted, or scheduled for interview.</p>
                    </div>
                  </div>

                  <div className="pillar-item">
                    <CheckCircle2 size={20} color="#10b981" />
                    <div>
                      <strong>One-Click Secure Resume Submissions</strong>
                      <p>Store and update your profile resume, applying to matched roles in seconds.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pillars-cta-card card">
                <h3>For Hiring Teams</h3>
                <p>
                  Reach qualified developers, designers, and managers ready to make an immediate impact.
                </p>
                <ul className="cta-benefits">
                  <li>Instant job publication</li>
                  <li>Integrated candidate tracking dashboard</li>
                  <li>No spam applicants — verified email candidates</li>
                  <li>Direct candidate status communication</li>
                </ul>
                <Link to="/signup?role=employer" className="btn btn-primary" style={{ width: "100%" }}>
                  Post Your First Job
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
