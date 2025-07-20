const mongoose = require("mongoose")

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["general", "jobs", "news", "scholarships", "events", "achievements", "obituary"],
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    targetAudience: {
      graduationYears: [Number],
      locations: [String],
      roles: [
        {
          type: String,
          enum: ["alumni", "admin", "moderator"],
        },
      ],
      isPublic: {
        type: Boolean,
        default: true,
      },
    },
    media: {
      images: [String],
      documents: [String],
      videos: [String],
    },
    engagement: {
      views: {
        type: Number,
        default: 0,
      },
      likes: [
        {
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      comments: [
        {
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          content: String,
          createdAt: {
            type: Date,
            default: Date.now,
          },
          replies: [
            {
              user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
              },
              content: String,
              createdAt: {
                type: Date,
                default: Date.now,
              },
            },
          ],
        },
      ],
    },
    notifications: {
      email: {
        sent: {
          type: Boolean,
          default: false,
        },
        sentAt: Date,
        recipients: [String],
      },
      sms: {
        sent: {
          type: Boolean,
          default: false,
        },
        sentAt: Date,
        recipients: [String],
      },
      push: {
        sent: {
          type: Boolean,
          default: false,
        },
        sentAt: Date,
      },
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    publishDate: Date,
    expiryDate: Date,
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

// Index for search and filtering
announcementSchema.index({ title: "text", content: "text" })
announcementSchema.index({ category: 1 })
announcementSchema.index({ status: 1 })
announcementSchema.index({ publishDate: -1 })
announcementSchema.index({ priority: 1 })

// Virtual for like count
announcementSchema.virtual("likeCount").get(function () {
  return this.engagement.likes.length
})

// Virtual for comment count
announcementSchema.virtual("commentCount").get(function () {
  return this.engagement.comments.length
})

module.exports = mongoose.model("Announcement", announcementSchema)
