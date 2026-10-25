const express = require("express");
const {
  getPlatformStats,
  getUsers,
  updateUserStatus,
  getAllJobs,
  moderateJob,
  getAllCompanies,
  toggleVerifyCompany,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// All routes require authentication and admin role
router.use(protect);
router.use(authorize("admin"));

router.get("/stats", getPlatformStats);
router.get("/users", getUsers);
router.patch("/users/:id/status", updateUserStatus);
router.get("/jobs", getAllJobs);
router.patch("/jobs/:id/moderate", moderateJob);
router.get("/companies", getAllCompanies);
router.patch("/companies/:id/verify", toggleVerifyCompany);

module.exports = router;
