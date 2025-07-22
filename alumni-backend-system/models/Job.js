const mongoose = require("mongoose")

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      name: {
        type: String,
        required: true,
      },
      logo: String,
      website: String,
      description: String,
      location: {
        city: String,
        country: String,
        isRemote: {
          type: Boolean,
          default: false,
        },
      },
    },
    description: {
      type: String,
      required: true,
    },
    requirements: [String],
    responsibilities: [String],
    benefits: [String],
    type: {
      type: String,
      enum: ["full-time", "part-time", "contract", "internship", "volunteer"],
      required: true,
    },
    category: {
      type: String,
      enum: ["technology", "healthcare", "finance", "education", "marketing", "sales", "operations", "other"],
      required: true,
    },
    experienceLevel: {
      type: String,
      enum: ["entry", "mid", "senior", "executive"],
      required: true,
    },
    salary: {
      min: Number,
      max: Number,
      currency: {
        type: String,
        default: "USD",
      },
      period: {
        type: String,
        enum: ["hourly", "monthly", "yearly"],
        default: "yearly",
      },
      isNegotiable: {
        type: Boolean,
        default: false,
      },
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    contactInfo: {
      email: String,
      phone: String,
      contactPerson: String,
    },
    applicationDeadline: Date,
    applicationMethod: {
      type: String,
      enum: ["email", "website", "phone", "in_person"],
      required: true,
    },
    applicationUrl: String,
    skills: [String],
    tags: [String],
    questionnaire: [String],
    applications: [
      {
        applicant: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        appliedAt: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ["applied", "reviewed", "shortlisted", "interviewed", "offered", "rejected"],
          default: "applied",
        },
        resume: String,
        coverLetter: String,
        notes: String,
        answers: [
          {
            question: String,
            answer: String,
          },
        ],
      },
    ],
    status: {
      type: String,
      enum: ["active", "filled", "expired", "cancelled"],
      default: "active",
    },
    featured: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    expiresAt: Date,
  },
  {
    timestamps: true,
  },
)

// Index for search and filtering
jobSchema.index({ title: "text", "company.name": "text", description: "text" })
jobSchema.index({ type: 1 })
jobSchema.index({ category: 1 })
jobSchema.index({ experienceLevel: 1 })
jobSchema.index({ status: 1 })
jobSchema.index({ createdAt: -1 })

// Virtual for application count
jobSchema.virtual("applicationCount").get(function () {
  return this.applications.length
})

module.exports = mongoose.model("Job", jobSchema)
