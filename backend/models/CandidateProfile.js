const mongoose = require("mongoose");

const ExperienceSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  company: { type: String, required: true, trim: true },
  location: { type: String, trim: true },
  startDate: { type: String },
  endDate: { type: String },
  current: { type: Boolean, default: false },
  description: { type: String, trim: true },
});

const EducationSchema = new mongoose.Schema({
  degree: { type: String, required: true, trim: true },
  institution: { type: String, required: true, trim: true },
  fieldOfStudy: { type: String, trim: true },
  graduationYear: { type: String, trim: true },
  grade: { type: String, trim: true },
});

const CandidateProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    headline: {
      type: String,
      default: "",
      trim: true,
      maxlength: 120,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    location: {
      type: String,
      default: "",
      trim: true,
    },
    bio: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },
    website: {
      type: String,
      default: "",
      trim: true,
    },
    github: {
      type: String,
      default: "",
      trim: true,
    },
    linkedin: {
      type: String,
      default: "",
      trim: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    experience: [ExperienceSchema],
    education: [EducationSchema],
    resume: {
      filename: { type: String, default: "" },
      originalName: { type: String, default: "" },
      url: { type: String, default: "" },
      updatedAt: { type: Date },
    },
    savedJobs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("CandidateProfile", CandidateProfileSchema);
