import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Unauthorized = () => {
  const { user } = useAuth();

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="page-content" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 20px" }}>
        <div className="card text-center" style={{ maxWidth: "520px", padding: "48px 36px" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <ShieldAlert size={36} color="#dc2626" />
          </div>

          <span style={{ fontSize: "12px", letterSpacing: "1px", textTransform: "uppercase", color: "#dc2626", fontWeight: 700 }}>
            403 ACCESS DENIED
          </span>
          <h1 style={{ fontSize: "26px", color: "var(--hh-navy)", margin: "8px 0 12px" }}>
            Restricted Authorization
          </h1>
          <p style={{ color: "#64748b", fontSize: "14px", lineHeight: "1.6", marginBottom: "28px" }}>
            You do not possess permission to access this administrative or role-restricted page.
            {user && (
              <span> You are currently authenticated as <strong>{user.role}</strong>.</span>
            )}
          </p>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/" className="btn btn-secondary btn-sm">
              <Home size={14} /> HireHub Home
            </Link>
            {user && (
              <Link
                to={
                  user.role === "admin"
                    ? "/admin/dashboard"
                    : user.role === "recruiter"
                    ? "/recruiter/dashboard"
                    : "/candidate/dashboard"
                }
                className="btn btn-primary btn-sm"
              >
                Go to My Dashboard
              </Link>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Unauthorized;
