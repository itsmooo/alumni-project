const mongoose = require("mongoose")

const messageSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["direct", "broadcast", "group"],
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipients: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        status: {
          type: String,
          enum: ["sent", "delivered", "read"],
          default: "sent",
        },
        readAt: Date,
      },
    ],
    subject: String,
    content: {
      type: String,
      required: true,
    },
    attachments: [
      {
        filename: String,
        url: String,
        size: Number,
        mimeType: String,
      },
    ],
    channels: [
      {
        type: String,
        enum: ["email", "sms", "push", "in_app"],
      },
    ],
    delivery: {
      email: {
        sent: {
          type: Boolean,
          default: false,
        },
        sentAt: Date,
        messageId: String,
        failures: [String],
      },
      sms: {
        sent: {
          type: Boolean,
          default: false,
        },
        sentAt: Date,
        messageId: String,
        failures: [String],
      },
      push: {
        sent: {
          type: Boolean,
          default: false,
        },
        sentAt: Date,
        messageId: String,
      },
    },
    targetAudience: {
      graduationYears: [Number],
      locations: [String],
      roles: [String],
      customFilter: mongoose.Schema.Types.Mixed,
    },
    scheduledFor: Date,
    priority: {
      type: String,
      enum: ["low", "normal", "high"],
      default: "normal",
    },
    status: {
      type: String,
      enum: ["draft", "scheduled", "sending", "sent", "failed"],
      default: "draft",
    },
    analytics: {
      totalRecipients: {
        type: Number,
        default: 0,
      },
      delivered: {
        type: Number,
        default: 0,
      },
      opened: {
        type: Number,
        default: 0,
      },
      clicked: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  },
)

// Index for queries
messageSchema.index({ sender: 1, createdAt: -1 })
messageSchema.index({ type: 1 })
messageSchema.index({ status: 1 })
messageSchema.index({ scheduledFor: 1 })

module.exports = mongoose.model("Message", messageSchema)
