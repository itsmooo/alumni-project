const mongoose = require("mongoose")

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["reunion", "webinar", "fundraiser", "networking", "workshop", "social", "other"],
      required: true,
    },
    date: {
      start: {
        type: Date,
        required: true,
      },
      end: {
        type: Date,
        required: true,
      },
    },
    location: {
      type: {
        type: String,
        enum: ["physical", "virtual", "hybrid"],
        required: true,
      },
      venue: String,
      address: String,
      city: String,
      country: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
      virtualLink: String,
      virtualPlatform: String,
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    capacity: {
      type: Number,
      default: null, // null means unlimited
    },
    registration: {
      isRequired: {
        type: Boolean,
        default: true,
      },
      deadline: Date,
      fee: {
        amount: {
          type: Number,
          default: 0,
        },
        currency: {
          type: String,
          default: "USD",
        },
      },
    },
    attendees: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        status: {
          type: String,
          enum: ["registered", "attended", "cancelled"],
          default: "registered",
        },
        registeredAt: {
          type: Date,
          default: Date.now,
        },
        paymentStatus: {
          type: String,
          enum: ["pending", "paid", "refunded"],
          default: "pending",
        },
      },
    ],
    images: [String],
    tags: [String],
    isPublic: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ["draft", "published", "cancelled", "completed"],
      default: "draft",
    },
    reminders: [
      {
        type: {
          type: String,
          enum: ["email", "sms", "push"],
        },
        timing: {
          type: String,
          enum: ["1hour", "1day", "1week"],
        },
        sent: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
)

// Index for search and filtering
eventSchema.index({ title: "text", description: "text", tags: "text" })
eventSchema.index({ "date.start": 1 })
eventSchema.index({ type: 1 })
eventSchema.index({ status: 1 })

// Virtual for attendee count
eventSchema.virtual("attendeeCount").get(function () {
  return this.attendees.filter((a) => a.status === "registered").length
})

module.exports = mongoose.model("Event", eventSchema)
