const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directories exist
const uploadBase = path.join(__dirname, "../uploads");
const resumeDir = path.join(uploadBase, "resumes");
const logoDir = path.join(uploadBase, "logos");

[uploadBase, resumeDir, logoDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Resume storage config
const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, resumeDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanBase = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "_");
    cb(null, `resume_${Date.now()}_${cleanBase}${ext}`);
  },
});

const resumeFilter = (req, file, cb) => {
  const allowed = [".pdf", ".doc", ".docx"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only PDF and DOC/DOCX files are supported."), false);
  }
};

const uploadResume = multer({
  storage: resumeStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: resumeFilter,
});

// Logo storage config
const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, logoDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanBase = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "_");
    cb(null, `logo_${Date.now()}_${cleanBase}${ext}`);
  },
});

const logoFilter = (req, file, cb) => {
  const allowed = [".png", ".jpg", ".jpeg", ".svg", ".webp"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only PNG, JPG, SVG, and WebP images are supported."), false);
  }
};

const uploadLogo = multer({
  storage: logoStorage,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
  fileFilter: logoFilter,
});

module.exports = {
  uploadResume,
  uploadLogo,
};
