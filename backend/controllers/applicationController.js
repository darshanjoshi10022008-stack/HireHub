const Application = require("../models/Application");
const Job = require("../models/Job");
const CandidateProfile = require("../models/CandidateProfile");

// ==============================
// CANDIDATE: APPLY TO A JOB
// ==============================
const applyToJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { coverNote } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job listing not found",
      });
    }

    if (job.status !== "published") {
      return res.status(400).json({
        success: false,
        message: "This job is not accepting applications at this time.",
      });
    }

    // Check duplicate application
    const existing = await Application.findOne({
      job: jobId,
      candidate: req.user._id,
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "You have already submitted an application for this position.",
      });
    }

    // Determine resume: either uploaded with request or candidate profile resume
    let resume = null;

    if (req.file) {
      resume = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        url: `/uploads/resumes/${req.file.filename}`,
      };
    } else {
      const profile = await CandidateProfile.findOne({ user: req.user._id });
      if (profile && profile.resume && profile.resume.url) {
        resume = profile.resume;
      }
    }

    if (!resume || !resume.url) {
      return res.status(400).json({
        success: false,
        message: "Please attach or upload a resume to submit your application.",
      });
    }

    const application = await Application.create({
      job: job._id,
      candidate: req.user._id,
      recruiter: job.recruiter,
      company: job.company,
      status: "Applied",
      resume,
      coverNote: coverNote ? coverNote.trim() : "",
      statusHistory: [
        {
          status: "Applied",
          changedAt: new Date(),
          note: "Application submitted by candidate",
        },
      ],
    });

    // Increment application count on the Job
    await Job.findByIdAndUpdate(job._id, { $inc: { applicationsCount: 1 } });

    return res.status(201).json({
      success: true,
      message: "Your application has been successfully submitted!",
      application,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already applied for this job.",
      });
    }
    console.error("Apply to job error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to submit job application",
    });
  }
};

// ==============================
// CANDIDATE: CHECK IF ALREADY APPLIED
// ==============================
const checkJobApplied = async (req, res) => {
  try {
    const { jobId } = req.params;
    const application = await Application.findOne({
      job: jobId,
      candidate: req.user._id,
    });

    return res.status(200).json({
      success: true,
      hasApplied: !!application,
      application: application || null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to check application status",
    });
  }
};

// ==============================
// CANDIDATE: GET MY APPLICATIONS
// ==============================
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ candidate: req.user._id })
      .populate("job", "title category location jobType workMode salary deadline")
      .populate("company", "name logo location industry")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      applications,
    });
  } catch (error) {
    console.error("Get my applications error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch applications",
    });
  }
};

// ==============================
// CANDIDATE: WITHDRAW APPLICATION
// ==============================
const withdrawApplication = async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      candidate: req.user._id,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    if (["Shortlisted", "Interview", "Hired"].includes(application.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot withdraw an application that is already in '${application.status}' stage.`,
      });
    }

    await Application.findByIdAndDelete(application._id);
    await Job.findByIdAndUpdate(application.job, { $inc: { applicationsCount: -1 } });

    return res.status(200).json({
      success: true,
      message: "Application successfully withdrawn.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to withdraw application",
    });
  }
};

// ==============================
// RECRUITER: GET ALL APPLICATIONS ACROSS JOBS
// ==============================
const getRecruiterApplications = async (req, res) => {
  try {
    const { jobId, status, page = 1, limit = 20 } = req.query;

    const query = { recruiter: req.user._id };

    if (jobId && jobId !== "All") {
      query.job = jobId;
    }

    if (status && status !== "All") {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [applications, total] = await Promise.all([
      Application.find(query)
        .populate("job", "title category location jobType")
        .populate("candidate", "name email isEmailVerified avatar")
        .populate("company", "name logo")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Application.countDocuments(query),
    ]);

    // Attach candidate profile details (headline, skills) for quick review
    const candidateIds = applications.map((a) => a.candidate ? a.candidate._id : null).filter(Boolean);
    const profiles = await CandidateProfile.find({ user: { $in: candidateIds } });

    const profileMap = {};
    profiles.forEach((p) => {
      profileMap[p.user.toString()] = p;
    });

    const applicationsWithProfiles = applications.map((app) => {
      const appObj = app.toObject();
      const candId = app.candidate ? app.candidate._id.toString() : null;
      appObj.candidateProfile = candId && profileMap[candId] ? profileMap[candId] : null;
      return appObj;
    });

    return res.status(200).json({
      success: true,
      applications: applicationsWithProfiles,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)) || 1,
      },
    });
  } catch (error) {
    console.error("Get recruiter applications error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch candidate applications",
    });
  }
};

// ==============================
// RECRUITER: GET APPLICATIONS FOR SPECIFIC JOB
// ==============================
const getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to access applications for this job",
      });
    }

    const applications = await Application.find({ job: jobId })
      .populate("candidate", "name email isEmailVerified avatar")
      .sort({ createdAt: -1 });

    const candidateIds = applications.map((a) => a.candidate ? a.candidate._id : null).filter(Boolean);
    const profiles = await CandidateProfile.find({ user: { $in: candidateIds } });
    const profileMap = {};
    profiles.forEach((p) => {
      profileMap[p.user.toString()] = p;
    });

    const enriched = applications.map((app) => {
      const appObj = app.toObject();
      const candId = app.candidate ? app.candidate._id.toString() : null;
      appObj.candidateProfile = candId && profileMap[candId] ? profileMap[candId] : null;
      return appObj;
    });

    return res.status(200).json({
      success: true,
      job,
      applications: enriched,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch job applications",
    });
  }
};

// ==============================
// RECRUITER: UPDATE APPLICATION STATUS
// ==============================
const updateApplicationStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const allowedStatuses = ["Applied", "Under Review", "Shortlisted", "Interview", "Rejected", "Hired"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${allowedStatuses.join(", ")}`,
      });
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Verify ownership
    if (application.recruiter.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to update this application",
      });
    }

    application.status = status;
    if (note) {
      application.recruiterNotes = note.trim();
    }

    application.statusHistory.push({
      status,
      changedAt: new Date(),
      note: note ? note.trim() : `Status changed to ${status}`,
    });

    await application.save();

    return res.status(200).json({
      success: true,
      message: `Application marked as '${status}' successfully`,
      application,
    });
  } catch (error) {
    console.error("Update application status error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to update application status",
    });
  }
};

module.exports = {
  applyToJob,
  checkJobApplied,
  getMyApplications,
  withdrawApplication,
  getRecruiterApplications,
  getJobApplications,
  updateApplicationStatus,
};
