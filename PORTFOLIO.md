# HireHub — Developer Portfolio Case Study

> **Project Name**: HireHub — Full-Stack Career & Recruitment Platform  
> **Tech Stack**: MongoDB, Express.js 5, React 19, Node.js, Nodemailer, Vite  
> **Role**: Full-Stack Engineer / MERN Developer *(Please review & confirm your role)*  
> **Repository**: [GitHub Repository URL Placeholder]  
> **Live Demo**: [Live Deployment URL Placeholder]  

---

## 1. Executive Summary

HireHub is a production-grade MERN stack recruitment portal connecting job seekers with verified employers. The application features role-based access control (Candidate, Recruiter, Admin), cryptographically secure single-use email verification, a responsive job discovery engine with faceted filtering, and end-to-end applicant tracking from submission to interview offer.

---

## 2. Problem Statement & Motivation

Online job boards frequently face three distinct challenges:
1. **Unverified & Spam Accounts**: Fraudulent job listings and unverified applicant spam undermine trust.
2. **Disconnected Application Statuses**: Candidates rarely receive updates on application progress once submitted.
3. **Complex Recruiter Workflows**: Small-to-medium employers lack lightweight applicant tracking systems that allow them to manage listings and review resumes without high SaaS fees.

**HireHub** solves these problems by requiring single-use cryptographic email verification prior to platform access, structuring transparent application audit trails, and providing recruiters with direct candidate review pipelines.

---

## 3. Key Implemented Features

* **Multi-Role Authentication & Authorization**: Distinct candidate, recruiter, and administrator flows with role-specific navigation and protected routes.
* **Cryptographic Email Verification**: SHA-256 hashed 24-hour verification tokens with replay attack prevention and development fallback modes.
* **Job Discovery Engine**: Real-time keyword search, faceted filtering (categories, work modes, job types, salary thresholds), and server-side pagination.
* **Applicant Tracking System (ATS)**: Candidates track live status transitions (`Applied` &rarr; `Under Review` &rarr; `Shortlisted` &rarr; `Interview` &rarr; `Hired` / `Rejected`) with recruiter audit notes.
* **Employer Management**: Company profile creation, logo uploads, and job management dashboard with applicant metrics.
* **Administrative Oversight**: System-wide platform metrics, user activation/suspension toggles, and listing moderation.

---

## 4. Likely Areas of Contribution *(Confirm / Customize)*

* [x] **Full-Stack Architecture**: Designed RESTful API schemas and modular React component structure with Vite.
* [x] **Security Engineering**: Implemented bcrypt password hashing (12 rounds), stateless JWT authentication, and Express 5 rate limiting.
* [x] **Verification Pipeline**: Built cryptographically secure, single-use email verification using Node.js `crypto` and Nodemailer.
* [x] **Database Modeling**: Designed MongoDB schemas with compound indexes (`{ job: 1, candidate: 1 }` for duplicate application prevention) and atomic `$inc` updates.
* [x] **Automated Testing**: Created an automated test suite with 54 passing tests covering unit logic, middleware guards, and full candidate/recruiter workflows.

---

## 5. Technical Challenges Discovered & Solved

### Challenge 1: Single-Use Email Verification & Replay Attack Defense
* **Problem**: Storing raw verification tokens in the database exposes users if the database is read, and verification links could theoretically be reused if tokens aren't immediately invalidated.
* **Solution**: Generated tokens using `crypto.randomBytes(32)` (256 bits of entropy) and stored only their SHA-256 hash in MongoDB with a 24-hour TTL (`verificationTokenExpires`). Upon verification, the token is atomically cleared from the database, rendering any second click an invalid replay attack (`INVALID_TOKEN`).

### Challenge 2: Duplicate Application Prevention at the Database Layer
* **Problem**: Candidates clicking "Apply" multiple times or reloading could produce duplicate application records.
* **Solution**: Enforced a compound unique index on `{ job: 1, candidate: 1 }` in Mongoose alongside an application-level pre-check. Handled MongoDB duplicate key error code `11000` gracefully with a clear HTTP 409 Conflict response.

