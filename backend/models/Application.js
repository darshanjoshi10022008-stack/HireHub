const mongoose = require("mongoose");

const ApplicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
    status: {
      type: String,
      enum: ["Applied", "Under Review", "Shortlisted", "Interview", "Rejected", "Hired"],
      default: "Applied",
    },
    resume: {
      filename: { type: String, default: "" },
      originalName: { type: String, default: "" },
      url: { type: String, default: "" },
    },
    coverNote: {
      type: String,
      default: "",
      maxlength: 2000,
    },
    recruiterNotes: {
      type: String,
      default: "",
      maxlength: 2000,
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        changedAt: { type: Date, default: Date.now },
        note: { type: String, default: "" },
      },
    ],
  },
  {
    timestamps: true,
  }
);

ApplicationSchema.index({ job: 1, candidate: 1 }, { unique: true });
ApplicationSchema.index({ candidate: 1, createdAt: -1 });
ApplicationSchema.index({ recruiter: 1, createdAt: -1 });
ApplicationSchema.index({ job: 1, status: 1 });

module.exports = mongoose.model("Application", ApplicationSchema);
