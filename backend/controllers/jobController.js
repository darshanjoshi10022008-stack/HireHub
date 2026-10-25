const Job = require("../models/Job");
const Company = require("../models/Company");
const Application = require("../models/Application");

// ==============================
// PUBLIC: GET ALL PUBLISHED JOBS
// ==============================
const getJobs = async (req, res) => {
  try {
    const {
      search,
      category,
      jobType,
      workMode,
      experienceLevel,
      location,
      salaryMin,
      sort = "newest",
      page = 1,
      limit = 10,
    } = req.query;

    const query = { status: "published" };

    if (search && search.trim()) {
      const term = search.trim();
      // Search across title, skills, description, category
      query.$or = [
        { title: { $regex: term, $options: "i" } },
        { description: { $regex: term, $options: "i" } },
        { skills: { $in: [new RegExp(term, "i")] } },
        { category: { $regex: term, $options: "i" } },
        { location: { $regex: term, $options: "i" } },
      ];
    }

    if (category && category !== "All") {
      query.category = category;
    }

    if (jobType && jobType !== "All") {
      query.jobType = jobType;
    }

    if (workMode && workMode !== "All") {
      query.workMode = workMode;
    }

    if (experienceLevel && experienceLevel !== "All") {
      query.experienceLevel = experienceLevel;
    }

    if (location && location.trim() && location !== "All") {
      query.location = { $regex: location.trim(), $options: "i" };
    }

    if (salaryMin && !isNaN(salaryMin)) {
      query["salary.max"] = { $gte: Number(salaryMin) };
    }

    // Sort order
    let sortOptions = { createdAt: -1 };
    if (sort === "salaryHigh") {
      sortOptions = { "salary.max": -1, createdAt: -1 };
    } else if (sort === "popular") {
      sortOptions = { viewsCount: -1, createdAt: -1 };
    }

    const currentPage = Math.max(1, parseInt(page) || 1);
    const pageLimit = Math.max(1, Math.min(50, parseInt(limit) || 10));
    const skip = (currentPage - 1) * pageLimit;

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .populate("company", "name logo location industry website")
        .populate("recruiter", "name")
        .sort(sortOptions)
        .skip(skip)
        .limit(pageLimit),
      Job.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      jobs,
      pagination: {
        total,
        page: currentPage,
        limit: pageLimit,
        pages: Math.ceil(total / pageLimit) || 1,
      },
    });
  } catch (error) {
    console.error("Get jobs error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch jobs",
    });
  }
};

// ==============================
// PUBLIC: GET FEATURED / RECENT JOBS
// ==============================
const getFeaturedJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ status: "published" })
      .populate("company", "name logo location industry website")
      .sort({ createdAt: -1 })
      .limit(6);

    return res.status(200).json({
      success: true,
      jobs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch featured jobs",
    });
  }
};

// ==============================
// PUBLIC: GET POPULAR CATEGORIES WITH COUNTS
// ==============================
const getCategories = async (req, res) => {
  try {
    const categoriesList = [
      "Technology & IT",
      "Software Engineering",
      "Product & Design",
      "Marketing & Sales",
      "Finance & Accounting",
      "Human Resources",
      "Customer Support",
      "Operations & Management",
    ];

    const counts = await Job.aggregate([
      { $match: { status: "published" } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    const countMap = {};
    counts.forEach((item) => {
      countMap[item._id] = item.count;
    });

    const result = categoriesList.map((cat) => ({
      name: cat,
      count: countMap[cat] || 0,
    }));

    return res.status(200).json({
      success: true,
      categories: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
};

// ==============================
// PUBLIC: GET SINGLE JOB DETAILS
// ==============================
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate("company", "name logo location industry website about companySize")
      .populate("recruiter", "name email");

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job listing not found",
      });
    }

    // Increment views count asynchronously
    Job.findByIdAndUpdate(job._id, { $inc: { viewsCount: 1 } }).exec();

    // Fetch related jobs in the same category
    const relatedJobs = await Job.find({
      category: job.category,
      _id: { $ne: job._id },
      status: "published",
    })
      .populate("company", "name logo location")
      .limit(4);

    return res.status(200).json({
      success: true,
      job,
      relatedJobs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch job details",
    });
  }
};

// ==============================
// RECRUITER: CREATE JOB
// ==============================
const createJob = async (req, res) => {
  try {
    const {
      title,
      category,
      jobType,
      workMode,
      location,
      experienceLevel,
      salaryMin,
      salaryMax,
      salaryCurrency,
      salaryPeriod,
      isNegotiable,
      description,
      requirements,
      responsibilities,
      skills,
      deadline,
      status,
    } = req.body;

    if (!title || !category || !location || !description) {
      return res.status(400).json({
        success: false,
        message: "Title, category, location, and description are required",
      });
    }

    // Check if recruiter has a company, create default if not yet created
    let company = await Company.findOne({ owner: req.user._id });
    if (!company) {
      company = await Company.create({
        name: `${req.user.name}'s Organization`,
        owner: req.user._id,
        location: location || "Remote",
        industry: category || "Technology",
      });
    }

    // Parse arrays if string was sent
    const parsedRequirements = Array.isArray(requirements)
      ? requirements
      : typeof requirements === "string"
      ? requirements.split("\n").map((r) => r.trim()).filter(Boolean)
      : [];

    const parsedResponsibilities = Array.isArray(responsibilities)
      ? responsibilities
      : typeof responsibilities === "string"
      ? responsibilities.split("\n").map((r) => r.trim()).filter(Boolean)
      : [];

    const parsedSkills = Array.isArray(skills)
      ? skills
      : typeof skills === "string"
      ? skills.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const job = await Job.create({
      title: title.trim(),
      recruiter: req.user._id,
      company: company._id,
      category: category.trim(),
      jobType: jobType || "Full-time",
      workMode: workMode || "On-site",
      location: location.trim(),
      experienceLevel: experienceLevel || "Mid Level",
      salary: {
        min: Number(salaryMin) || 0,
        max: Number(salaryMax) || 0,
        currency: salaryCurrency || "USD",
        period: salaryPeriod || "yr",
        isNegotiable: Boolean(isNegotiable),
      },
      description,
      requirements: parsedRequirements,
      responsibilities: parsedResponsibilities,
      skills: parsedSkills,
      deadline: deadline ? new Date(deadline) : undefined,
      status: status || "published",
    });

    const populatedJob = await Job.findById(job._id).populate("company", "name logo location");

    return res.status(201).json({
      success: true,
      message: "Job posting created successfully",
      job: populatedJob,
    });
  } catch (error) {
    console.error("Create job error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to create job posting",
    });
  }
};

