const User = require("../models/User");
const Company = require("../models/Company");
const Job = require("../models/Job");
const Application = require("../models/Application");

// ==============================
// ADMIN: PLATFORM OVERVIEW STATS
// ==============================
const getPlatformStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalCandidates,
      totalRecruiters,
      totalCompanies,
      totalJobs,
      publishedJobs,
      totalApplications,
      recentUsers,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: { $in: ["student", "candidate"] } }),
      User.countDocuments({ role: "recruiter" }),
      Company.countDocuments(),
      Job.countDocuments(),
      Job.countDocuments({ status: "published" }),
      Application.countDocuments(),
      User.find().sort({ createdAt: -1 }).limit(6).select("-password"),
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalCandidates,
        totalRecruiters,
        totalCompanies,
        totalJobs,
        publishedJobs,
        totalApplications,
      },
      recentUsers,
    });
  } catch (error) {
    console.error("Admin stats error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to load platform stats",
    });
  }
};

// ==============================
// ADMIN: MANAGE USERS
// ==============================
const getUsers = async (req, res) => {
  try {
    const { search, role, status, page = 1, limit = 20 } = req.query;

    const query = {};

    if (search && search.trim()) {
      const term = search.trim();
      query.$or = [
        { name: { $regex: term, $options: "i" } },
        { email: { $regex: term, $options: "i" } },
      ];
    }

    if (role && role !== "All") {
      if (role === "candidate") {
        query.role = { $in: ["student", "candidate"] };
      } else {
        query.role = role;
      }
    }

    if (status && status !== "All") {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      User.find(query)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      users,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)) || 1,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

// ==============================
// ADMIN: SUSPEND / ACTIVATE USER
// ==============================
const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["active", "suspended"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'active' or 'suspended'",
      });
    }

    // Prevent suspending own admin account
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot suspend your own account.",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: `User marked as ${status}`,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update user status",
    });
  }
};

// ==============================
// ADMIN: MODERATE ALL JOBS
// ==============================
const getAllJobs = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { category: { $regex: search.trim(), $options: "i" } },
      ];
    }

    if (status && status !== "All") {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .populate("company", "name logo")
        .populate("recruiter", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Job.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      jobs,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)) || 1,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch jobs for moderation",
    });
  }
};

// ==============================
// ADMIN: MODERATE / REMOVE JOB
// ==============================
const moderateJob = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["published", "closed", "draft"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Job listing status changed to ${status}`,
      job,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to moderate job",
    });
  }
};

// ==============================
// ADMIN: MANAGE COMPANIES
// ==============================
const getAllCompanies = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (search && search.trim()) {
      query.name = { $regex: search.trim(), $options: "i" };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [companies, total] = await Promise.all([
      Company.find(query)
        .populate("owner", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Company.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      companies,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)) || 1,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch companies",
    });
  }
};

// ==============================
// ADMIN: VERIFY COMPANY
// ==============================
const toggleVerifyCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    company.isVerified = !company.isVerified;
    await company.save();

    return res.status(200).json({
      success: true,
      message: `Company ${company.isVerified ? "approved" : "unapproved"}`,
      company,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update company verification",
    });
  }
};

module.exports = {
  getPlatformStats,
  getUsers,
  updateUserStatus,
  getAllJobs,
  moderateJob,
  getAllCompanies,
  toggleVerifyCompany,
};
