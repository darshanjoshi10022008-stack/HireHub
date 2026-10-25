import React from "react";
import { Link } from "react-router-dom";
import { Briefcase, ShieldCheck, Heart } from "lucide-react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="hh-footer">
      <div className="container">
        <div className="hh-footer-grid">
          {/* Brand Info */}
          <div className="hh-footer-col brand-col">
            <Link to="/" className="hh-footer-brand">
              <div className="hh-brand-icon">
                <Briefcase size={18} color="#1264c8" />
              </div>
              <span>HireHub</span>
            </Link>
            <p className="hh-footer-desc">
              The modern employment portal designed for transparent hiring. Connecting high-caliber candidates with trusted companies worldwide.
            </p>
            <div className="hh-security-badge">
              <ShieldCheck size={16} color="#10b981" />
              <span>Verified Employers & Authenticated Resumes</span>
            </div>
          </div>

          {/* Job Seekers */}
          <div className="hh-footer-col">
            <h4>For Job Seekers</h4>
            <ul>
              <li>
                <Link to="/jobs">Browse All Jobs</Link>
              </li>
              <li>
                <Link to="/jobs?jobType=Internship">Internship Opportunities</Link>
              </li>
              <li>
                <Link to="/jobs?workMode=Remote">Remote Positions</Link>
              </li>
              <li>
                <Link to="/companies">Company Directory</Link>
              </li>
              <li>
                <Link to="/signup?role=candidate">Create Candidate Profile</Link>
              </li>
            </ul>
          </div>

          {/* Employers */}
          <div className="hh-footer-col">
            <h4>For Employers</h4>
            <ul>
              <li>
                <Link to="/signup?role=employer">Create Employer Account</Link>
              </li>
              <li>
                <Link to="/login?role=recruiter">Post an Opening</Link>
              </li>
              <li>
                <Link to="/recruiter/dashboard">Recruiter Dashboard</Link>
              </li>
              <li>
                <Link to="/companies">Browse Top Companies</Link>
              </li>
            </ul>
          </div>

          {/* Platform & Legal */}
          <div className="hh-footer-col">
            <h4>Platform & Trust</h4>
            <ul>
              <li>
                <Link to="/terms">Terms of Service</Link>
              </li>
              <li>
                <Link to="/privacy">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/resend-verification">Email Verification Help</Link>
              </li>
              <li>
                <a href="#support" onClick={(e) => { e.preventDefault(); alert("HireHub Support Desk: support@hirehub.com"); }}>
                  Help & Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="hh-footer-bottom">
          <p>© {new Date().getFullYear()} HireHub. All rights reserved.</p>
          <div className="hh-footer-meta">
            <span>Production MERN Stack</span>
            <span className="dot">•</span>
            <span>Enterprise Grade Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
