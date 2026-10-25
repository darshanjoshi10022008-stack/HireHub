require("dns").setServers(["8.8.8.8", "8.8.4.4"]);
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const API_URL = "http://localhost:5000/api";

const runTests = async () => {
  console.log("=================================================");
  console.log("STARTING HIREHUB COMPREHENSIVE INTEGRATION TESTS");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName) => {
    if (condition) {
      console.log(`PASS: ${testName}`);
      passed++;
    } else {
      console.error(`FAIL: ${testName}`);
      failed++;
    }
  };

  try {
    // 1. Health check
    const healthRes = await fetch("http://localhost:5000/").then((r) => r.json());
    assert(healthRes.success === true, "Health Check - Server is running and responding");

    // 2. Public Jobs API
    const jobsRes = await fetch(`${API_URL}/jobs`).then((r) => r.json());
    assert(jobsRes.success === true && jobsRes.jobs.length > 0, "Public Jobs - Retrieved published jobs");

    // 3. Public Featured Jobs
    const featRes = await fetch(`${API_URL}/jobs/featured`).then((r) => r.json());
    assert(featRes.success === true && featRes.jobs.length > 0, "Featured Jobs - Retrieved homepage featured jobs");

    // 4. Public Categories
    const catRes = await fetch(`${API_URL}/jobs/categories`).then((r) => r.json());
    assert(catRes.success === true && catRes.categories.length > 0, "Categories - Retrieved job categories with counts");

    // 5. Test Candidate Registration
    const testEmail = `candidate_${Date.now()}@test.com`;
    const regRes = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Candidate",
        email: testEmail,
        password: "Password123!",
        role: "candidate",
      }),
    }).then((r) => r.json());

    assert(regRes.success === true && !!regRes.token, "Signup - Registered candidate successfully with token");
    const candidateToken = regRes.token;

    // 6. Test Duplicate Registration Prevention
    const dupRes = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Duplicate User",
        email: testEmail,
        password: "Password123!",
        role: "candidate",
      }),
    });
    assert(dupRes.status === 409, "Signup - Prevents duplicate account registration (409 Conflict)");

    // 7. Test Login with Wrong Password
    const badLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: "WrongPassword123!",
      }),
    });
    assert(badLoginRes.status === 401, "Auth - Rejects login with wrong password (401 Unauthorized)");

    // 8. Test Login with Valid Credentials
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: "Password123!",
      }),
    }).then((r) => r.json());
    assert(loginRes.success === true && !!loginRes.token, "Login - Successful login with valid password");

    // 9. Test Verification Token
    const dbUser = await mongoose.connect(process.env.MONGO_URL).then(async () => {
      const User = require("../models/User");
      return User.findOne({ email: testEmail }).select("+verificationToken");
    });
    assert(!!dbUser, "Database - Candidate record persisted in MongoDB");

    // 10. Test Recruiter Login
    const recLogin = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "recruiter@hirehub.com",
        password: "RecruiterPass123!",
      }),
    }).then((r) => r.json());
    assert(recLogin.success === true && recLogin.user.role === "recruiter", "Recruiter Login - Logged in as recruiter");
    const recruiterToken = recLogin.token;

    // 11. Test Admin Login
    const adminLogin = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@hirehub.com",
        password: "AdminPass123!",
      }),
    }).then((r) => r.json());
    assert(adminLogin.success === true && adminLogin.user.role === "admin", "Admin Login - Logged in as admin");
    const adminToken = adminLogin.token;

    // 12. Authorization Test: Candidate accessing recruiter-only route is blocked
    const candAccessRecruiter = await fetch(`${API_URL}/jobs/recruiter/my-jobs`, {
      headers: { Authorization: `Bearer ${candidateToken}` },
    });
    assert(
      candAccessRecruiter.status === 403,
      "Authorization - Candidate forbidden from recruiter endpoint (403 Forbidden)"
    );

    // 13. Authorization Test: Recruiter accessing admin route is blocked
    const recAccessAdmin = await fetch(`${API_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    assert(
      recAccessAdmin.status === 403,
      "Authorization - Recruiter forbidden from admin endpoint (403 Forbidden)"
    );

    // 14. Authorization Test: Admin can access admin stats
    const adminStats = await fetch(`${API_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    }).then((r) => r.json());
    assert(adminStats.success === true && adminStats.stats.totalUsers > 0, "Admin - Successfully accessed platform stats");

    // 15. Candidate Profile update & Bookmark
    const targetJobId = jobsRes.jobs[0]._id;
    const saveJobRes = await fetch(`${API_URL}/candidate/saved-jobs/${targetJobId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${candidateToken}` },
    }).then((r) => r.json());
    assert(saveJobRes.success === true && saveJobRes.isSaved === true, "Candidate - Bookmarked job successfully");

    // 16. Candidate Application Workflow
    // First simulate profile resume
    const CandidateProfile = require("../models/CandidateProfile");
    await CandidateProfile.findOneAndUpdate(
      { user: dbUser._id },
      {
        headline: "Full Stack Engineer",
        skills: ["React", "Node.js", "Express"],
        resume: { filename: "test_resume.pdf", originalName: "Test_Resume.pdf", url: "/uploads/resumes/sample.pdf" },
      }
    );

    const applyRes = await fetch(`${API_URL}/applications/apply/${targetJobId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${candidateToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ coverNote: "I am an enthusiastic full-stack developer eager to join." }),
    }).then((r) => r.json());
    assert(applyRes.success === true, "Application - Candidate successfully applied to job");

    // 17. Duplicate Application Prevention
    const dupApply = await fetch(`${API_URL}/applications/apply/${targetJobId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${candidateToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ coverNote: "Applying again" }),
    });
    assert(dupApply.status === 409, "Application - Prevents duplicate job applications (409 Conflict)");

    // 18. Recruiter Review & Status Update
    const recApps = await fetch(`${API_URL}/applications/recruiter`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    }).then((r) => r.json());
    assert(recApps.success === true && recApps.applications.length > 0, "Recruiter - Retrieved candidate applications");

    const appToUpdate = recApps.applications[0];
    const updateStatusRes = await fetch(`${API_URL}/applications/${appToUpdate._id}/status`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${recruiterToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "Shortlisted", note: "Strong technical background" }),
    }).then((r) => r.json());
    assert(updateStatusRes.success === true && updateStatusRes.application.status === "Shortlisted", "Workflow - Recruiter updated application status to Shortlisted");

    // 19. Candidate verifies updated status
    const candApps = await fetch(`${API_URL}/applications/my-applications`, {
      headers: { Authorization: `Bearer ${candidateToken}` },
    }).then((r) => r.json());
    const matchedApp = candApps.applications.find((a) => a._id === appToUpdate._id);
    assert(matchedApp && matchedApp.status === "Shortlisted", "Candidate - Sees live updated status (Shortlisted)");

    // 20. Forgot Password Flow
    const forgotRes = await fetch(`${API_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail }),
    }).then((r) => r.json());
    assert(forgotRes.success === true, "Forgot Password - Handled recovery request safely without email enumeration");

    console.log("\n=================================================");
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log("=================================================\n");

    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error("Test execution exception:", error);
    process.exit(1);
  }
};

runTests();
