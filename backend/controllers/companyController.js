const Company = require("../models/Company");
const Job = require("../models/Job");

// Public: Get all approved companies
const getCompanies = async (req, res) => {
  try {
    const { search, industry, page = 1, limit = 12 } = req.query;

    const query = { isVerified: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { industry: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }

    if (industry && industry !== "All") {
      query.industry = industry;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [companies, total] = await Promise.all([
      Company.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Company.countDocuments(query),
    ]);

    // Attach active job count for each company
    const companyIds = companies.map((c) => c._id);
    const jobCounts = await Job.aggregate([
      { $match: { company: { $in: companyIds }, status: "published" } },
      { $group: { _id: "$company", count: { $sum: 1 } } },
    ]);

    const countMap = {};
    jobCounts.forEach((j) => {
      countMap[j._id.toString()] = j.count;
    });

    const companiesWithCounts = companies.map((c) => ({
      ...c.toObject(),
      openJobsCount: countMap[c._id.toString()] || 0,
    }));

    return res.status(200).json({
      success: true,
      companies: companiesWithCounts,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get companies error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch companies",
    });
  }
};

// Public: Get single company by ID with its published jobs
const getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id).populate("owner", "name email");

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    const jobs = await Job.find({ company: company._id, status: "published" }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      company,
      jobs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch company details",
    });
  }
};

// Recruiter: Get current recruiter's company
const getMyCompany = async (req, res) => {
  try {
    const company = await Company.findOne({ owner: req.user._id });

    return res.status(200).json({
      success: true,
      company: company || null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch company profile",
    });
  }
};

// Recruiter: Create or Update company profile
const createOrUpdateCompany = async (req, res) => {
  try {
    const { name, website, industry, companySize, location, about, logo } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Company name is required",
      });
    }

    let company = await Company.findOne({ owner: req.user._id });

    if (company) {
      company.name = name.trim();
      if (website !== undefined) company.website = website.trim();
      if (industry !== undefined) company.industry = industry.trim();
      if (companySize !== undefined) company.companySize = companySize;
      if (location !== undefined) company.location = location.trim();
      if (about !== undefined) company.about = about.trim();
      if (logo !== undefined) company.logo = logo;

      await company.save();
    } else {
      company = await Company.create({
        name: name.trim(),
        owner: req.user._id,
        website: website ? website.trim() : "",
        industry: industry ? industry.trim() : "Technology",
        companySize: companySize || "11-50",
        location: location ? location.trim() : "",
        about: about ? about.trim() : "",
        logo: logo || "",
        isVerified: true,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Company profile saved successfully",
      company,
    });
  } catch (error) {
    console.error("Save company error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to save company profile",
    });
  }
};

// Recruiter: Upload company logo
const uploadCompanyLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No logo image uploaded",
      });
    }

    const logoUrl = `/uploads/logos/${req.file.filename}`;

    let company = await Company.findOne({ owner: req.user._id });
    if (company) {
      company.logo = logoUrl;
      await company.save();
    }

    return res.status(200).json({
      success: true,
      message: "Logo uploaded successfully",
      logoUrl,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to upload logo",
    });
  }
};

module.exports = {
  getCompanies,
  getCompanyById,
  getMyCompany,
  createOrUpdateCompany,
  uploadCompanyLogo,
};
