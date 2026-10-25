import React from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const Privacy = () => {
  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="page-content" style={{ padding: "60px 0 80px" }}>
        <div className="container" style={{ maxWidth: "800px" }}>
          <div className="card" style={{ padding: "40px 48px" }}>
            <h1 style={{ fontSize: "28px", fontWeight: 850, color: "var(--hh-navy)", marginBottom: "8px" }}>
              Privacy Policy
            </h1>
            <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "32px" }}>
              Effective Date: October 2026 • HireHub Platform Privacy
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "24px", color: "#334155", lineHeight: "1.7", fontSize: "15px" }}>
              <section>
                <h3 style={{ fontSize: "18px", color: "var(--hh-navy)", fontWeight: 700, marginBottom: "8px" }}>
                  1. Information We Collect
                </h3>
                <p>
                  We collect account data (name, email address, password hashes), candidate profile information (resume files, educational background, work history, skills), and employer details (company name, logo, vacancies) to provide our job matching services.
                </p>
              </section>

              <section>
                <h3 style={{ fontSize: "18px", color: "var(--hh-navy)", fontWeight: 700, marginBottom: "8px" }}>
                  2. How We Use Your Data
                </h3>
                <p>
                  Your information is used solely to facilitate the job application process, communicate application statuses, enforce platform security, and verify accounts. We never sell personal information to third-party data brokers.
                </p>
              </section>

              <section>
                <h3 style={{ fontSize: "18px", color: "var(--hh-navy)", fontWeight: 700, marginBottom: "8px" }}>
                  3. Resume Privacy & Access Control
                </h3>
                <p>
                  Uploaded resumes are accessible only by the candidate and employers to whom the candidate has explicitly submitted an application. Unauthorized scraping of applicant details is strictly prohibited.
                </p>
              </section>

              <section>
                <h3 style={{ fontSize: "18px", color: "var(--hh-navy)", fontWeight: 700, marginBottom: "8px" }}>
                  4. Data Security
                </h3>
                <p>
                  We implement industry-standard cryptographic hashing (bcrypt) for passwords, signed JWT tokens for sessions, and tokenized email verification procedures.
                </p>
              </section>

              <section>
                <h3 style={{ fontSize: "18px", color: "var(--hh-navy)", fontWeight: 700, marginBottom: "8px" }}>
                  5. Contacting Us
                </h3>
                <p>
                  For privacy inquiries or data removal requests, contact our privacy officer at privacy@hirehub.com.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;
