import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { jobApi, candidateApi } from "../api";
import { useAuth } from "../context/AuthContext";
import {
  Search,
  MapPin,
  Building2,
  Clock,
  Filter,
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LoadingSpinner from "../components/LoadingSpinner";
import "./Jobs.css";

const Jobs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isCandidate } = useAuth();

  // Filters state from URL or defaults
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [locationTerm, setLocationTerm] = useState(searchParams.get("location") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "All");
  const [jobType, setJobType] = useState(searchParams.get("jobType") || "All");
  const [workMode, setWorkMode] = useState(searchParams.get("workMode") || "All");
  const [experienceLevel, setExperienceLevel] = useState(searchParams.get("experienceLevel") || "All");
  const [salaryMin, setSalaryMin] = useState(searchParams.get("salaryMin") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");
  const [page, setPage] = useState(parseInt(searchParams.get("page")) || 1);

  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, limit: 10 });
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // Sync saved jobs if logged in as candidate
  useEffect(() => {
    if (isCandidate) {
      candidateApi
        .getSavedJobs()
        .then((res) => {
          if (res.success && res.savedJobs) {
            setSavedJobIds(new Set(res.savedJobs.map((j) => j._id)));
          }
        })
        .catch(() => {});
    }
  }, [isCandidate]);

  // Fetch jobs whenever filters or pagination change
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const params = {
          page,
          limit: 10,
          sort,
        };
        if (searchTerm.trim()) params.search = searchTerm.trim();
        if (locationTerm.trim()) params.location = locationTerm.trim();
        if (category !== "All") params.category = category;
        if (jobType !== "All") params.jobType = jobType;
        if (workMode !== "All") params.workMode = workMode;
        if (experienceLevel !== "All") params.experienceLevel = experienceLevel;
        if (salaryMin) params.salaryMin = salaryMin;

        // Update URL query string
        setSearchParams(params, { replace: true });

        const res = await jobApi.getJobs(params);
        if (res.success) {
          setJobs(res.jobs || []);
          setPagination(res.pagination || { total: 0, pages: 1, limit: 10 });
        }
      } catch (err) {
        console.error("Jobs fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [page, sort, category, jobType, workMode, experienceLevel, salaryMin]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    // Trigger re-fetch
    const params = {
      page: 1,
      limit: 10,
      sort,
    };
    if (searchTerm.trim()) params.search = searchTerm.trim();
    if (locationTerm.trim()) params.location = locationTerm.trim();
    if (category !== "All") params.category = category;
    if (jobType !== "All") params.jobType = jobType;
    if (workMode !== "All") params.workMode = workMode;
    if (experienceLevel !== "All") params.experienceLevel = experienceLevel;
    if (salaryMin) params.salaryMin = salaryMin;

    setSearchParams(params);
    jobApi.getJobs(params).then((res) => {
      if (res.success) {
        setJobs(res.jobs || []);
        setPagination(res.pagination || { total: 0, pages: 1, limit: 10 });
      }
    });
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setLocationTerm("");
    setCategory("All");
    setJobType("All");
    setWorkMode("All");
    setExperienceLevel("All");
    setSalaryMin("");
    setSort("newest");
    setPage(1);
  };

  const handleToggleSave = async (jobId) => {
    if (!user) {
      alert("Please sign in as a candidate to save jobs.");
      return;
    }
    if (!isCandidate) {
      alert("Only candidate accounts can bookmark jobs.");
      return;
    }

    try {
      const res = await candidateApi.toggleSaveJob(jobId);
      if (res.success) {
        setSavedJobIds((prev) => {
          const updated = new Set(prev);
          if (res.isSaved) {
            updated.add(jobId);
          } else {
            updated.delete(jobId);
          }
          return updated;
        });
      }
    } catch (err) {
      alert(err.message || "Failed to update saved job.");
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="page-content hh-jobs-page">
        <div className="container">
          {/* Top Search Filter Header */}
          <div className="hh-browse-header card">
            <form className="hh-inline-search" onSubmit={handleSearchSubmit}>
              <div className="search-input-wrap">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="Job title, keywords, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="search-input-wrap">
                <MapPin size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="City, state, or 'Remote'..."
                  value={locationTerm}
                  onChange={(e) => setLocationTerm(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary">
                Search
              </button>
            </form>
          </div>

          {/* Main Content Layout: Sidebar + Listings */}
          <div className="hh-jobs-layout">
            {/* Filter Sidebar */}
            <aside className="hh-jobs-sidebar">
              <div className="sidebar-header">
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Filter size={18} color="#1264c8" />
                  <h3 style={{ fontSize: "16px", margin: 0, fontWeight: 700 }}>Filters</h3>
                </div>
                <button
                  type="button"
                  className="reset-btn"
                  onClick={handleResetFilters}
                  title="Reset all filters"
                >
                  <RotateCcw size={13} /> Reset
                </button>
              </div>

              {/* Category Filter */}
              <div className="filter-group">
                <label className="filter-title">Category</label>
                <select
                  className="form-select"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="All">All Categories</option>
                  <option value="Technology & IT">Technology & IT</option>
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="Product & Design">Product & Design</option>
                  <option value="Marketing & Sales">Marketing & Sales</option>
                  <option value="Finance & Accounting">Finance & Accounting</option>
                  <option value="Human Resources">Human Resources</option>
                </select>
              </div>

              {/* Job Type Filter */}
              <div className="filter-group">
                <label className="filter-title">Job Type</label>
                <select
                  className="form-select"
                  value={jobType}
                  onChange={(e) => {
                    setJobType(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="All">All Types</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                  <option value="Freelance">Freelance</option>
                </select>
              </div>

              {/* Work Mode */}
              <div className="filter-group">
                <label className="filter-title">Work Arrangement</label>
                <select
                  className="form-select"
                  value={workMode}
                  onChange={(e) => {
                    setWorkMode(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="All">All Modes</option>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="On-site">On-site</option>
                </select>
              </div>

              {/* Experience Level */}
              <div className="filter-group">
                <label className="filter-title">Experience Level</label>
                <select
                  className="form-select"
                  value={experienceLevel}
                  onChange={(e) => {
                    setExperienceLevel(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="All">All Levels</option>
                  <option value="Entry Level">Entry Level</option>
                  <option value="Mid Level">Mid Level</option>
                  <option value="Senior Level">Senior Level</option>
                  <option value="Lead / Executive">Lead / Executive</option>
                </select>
              </div>

              {/* Minimum Salary Filter */}
              <div className="filter-group">
                <label className="filter-title">Minimum Salary (USD/yr)</label>
                <select
                  className="form-select"
                  value={salaryMin}
                  onChange={(e) => {
                    setSalaryMin(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">Any Salary</option>
                  <option value="50000">$50,000+</option>
                  <option value="80000">$80,000+</option>
                  <option value="100000">$100,000+</option>
                  <option value="120000">$120,000+</option>
                  <option value="150000">$150,000+</option>
                </select>
              </div>
            </aside>

            {/* Results Column */}
            <section className="hh-jobs-content">
              {/* Results Top Bar */}
              <div className="results-top-bar">
                <div className="results-count">
                  Showing <strong>{jobs.length}</strong> of <strong>{pagination.total}</strong> opportunities
                </div>

                <div className="sort-box">
                  <label>Sort by:</label>
                  <select
                    value={sort}
                    onChange={(e) => {
                      setSort(e.target.value);
                      setPage(1);
                    }}
                    className="form-select form-select-sm"
                  >
                    <option value="newest">Newest First</option>
                    <option value="salaryHigh">Highest Salary</option>
                    <option value="popular">Most Viewed</option>
                  </select>
                </div>
              </div>

              {/* Job Listings List */}
              {loading ? (
                <LoadingSpinner text="Searching jobs..." />
              ) : jobs.length === 0 ? (
                <div className="card text-center" style={{ padding: "60px 20px" }}>
                  <Search size={40} color="#94a3b8" style={{ margin: "0 auto 16px" }} />
                  <h3 style={{ fontSize: "18px", color: "#0b2749", marginBottom: "8px" }}>
                    No jobs match your criteria
                  </h3>
                  <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "20px" }}>
                    Try broadening your keywords or resetting filters to explore all openings.
                  </p>
                  <button onClick={handleResetFilters} className="btn btn-secondary btn-sm" style={{ margin: "0 auto" }}>
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="jobs-list">
                  {jobs.map((job) => (
                    <article key={job._id} className="job-list-card card">
                      <div className="job-card-main">
                        <div className="job-company-logo">
                          {job.company?.logo ? (
                            <img src={job.company.logo} alt={job.company.name} />
                          ) : (
                            <Building2 size={26} color="#1264c8" />
                          )}
                        </div>

                        <div className="job-info">
                          <div className="job-header-row">
                            <div>
                              <h2 className="job-title-link">
                                <Link to={`/jobs/${job._id}`}>{job.title}</Link>
                              </h2>
                              <div className="company-subline">
                                <Link
                                  to={`/companies/${job.company?._id}`}
                                  className="company-name"
                                >
                                  {job.company?.name || "HireHub Verified Company"}
                                </Link>
                                <span className="meta-sep">•</span>
                                <span className="location-tag">
                                  <MapPin size={13} /> {job.location}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              className={`bookmark-btn ${
                                savedJobIds.has(job._id) ? "saved" : ""
                              }`}
                              onClick={() => handleToggleSave(job._id)}
                              aria-label="Save this job"
                              title={
                                savedJobIds.has(job._id) ? "Saved" : "Save for later"
                              }
                            >
                              {savedJobIds.has(job._id) ? (
                                <BookmarkCheck size={20} color="#1264c8" />
                              ) : (
                                <Bookmark size={20} />
                              )}
                            </button>
                          </div>

                          <div className="job-tag-strip">
                            <span className="badge badge-blue">{job.jobType}</span>
                            <span className="badge badge-gray">{job.workMode}</span>
                            <span className="badge badge-purple">{job.experienceLevel}</span>

                            {job.salary?.max > 0 && (
                              <span className="badge badge-green">
                                ${job.salary.min ? `${(job.salary.min / 1000).toFixed(0)}k - ` : ""}
                                ${(job.salary.max / 1000).toFixed(0)}k/{job.salary.period}
                              </span>
                            )}
                          </div>

                          <p className="job-excerpt">
                            {job.description.length > 200
                              ? `${job.description.substring(0, 200)}...`
                              : job.description}
                          </p>

                          <div className="job-footer-meta">
                            <div className="skills-inline">
                              {job.skills?.slice(0, 4).map((s, idx) => (
                                <span key={idx} className="skill-pill">
                                  {s}
                                </span>
                              ))}
                            </div>

                            <div className="card-action-side">
                              <span className="posted-ago">
                                <Clock size={13} />
                                {new Date(job.createdAt).toLocaleDateString()}
                              </span>
                              <Link to={`/jobs/${job._id}`} className="btn btn-primary btn-sm">
                                Apply Now
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {/* Pagination Controls */}
              {pagination.pages > 1 && (
                <div className="pagination-bar">
                  <button
                    className="pagination-btn"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                  >
                    <ChevronLeft size={16} /> Previous
                  </button>

                  <div className="page-indicator">
                    Page {page} of {pagination.pages}
                  </div>

                  <button
                    className="pagination-btn"
                    disabled={page >= pagination.pages}
                    onClick={() => setPage(page + 1)}
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Jobs;