// ==============================
// RECRUITER: UPDATE JOB
// ==============================
const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job listing not found",
      });
    }

    // Ensure only the owner recruiter (or admin) can edit
    if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to edit this job",
      });
    }

    const {
      title,
      category,
      jobType,
      workMode,
      location,
      experienceLevel,
      salaryMin,
      salaryMax,
      salaryCurrency,
      salaryPeriod,
      isNegotiable,
      description,
      requirements,
      responsibilities,
      skills,
      deadline,
      status,
    } = req.body;

    if (title) job.title = title.trim();
    if (category) job.category = category.trim();
    if (jobType) job.jobType = jobType;
    if (workMode) job.workMode = workMode;
    if (location) job.location = location.trim();
    if (experienceLevel) job.experienceLevel = experienceLevel;
    if (description) job.description = description;
    if (status) job.status = status;
    if (deadline !== undefined) job.deadline = deadline ? new Date(deadline) : undefined;

    if (salaryMin !== undefined || salaryMax !== undefined) {
      job.salary = {
        min: salaryMin !== undefined ? Number(salaryMin) : job.salary.min,
        max: salaryMax !== undefined ? Number(salaryMax) : job.salary.max,
        currency: salaryCurrency || job.salary.currency || "USD",
        period: salaryPeriod || job.salary.period || "yr",
        isNegotiable: isNegotiable !== undefined ? Boolean(isNegotiable) : job.salary.isNegotiable,
      };
    }

    if (requirements !== undefined) {
      job.requirements = Array.isArray(requirements)
        ? requirements
        : typeof requirements === "string"
        ? requirements.split("\n").map((r) => r.trim()).filter(Boolean)
        : [];
    }

    if (responsibilities !== undefined) {
      job.responsibilities = Array.isArray(responsibilities)
        ? responsibilities
        : typeof responsibilities === "string"
        ? responsibilities.split("\n").map((r) => r.trim()).filter(Boolean)
        : [];
    }

    if (skills !== undefined) {
      job.skills = Array.isArray(skills)
        ? skills
        : typeof skills === "string"
        ? skills.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
    }

    await job.save();

    return res.status(200).json({
      success: true,
      message: "Job listing updated successfully",
      job,
    });
  } catch (error) {
    console.error("Update job error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to update job listing",
    });
  }
};

// ==============================
// RECRUITER: DELETE / CLOSE JOB
// ==============================
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job listing not found",
      });
    }

    if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this job",
      });
    }

    await Job.findByIdAndDelete(job._id);

    return res.status(200).json({
      success: true,
      message: "Job listing deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete job",
    });
  }
};

// ==============================
// RECRUITER: GET MY POSTED JOBS
// ==============================
const getRecruiterJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ recruiter: req.user._id })
      .populate("company", "name logo location")
      .sort({ createdAt: -1 });

    // Aggregate real application count per job
    const jobIds = jobs.map((j) => j._id);
    const appCounts = await Application.aggregate([
      { $match: { job: { $in: jobIds } } },
      { $group: { _id: "$job", count: { $sum: 1 } } },
    ]);

    const countMap = {};
    appCounts.forEach((ac) => {
      countMap[ac._id.toString()] = ac.count;
    });

    const jobsWithCounts = jobs.map((j) => ({
      ...j.toObject(),
      applicationsCount: countMap[j._id.toString()] || 0,
    }));

    return res.status(200).json({
      success: true,
      jobs: jobsWithCounts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch recruiter jobs",
    });
  }
};

// ==============================
// RECRUITER: UPDATE STATUS QUICKLY
// ==============================
const updateJobStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["draft", "published", "closed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    job.status = status;
    await job.save();

    return res.status(200).json({
      success: true,
      message: `Job status updated to ${status}`,
      job,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update status",
    });
  }
};

module.exports = {
  getJobs,
  getFeaturedJobs,
  getCategories,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getRecruiterJobs,
  updateJobStatus,
};
