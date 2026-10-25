const express = require("express");
const {
  getJobs,
  getFeaturedJobs,
  getCategories,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getRecruiterJobs,
  updateJobStatus,
} = require("../controllers/jobController");
const { protect, authorize, requireVerified } = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes
router.get("/", getJobs);
router.get("/featured", getFeaturedJobs);
router.get("/categories", getCategories);
router.get("/:id", getJobById);

// Recruiter routes (require authenticated, verified recruiter)
router.get("/recruiter/my-jobs", protect, requireVerified, authorize("recruiter"), getRecruiterJobs);
router.post("/", protect, requireVerified, authorize("recruiter"), createJob);
router.put("/:id", protect, requireVerified, authorize("recruiter", "admin"), updateJob);
router.delete("/:id", protect, requireVerified, authorize("recruiter", "admin"), deleteJob);
router.patch("/:id/status", protect, requireVerified, authorize("recruiter", "admin"), updateJobStatus);

module.exports = router;
