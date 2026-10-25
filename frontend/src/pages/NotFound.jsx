import React from "react";
import { Link } from "react-router-dom";
import { HelpCircle, Search, Home } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const NotFound = () => {
  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="page-content" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 20px" }}>
        <div className="card text-center" style={{ maxWidth: "500px", padding: "48px 36px" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <HelpCircle size={36} color="#1264c8" />
          </div>

          <span style={{ fontSize: "12px", letterSpacing: "1px", textTransform: "uppercase", color: "var(--hh-primary)", fontWeight: 700 }}>
            404 NOT FOUND
          </span>
          <h1 style={{ fontSize: "28px", color: "var(--hh-navy)", margin: "8px 0 12px" }}>
            Page Does Not Exist
          </h1>
          <p style={{ color: "#64748b", fontSize: "14px", lineHeight: "1.6", marginBottom: "28px" }}>
            The URL or page you requested could not be located. It may have moved or no longer exists.
          </p>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/" className="btn btn-primary btn-sm">
              <Home size={14} /> Return Home
            </Link>
            <Link to="/jobs" className="btn btn-secondary btn-sm">
              <Search size={14} /> Browse All Jobs
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
