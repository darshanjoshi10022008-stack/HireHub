const express = require("express");
const {
  applyToJob,
  checkJobApplied,
  getMyApplications,
  withdrawApplication,
  getRecruiterApplications,
  getJobApplications,
  updateApplicationStatus,
} = require("../controllers/applicationController");
const { protect, authorize, requireVerified } = require("../middleware/authMiddleware");
const { uploadResume } = require("../middleware/uploadMiddleware");

const router = express.Router();

// Candidate endpoints (mutations require verified email)
router.post(
  "/apply/:jobId",
  protect,
  requireVerified,
  authorize("student", "candidate"),
  uploadResume.single("resume"),
  applyToJob
);
router.get("/check/:jobId", protect, authorize("student", "candidate"), checkJobApplied);
router.get("/my-applications", protect, authorize("student", "candidate"), getMyApplications);
router.delete("/withdraw/:id", protect, requireVerified, authorize("student", "candidate"), withdrawApplication);

// Recruiter endpoints
router.get("/recruiter", protect, requireVerified, authorize("recruiter"), getRecruiterApplications);
router.get("/job/:jobId", protect, requireVerified, authorize("recruiter", "admin"), getJobApplications);
router.patch("/:id/status", protect, requireVerified, authorize("recruiter", "admin"), updateApplicationStatus);

module.exports = router;
