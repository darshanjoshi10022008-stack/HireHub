import React from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const Terms = () => {
  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="page-content" style={{ padding: "60px 0 80px" }}>
        <div className="container" style={{ maxWidth: "800px" }}>
          <div className="card" style={{ padding: "40px 48px" }}>
            <h1 style={{ fontSize: "28px", fontWeight: 850, color: "var(--hh-navy)", marginBottom: "8px" }}>
              Terms of Service
            </h1>
            <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "32px" }}>
              Effective Date: October 2026 • HireHub Platform Terms
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "24px", color: "#334155", lineHeight: "1.7", fontSize: "15px" }}>
              <section>
                <h3 style={{ fontSize: "18px", color: "var(--hh-navy)", fontWeight: 700, marginBottom: "8px" }}>
                  1. Acceptance of Terms
                </h3>
                <p>
                  By creating an account, browsing listings, or using any feature on the HireHub platform, you agree to comply with and be bound by these Terms of Service. If you do not accept these terms, you must discontinue using HireHub.
                </p>
              </section>

              <section>
                <h3 style={{ fontSize: "18px", color: "var(--hh-navy)", fontWeight: 700, marginBottom: "8px" }}>
                  2. User Accounts & Eligibility
                </h3>
                <p>
                  Candidates and employers are responsible for maintaining the confidentiality of their credentials. You must provide truthful, accurate, and complete information when creating accounts, submitting job applications, or posting vacancies.
                </p>
              </section>

              <section>
                <h3 style={{ fontSize: "18px", color: "var(--hh-navy)", fontWeight: 700, marginBottom: "8px" }}>
                  3. Employer & Recruiter Responsibilities
                </h3>
                <p>
                  Recruiters agree only to post genuine employment vacancies that comply with local labor regulations. HireHub strictly prohibits fraudulent listings, multi-level marketing schemes, or requests for upfront candidate fees.
                </p>
              </section>

              <section>
                <h3 style={{ fontSize: "18px", color: "var(--hh-navy)", fontWeight: 700, marginBottom: "8px" }}>
                  4. Intellectual Property & Resumes
                </h3>
                <p>
                  Candidates retain ownership of resumes and portfolio documents uploaded to HireHub. By submitting an application, you grant authorization to the designated employer to evaluate your materials for hiring purposes.
                </p>
              </section>

              <section>
                <h3 style={{ fontSize: "18px", color: "var(--hh-navy)", fontWeight: 700, marginBottom: "8px" }}>
                  5. Account Suspension
                </h3>
                <p>
                  HireHub reserves the right to suspend or remove any account or job listing that violates platform security policies or user safety standards.
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

export default Terms;
