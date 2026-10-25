const express = require("express");
const {
  getCompanies,
  getCompanyById,
  getMyCompany,
  createOrUpdateCompany,
  uploadCompanyLogo,
} = require("../controllers/companyController");
const { protect, authorize, requireVerified } = require("../middleware/authMiddleware");
const { uploadLogo } = require("../middleware/uploadMiddleware");

const router = express.Router();

// Public routes
router.get("/", getCompanies);
router.get("/:id", getCompanyById);

// Recruiter routes
router.get("/my-company", protect, requireVerified, authorize("recruiter"), getMyCompany);
router.post("/", protect, requireVerified, authorize("recruiter"), createOrUpdateCompany);
router.put("/my-company", protect, requireVerified, authorize("recruiter"), createOrUpdateCompany);
router.post(
  "/upload-logo",
  protect,
  requireVerified,
  authorize("recruiter"),
  uploadLogo.single("logo"),
  uploadCompanyLogo
);

module.exports = router;
