const express = require("express");
const {
  getProfile,
  updateProfile,
  uploadResumeFile,
  toggleSaveJob,
  getSavedJobs,
  getDashboardStats,
} = require("../controllers/candidateController");
const { protect, authorize, requireVerified } = require("../middleware/authMiddleware");
const { uploadResume } = require("../middleware/uploadMiddleware");

const router = express.Router();

// All candidate routes require authentication, candidate role, and verified email
router.use(protect);
router.use(authorize("student", "candidate"));
router.use(requireVerified);

router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.post("/upload-resume", uploadResume.single("resume"), uploadResumeFile);
router.post("/saved-jobs/:jobId", toggleSaveJob);
router.get("/saved-jobs", getSavedJobs);
router.get("/dashboard-stats", getDashboardStats);

module.exports = router;