### Challenge 3: Vite Dev Server Proxying & Atlas Connection Resilience
* **Problem**: The Vite development server reported `AggregateError [ECONNREFUSED]` proxy errors when backend initialization crashed on initial database connection attempts.
* **Solution**: Refactored the database connection handler to log clear IP whitelisting instructions without terminating the Node server process, ensuring the dev proxy and health check endpoints remained responsive while network access was established.

---

## 6. Architecture & Security Highlights

* **Zero Plaintext Credentials**: Passwords hashed with bcrypt cost factor 12. Sensitive fields (`password`, `verificationToken`, `resetPasswordToken`) marked with `{ select: false }` in Mongoose.
* **Anti-Enumeration Safeguards**: Password recovery and verification resend endpoints return uniform HTTP 200 responses regardless of whether the email address exists.
* **Layered Route Protection**: Custom `requireVerified` middleware checks the live database state on all mutating routes, preventing stale JWTs from bypassing verification.
* **Strict Git Isolation**: Multi-tier `.gitignore` files prevent accidental leakage of `.env` files, user-uploaded resumes, and build artifacts.

---

## 7. Testing Summary

* **Unit Tests**: 14 tests verifying token randomness, deterministic hashing, 24-hour expiry calculations, input regexes, and dev preview fallbacks.
* **Middleware & Route Tests**: 3 tests verifying `requireVerified` blocks unverified users, allows verified users, and triggers HTTP 429 when rate limits are exceeded.
* **Integration Tests**: 19 tests covering registration, login prevention for unverified users, invalid/expired link rejections, replay attack defense, and password recovery.
* **End-to-End Workflow Tests**: 18 tests verifying the complete candidate and recruiter lifecycle, job posting, application submission, duplicate prevention, and status progression.
* **Total Automated Tests**: **54 / 54 PASSED (100% success rate)**.

---

## 8. Recommended Screenshots to Capture for Your Portfolio

1. **Homepage & Hero Section**: Showcasing modern typography, category cards, and featured jobs.
2. **Job Search & Filters**: Demonstrating keyword search, category pills, salary slider, and responsive grid.
3. **Job Detail & Application Modal**: Highlighting detailed job requirements, company overview, and resume attachment.
4. **Candidate Dashboard**: Displaying submitted applications and real-time status badges (`Interviewing`, `Shortlisted`).
5. **Recruiter Job Management**: Showing active listings, applicant counts, and candidate pipeline review.
6. **Email Verification Notice**: Demonstrating the responsive HTML email template and verification landing page.

---

## 9. Resume & Portfolio Bullet Points

### Resume Project Entry:
```text
HireHub — Full-Stack Recruitment & Career Portal (MERN Stack)
• Developed a full-featured job portal using React 19, Express 5, Node.js, and MongoDB Atlas supporting multi-role authentication for candidates, recruiters, and administrators.
• Engineered a secure email verification and password recovery system using single-use SHA-256 hashed tokens, 24-hour expiration, and Express rate limiting to prevent replay and brute-force attacks.
• Built candidate tracking pipelines with atomic status updates, compound MongoDB indexes preventing duplicate applications, and role-based middleware guards across 30+ REST API endpoints.
• Authored comprehensive automated test suites covering unit logic, security middleware, and end-to-end hiring workflows with 100% pass rate across 54 test scenarios.
```

---

## 10. Suggested Interview Talking Points

* **"Tell me about a challenging security challenge you solved in this project."**  
  *Talk about the single-use token architecture: generating 256-bit cryptographic entropy, storing only SHA-256 hashes in MongoDB, unsetting the token upon verification to prevent replay attacks, and returning uniform responses to prevent user email enumeration.*
* **"How did you handle role-based access control?"**  
  *Explain how `protect` verifies JWT integrity while fetching the latest user document from MongoDB, followed by `requireVerified` checking verified status, and `authorize(...roles)` enforcing role boundaries.*
* **"How did you design the database schemas for scalability?"**  
  *Mention compound indexes like `{ job: 1, candidate: 1 }` on applications, foreign key references with selective field population (`.populate("company", "name logo")`), and atomic counter increments (`$inc: { applicationsCount: 1 }`).*
