const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
      maxlength: 150,
    },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    category: {
      type: String,
      required: [true, "Job category is required"],
      trim: true,
      default: "Technology & IT",
    },
    jobType: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "Internship", "Freelance"],
      default: "Full-time",
      required: true,
    },
    workMode: {
      type: String,
      enum: ["On-site", "Hybrid", "Remote"],
      default: "On-site",
      required: true,
    },
    location: {
      type: String,
      required: [true, "Job location is required"],
      trim: true,
    },
    experienceLevel: {
      type: String,
      enum: ["Entry Level", "Mid Level", "Senior Level", "Lead / Executive"],
      default: "Mid Level",
      required: true,
    },
    salary: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
      currency: { type: String, default: "USD" },
      period: { type: String, enum: ["hr", "mo", "yr"], default: "yr" },
      isNegotiable: { type: Boolean, default: false },
    },
    description: {
      type: String,
      required: [true, "Job description is required"],
    },
    requirements: {
      type: [String],
      default: [],
    },
    responsibilities: {
      type: [String],
      default: [],
    },
    skills: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["draft", "published", "closed"],
      default: "published",
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    applicationsCount: {
      type: Number,
      default: 0,
    },
    deadline: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

JobSchema.index({ title: "text", description: "text", skills: "text", category: "text" });
JobSchema.index({ status: 1, createdAt: -1 });
JobSchema.index({ company: 1 });
JobSchema.index({ recruiter: 1 });

module.exports = mongoose.model("Job", JobSchema);
