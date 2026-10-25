const CandidateProfile = require("../models/CandidateProfile");
const Application = require("../models/Application");
const Job = require("../models/Job");
const User = require("../models/User");

// ==============================
// GET CANDIDATE PROFILE
// ==============================
const getProfile = async (req, res) => {
  try {
    let profile = await CandidateProfile.findOne({ user: req.user._id }).populate({
      path: "savedJobs",
      populate: { path: "company", select: "name logo location" },
    });

    if (!profile) {
      profile = await CandidateProfile.create({
        user: req.user._id,
        headline: "",
        bio: "",
        skills: [],
      });
    }

    return res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Get candidate profile error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch candidate profile",
    });
  }
};

// ==============================
// UPDATE CANDIDATE PROFILE
// ==============================
const updateProfile = async (req, res) => {
  try {
    const {
      name,
      headline,
      phone,
      location,
      bio,
      website,
      github,
      linkedin,
      skills,
      experience,
      education,
    } = req.body;

    // Update User name if provided
    if (name && name.trim()) {
      await User.findByIdAndUpdate(req.user._id, { name: name.trim() });
    }

    let profile = await CandidateProfile.findOne({ user: req.user._id });
    if (!profile) {
      profile = new CandidateProfile({ user: req.user._id });
    }

    if (headline !== undefined) profile.headline = headline.trim();
    if (phone !== undefined) profile.phone = phone.trim();
    if (location !== undefined) profile.location = location.trim();
    if (bio !== undefined) profile.bio = bio.trim();
    if (website !== undefined) profile.website = website.trim();
    if (github !== undefined) profile.github = github.trim();
    if (linkedin !== undefined) profile.linkedin = linkedin.trim();

    if (skills !== undefined) {
      profile.skills = Array.isArray(skills)
        ? skills.map((s) => s.trim()).filter(Boolean)
        : typeof skills === "string"
        ? skills.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
    }

    if (experience !== undefined && Array.isArray(experience)) {
      profile.experience = experience;
    }

    if (education !== undefined && Array.isArray(education)) {
      profile.education = education;
    }

    await profile.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profile,
    });
  } catch (error) {
    console.error("Update profile error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};

// ==============================
// UPLOAD RESUME
// ==============================
const uploadResumeFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No resume file uploaded. Please upload a PDF or DOCX file.",
      });
    }

    const resumeUrl = `/uploads/resumes/${req.file.filename}`;

    let profile = await CandidateProfile.findOne({ user: req.user._id });
    if (!profile) {
      profile = new CandidateProfile({ user: req.user._id });
    }

    profile.resume = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      url: resumeUrl,
      updatedAt: new Date(),
    };

    await profile.save();

    return res.status(200).json({
      success: true,
      message: "Resume uploaded successfully",
      resume: profile.resume,
    });
  } catch (error) {
    console.error("Upload resume error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to upload resume",
    });
  }
};

// ==============================
// TOGGLE SAVE JOB
// ==============================
const toggleSaveJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    let profile = await CandidateProfile.findOne({ user: req.user._id });
    if (!profile) {
      profile = await CandidateProfile.create({ user: req.user._id });
    }

    const existsIndex = profile.savedJobs.findIndex((id) => id.toString() === jobId);
    let isSaved = false;

    if (existsIndex > -1) {
      // Remove
      profile.savedJobs.splice(existsIndex, 1);
      isSaved = false;
    } else {
      // Add
      profile.savedJobs.push(jobId);
      isSaved = true;
    }

    await profile.save();

    return res.status(200).json({
      success: true,
      message: isSaved ? "Job saved to your bookmarks" : "Job removed from your bookmarks",
      isSaved,
      savedJobs: profile.savedJobs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update saved job",
    });
  }
};

// ==============================
// GET SAVED JOBS
// ==============================
const getSavedJobs = async (req, res) => {
  try {
    const profile = await CandidateProfile.findOne({ user: req.user._id }).populate({
      path: "savedJobs",
      populate: { path: "company", select: "name logo location industry" },
    });

    return res.status(200).json({
      success: true,
      savedJobs: profile ? profile.savedJobs : [],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch saved jobs",
    });
  }
};

// ==============================
// GET CANDIDATE DASHBOARD STATS
// ==============================
const getDashboardStats = async (req, res) => {
  try {
    const [profile, applications] = await Promise.all([
      CandidateProfile.findOne({ user: req.user._id }),
      Application.find({ candidate: req.user._id })
        .populate("job", "title category location jobType")
        .populate("company", "name logo location")
        .sort({ createdAt: -1 }),
    ]);

    // Calculate real profile completion percentage
    let completionScore = 0;
    if (req.user.name) completionScore += 15;
    if (req.user.isEmailVerified) completionScore += 15;
    if (profile) {
      if (profile.headline) completionScore += 15;
      if (profile.bio) completionScore += 10;
      if (profile.location) completionScore += 10;
      if (profile.skills && profile.skills.length > 0) completionScore += 15;
      if (profile.experience && profile.experience.length > 0) completionScore += 10;
      if (profile.resume && profile.resume.url) completionScore += 10;
    }

    // Status breakdown
    const stats = {
      profileCompletion: Math.min(100, completionScore),
      totalApplications: applications.length,
      underReview: applications.filter((a) => a.status === "Under Review").length,
      shortlisted: applications.filter((a) => a.status === "Shortlisted").length,
      interviews: applications.filter((a) => a.status === "Interview").length,
      hired: applications.filter((a) => a.status === "Hired").length,
      rejected: applications.filter((a) => a.status === "Rejected").length,
      savedJobsCount: profile ? profile.savedJobs.length : 0,
      recentApplications: applications.slice(0, 5),
    };

    return res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Get candidate stats error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch candidate stats",
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadResumeFile,
  toggleSaveJob,
  getSavedJobs,
  getDashboardStats,
};
