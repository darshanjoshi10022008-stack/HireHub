import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Briefcase,
  Building2,
  Bookmark,
  FileText,
  User,
  LogOut,
  PlusCircle,
  Shield,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout, isCandidate, isRecruiter, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="hh-navbar-wrapper">
      <div className="container hh-navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="hh-navbar-brand">
          <div className="hh-brand-icon">
            <Briefcase size={20} color="#1264c8" />
          </div>
          <span className="hh-brand-name">HireHub</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hh-nav-links">
          <Link
            to="/jobs"
            className={`hh-nav-link ${isActive("/jobs") ? "active" : ""}`}
          >
            Find Jobs
          </Link>
          <Link
            to="/companies"
            className={`hh-nav-link ${isActive("/companies") ? "active" : ""}`}
          >
            Companies
          </Link>

          {isCandidate && (
            <>
              <Link
                to="/candidate/applications"
                className={`hh-nav-link ${
                  isActive("/candidate/applications") ? "active" : ""
                }`}
              >
                Applications
              </Link>
              <Link
                to="/candidate/saved-jobs"
                className={`hh-nav-link ${
                  isActive("/candidate/saved-jobs") ? "active" : ""
                }`}
              >
                Saved Jobs
              </Link>
            </>
          )}

          {isRecruiter && (
            <>
              <Link
                to="/recruiter/dashboard"
                className={`hh-nav-link ${
                  isActive("/recruiter/dashboard") ? "active" : ""
                }`}
              >
                Recruiter Hub
              </Link>
              <Link
                to="/recruiter/applications"
                className={`hh-nav-link ${
                  isActive("/recruiter/applications") ? "active" : ""
                }`}
              >
                Candidates
              </Link>
            </>
          )}

          {isAdmin && (
            <Link
              to="/admin/dashboard"
              className={`hh-nav-link ${
                isActive("/admin/dashboard") ? "active" : ""
              }`}
            >
              Admin Center
            </Link>
          )}
        </nav>

        {/* Right Action Buttons */}
        <div className="hh-nav-actions">
          {user ? (
            <div className="hh-user-menu">
              {isRecruiter && (
                <Link to="/recruiter/jobs/new" className="btn btn-primary btn-sm">
                  <PlusCircle size={16} />
                  <span>Post a Job</span>
                </Link>
              )}

              <div
                className="hh-user-avatar-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="hh-avatar-circle">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <span className="hh-user-name">{user.name.split(" ")[0]}</span>
                <ChevronDown size={14} />
              </div>

              {dropdownOpen && (
                <div
                  className="hh-dropdown-menu"
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <div className="hh-dropdown-header">
                    <strong>{user.name}</strong>
                    <span className="hh-dropdown-role">
                      {isCandidate
                        ? "Candidate"
                        : isRecruiter
                        ? "Recruiter"
                        : "Administrator"}
                    </span>
                    <span className="hh-dropdown-email">{user.email}</span>
                  </div>

                  <div className="hh-dropdown-divider" />

                  {isCandidate && (
                    <>
                      <Link
                        to="/candidate/dashboard"
                        className="hh-dropdown-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <User size={15} /> Dashboard
                      </Link>
                      <Link
                        to="/candidate/profile"
                        className="hh-dropdown-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <FileText size={15} /> My Profile & Resume
                      </Link>
                      <Link
                        to="/candidate/saved-jobs"
                        className="hh-dropdown-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Bookmark size={15} /> Saved Jobs
                      </Link>
                    </>
                  )}

                  {isRecruiter && (
                    <>
                      <Link
                        to="/recruiter/dashboard"
                        className="hh-dropdown-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Briefcase size={15} /> Recruiter Dashboard
                      </Link>
                      <Link
                        to="/recruiter/jobs"
                        className="hh-dropdown-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <FileText size={15} /> Manage Job Postings
                      </Link>
                      <Link
                        to="/recruiter/company"
                        className="hh-dropdown-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Building2 size={15} /> Company Profile
                      </Link>
                    </>
                  )}

                  {isAdmin && (
                    <Link
                      to="/admin/dashboard"
                      className="hh-dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Shield size={15} /> Admin Dashboard
                    </Link>
                  )}

                  <div className="hh-dropdown-divider" />

                  <button
                    className="hh-dropdown-item logout-btn"
                    onClick={() => {
                      setDropdownOpen(false);
                      handleLogout();
                    }}
                  >
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hh-guest-actions">
              <Link to="/login" className="btn btn-secondary btn-sm">
                Log In
              </Link>
              <Link to="/signup" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            className="hh-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="hh-mobile-drawer">
          <Link
            to="/jobs"
            className="hh-mobile-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            Find Jobs
          </Link>
          <Link
            to="/companies"
            className="hh-mobile-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            Companies
          </Link>

          {isCandidate && (
            <>
              <Link
                to="/candidate/dashboard"
                className="hh-mobile-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                Candidate Dashboard
              </Link>
              <Link
                to="/candidate/profile"
                className="hh-mobile-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                Profile & Resume
              </Link>
              <Link
                to="/candidate/applications"
                className="hh-mobile-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                My Applications
              </Link>
            </>
          )}

          {isRecruiter && (
            <>
              <Link
                to="/recruiter/dashboard"
                className="hh-mobile-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                Recruiter Dashboard
              </Link>
              <Link
                to="/recruiter/jobs/new"
                className="hh-mobile-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                Post a Job
              </Link>
              <Link
                to="/recruiter/company"
                className="hh-mobile-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                Company Profile
              </Link>
            </>
          )}

          {isAdmin && (
            <Link
              to="/admin/dashboard"
              className="hh-mobile-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              Admin Dashboard
            </Link>
          )}

          <div className="hh-mobile-divider" />

          {user ? (
            <button
              className="hh-mobile-link logout-btn"
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
            >
              Sign Out
            </button>
          ) : (
            <div className="hh-mobile-auth-row">
              <Link
                to="/login"
                className="btn btn-secondary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="btn btn-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
