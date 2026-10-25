require("dns").setServers(["8.8.8.8", "8.8.4.4"]);
require("dotenv").config();
const mongoose = require("mongoose");
const crypto = require("crypto");
const User = require("../models/User");
const Job = require("../models/Job");
const Application = require("../models/Application");
const Company = require("../models/Company");
const CandidateProfile = require("../models/CandidateProfile");

const API_URL = `http://localhost:${process.env.PORT || 5000}/api`;

const runJobPortalWorkflowTests = async () => {
  console.log("============================================================");
  console.log(" HIREHUB COMPLETE JOB PORTAL E2E WORKFLOW TEST SUITE");
  console.log("============================================================\n");

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, detail = "") => {
    if (condition) {
      console.log(`✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`✗ FAIL: ${testName} ${detail ? `(${detail})` : ""}`);
      failed++;
    }
  };

  await mongoose.connect(process.env.MONGO_URL);

  const timestamp = Date.now();
  const candidateEmail = `workflow_cand_${timestamp}@test.com`;
  const recruiterEmail = `workflow_recr_${timestamp}@test.com`;
  const otherRecruiterEmail = `workflow_other_${timestamp}@test.com`;
  const testPassword = "Password123!@#";

  let candidateToken = "";
  let recruiterToken = "";
  let otherRecruiterToken = "";
  let candidateId = "";
  let recruiterId = "";
  let createdJobId = "";
  let createdApplicationId = "";

  try {
    // -------------------------------------------------------------
    // STEP 1: Candidate Signup & Verification
    // -------------------------------------------------------------
    const candRegRes = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Candidate Flow",
        email: candidateEmail,
        password: testPassword,
        role: "candidate",
      }),
    });
    const candRegData = await candRegRes.json();
    assert(candRegRes.status === 201 && candRegData.user.isEmailVerified === false, "1. Candidate signs up in unverified state");

    // Manually mark candidate verified for workflow testing
    const candUser = await User.findOne({ email: candidateEmail });
    candUser.isEmailVerified = true;
    await candUser.save();
    candidateId = candUser._id.toString();

    // Candidate Login
    const candLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: candidateEmail, password: testPassword }),
    });
    const candLoginData = await candLoginRes.json();
    assert(candLoginRes.status === 200 && !!candLoginData.token, "2. Verified candidate logs in and receives JWT");
    candidateToken = candLoginData.token;

    // -------------------------------------------------------------
    // STEP 2: Recruiter Signup & Verification
    // -------------------------------------------------------------
    const recrRegRes = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Recruiter Flow",
        email: recruiterEmail,
        password: testPassword,
        role: "recruiter",
      }),
    });
    const recrRegData = await recrRegRes.json();
    assert(recrRegRes.status === 201, "3. Recruiter signs up successfully");

    const recrUser = await User.findOne({ email: recruiterEmail });
    recrUser.isEmailVerified = true;
    await recrUser.save();
    recruiterId = recrUser._id.toString();

    // Recruiter Login
    const recrLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: recruiterEmail, password: testPassword }),
    });
    const recrLoginData = await recrLoginRes.json();
    assert(recrLoginRes.status === 200 && !!recrLoginData.token, "4. Verified recruiter logs in and receives JWT");
    recruiterToken = recrLoginData.token;

    // Third party recruiter for authorization checks
    const otherUser = await User.create({
      name: "Other Recruiter",
      email: otherRecruiterEmail,
      password: "hashedPassword123",
      role: "recruiter",
      isEmailVerified: true,
    });
    const jwt = require("jsonwebtoken");
    otherRecruiterToken = jwt.sign({ userId: otherUser._id.toString(), role: "recruiter" }, process.env.JWT_SECRET);

    // -------------------------------------------------------------
    // STEP 3: Recruiter sets up company & posts a job
    // -------------------------------------------------------------
    const jobTitle = `Senior Full Stack Developer ${timestamp}`;
    const createJobRes = await fetch(`${API_URL}/jobs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${recruiterToken}`,
      },
      body: JSON.stringify({
        title: jobTitle,
        category: "Technology",
        jobType: "Full-time",
        workMode: "Remote",
        location: "New York, NY",
        experienceLevel: "Senior Level",
        salaryMin: 120000,
        salaryMax: 160000,
        description: "We are seeking a senior full-stack engineer to build state of the art web applications.",
        requirements: "5+ years React, Node.js, and MongoDB experience",
        responsibilities: "Architect scalable backend services and responsive frontend components",
        skills: "React, Node.js, Express, MongoDB, TypeScript",
      }),
    });
    const createJobData = await createJobRes.json();
    assert(createJobRes.status === 201 && createJobData.success === true, "5. Recruiter creates job listing with complete metadata");
    createdJobId = createJobData.job._id;

    // -------------------------------------------------------------
    // STEP 4: Candidate searches for and opens the job listing
    // -------------------------------------------------------------
    const searchRes = await fetch(`${API_URL}/jobs?search=${encodeURIComponent(jobTitle)}`);
    const searchData = await searchRes.json();
    assert(
      searchRes.status === 200 && searchData.jobs.some((j) => j._id === createdJobId),
      "6. Candidate searches for job and finds the published listing"
    );

    const detailRes = await fetch(`${API_URL}/jobs/${createdJobId}`);
    const detailData = await detailRes.json();
    assert(
      detailRes.status === 200 && detailData.job.title === jobTitle,
      "7. Candidate opens job details and receives comprehensive job specification"
    );

    // -------------------------------------------------------------
    // STEP 5: Candidate submits application
    // -------------------------------------------------------------
    // Seed candidate profile with default resume
    await CandidateProfile.findOneAndUpdate(
      { user: candUser._id },
      {
        user: candUser._id,
        headline: "Full Stack Engineer",
        resume: {
          filename: "test_resume.pdf",
          originalName: "Alex_Johnson_Resume.pdf",
          url: "/uploads/resumes/sample_resume.pdf",
        },
      },
      { upsert: true }
    );

    const applyRes = await fetch(`${API_URL}/applications/apply/${createdJobId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${candidateToken}`,
      },
      body: JSON.stringify({
        coverNote: "I have 6 years of production MERN experience and would love to contribute to your team.",
      }),
    });
    const applyData = await applyRes.json();
    assert(applyRes.status === 201 && applyData.success === true, "8. Candidate submits job application with cover note");
    createdApplicationId = applyData.application._id;

    // -------------------------------------------------------------
    // STEP 6: Duplicate application prevention
    // -------------------------------------------------------------
    const dupApplyRes = await fetch(`${API_URL}/applications/apply/${createdJobId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${candidateToken}`,
      },
      body: JSON.stringify({
        coverNote: "Applying again should be rejected.",
      }),
    });
    assert(
      dupApplyRes.status === 409,
      "9. Duplicate application prevention: candidate cannot apply to the same job twice (409 Conflict)"
    );

    // -------------------------------------------------------------
    // STEP 7: Recruiter reviews application & updates status
    // -------------------------------------------------------------
    const recrAppsRes = await fetch(`${API_URL}/applications/recruiter`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    const recrAppsData = await recrAppsRes.json();
    assert(
      recrAppsRes.status === 200 && recrAppsData.applications.some((a) => a._id === createdApplicationId),
      "10. Recruiter retrieves candidate applications for their posted jobs"
    );

    // Update status to Interview
    const updateStatusRes = await fetch(`${API_URL}/applications/${createdApplicationId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${recruiterToken}`,
      },
      body: JSON.stringify({
        status: "Interview",
        note: "Candidate shortlisted for technical round",
      }),
    });
    const updateStatusData = await updateStatusRes.json();
    assert(
      updateStatusRes.status === 200 && updateStatusData.application.status === "Interview",
      "11. Recruiter updates application status to 'Interview' with audit note"
    );

    // -------------------------------------------------------------
    // STEP 8: Candidate views updated application status
    // -------------------------------------------------------------
    const candAppsRes = await fetch(`${API_URL}/applications/my-applications`, {
      headers: { Authorization: `Bearer ${candidateToken}` },
    });
    const candAppsData = await candAppsRes.json();
    const candidateApp = candAppsData.applications.find((a) => a._id === createdApplicationId);
    assert(
      candAppsRes.status === 200 && !!candidateApp && candidateApp.status === "Interview",
      "12. Candidate views real-time updated application status ('Interview')"
    );

    // -------------------------------------------------------------
    // STEP 9: Security & Authorization Checks
    // -------------------------------------------------------------
    // Candidate cannot post a job
    const candPostJobRes = await fetch(`${API_URL}/jobs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${candidateToken}`,
      },
      body: JSON.stringify({ title: "Unauthorized Job" }),
    });
    assert(candPostJobRes.status === 403, "13. Role-based authorization: candidate cannot post a job (403 Forbidden)");

    // Unauthorized recruiter cannot update another recruiter's job status
    const unauthorizedEditRes = await fetch(`${API_URL}/jobs/${createdJobId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${otherRecruiterToken}`,
      },
      body: JSON.stringify({ title: "Hacked Job Title" }),
    });
    assert(
      unauthorizedEditRes.status === 403,
      "14. Resource ownership check: recruiter cannot modify another recruiter's job listing (403 Forbidden)"
    );

    // Unauthenticated user cannot access protected candidate dashboard
    const unauthProfileRes = await fetch(`${API_URL}/candidate/profile`);
    assert(unauthProfileRes.status === 401, "15. Authentication barrier: unauthenticated requests blocked (401 Unauthorized)");

    // -------------------------------------------------------------
    // STEP 10: Filtering, Pagination & Empty State Tests
    // -------------------------------------------------------------
    const filterRes = await fetch(`${API_URL}/jobs?category=Technology&workMode=Remote&page=1&limit=5`);
    const filterData = await filterRes.json();
    assert(
      filterRes.status === 200 && filterData.pagination && filterData.pagination.limit === 5,
      "16. Job filtering and pagination query handling returns correct pagination metadata"
    );

    const emptySearchRes = await fetch(`${API_URL}/jobs?search=NONEXISTENT_QUERY_XYZZY_99999`);
    const emptySearchData = await emptySearchRes.json();
    assert(
      emptySearchRes.status === 200 && emptySearchData.jobs.length === 0,
      "17. Empty search query gracefully returns empty results array without crashing"
    );

    // -------------------------------------------------------------
    // STEP 11: Candidate Profile Updates Persist
    // -------------------------------------------------------------
    const updateProfileRes = await fetch(`${API_URL}/candidate/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${candidateToken}`,
      },
      body: JSON.stringify({
        headline: "Principal Cloud Architect",
        bio: "Specializing in distributed systems and microservices.",
        skills: ["React", "Node.js", "Docker", "Kubernetes"],
      }),
    });
    const updateProfileData = await updateProfileRes.json();
    assert(
      updateProfileRes.status === 200 && updateProfileData.profile.headline === "Principal Cloud Architect",
      "18. Candidate profile updates persist accurately in MongoDB"
    );

    // -------------------------------------------------------------
    // CLEANUP
    // -------------------------------------------------------------
    await Application.deleteMany({ _id: createdApplicationId });
    await Job.deleteMany({ _id: createdJobId });
    await Company.deleteMany({ owner: recrUser._id });
    await CandidateProfile.deleteMany({ user: candUser._id });
    await User.deleteMany({ _id: { $in: [candidateId, recruiterId, otherUser._id] } });
    console.log("\n[Cleaned up all temporary workflow test records safely]");
  } catch (err) {
    console.error("Workflow test error:", err);
    failed++;
  } finally {
    await mongoose.disconnect();
  }

  console.log("\n============================================================");
  console.log(`WORKFLOW TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("============================================================\n");

  if (failed > 0) process.exit(1);
};

runJobPortalWorkflowTests();
