const mongoose = require("mongoose")

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["membership", "donation", "event_ticket", "merchandise"],
      required: true,
    },
    purpose: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "USD",
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["hormuud", "zaad", "card", "paypal", "bank_transfer"],
      required: true,
    },
    paymentDetails: {
      // For mobile money
      phoneNumber: String,
      transactionId: String,

      // For card payments
      cardLast4: String,
      cardBrand: String,

      // For PayPal
      paypalTransactionId: String,
      paypalPayerId: String,

      // For bank transfer
      bankReference: String,

      // External payment processor IDs
      stripePaymentIntentId: String,
      paypalOrderId: String,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed", "cancelled", "refunded"],
      default: "pending",
    },
    relatedEntity: {
      entityType: {
        type: String,
        enum: ["event", "membership", "donation_campaign"],
      },
      entityId: mongoose.Schema.Types.ObjectId,
    },
    receipt: {
      receiptNumber: {
        type: String,
        unique: true,
      },
      issuedAt: Date,
      downloadUrl: String,
    },
    refund: {
      amount: Number,
      reason: String,
      processedAt: Date,
      refundId: String,
    },
    metadata: {
      ipAddress: String,
      userAgent: String,
      source: String, // web, mobile, admin
    },
    notes: String,
    processedAt: Date,
    failureReason: String,
  },
  {
    timestamps: true,
  },
)

// Index for queries
paymentSchema.index({ user: 1, createdAt: -1 })
paymentSchema.index({ status: 1 })
paymentSchema.index({ type: 1 })

// Generate receipt number
paymentSchema.pre("save", function (next) {
  if (this.isNew && !this.receipt.receiptNumber) {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0")

    this.receipt.receiptNumber = `ALM-${year}${month}${day}-${random}`
  }
  next()
})

module.exports = mongoose.model("Payment", paymentSchema)
