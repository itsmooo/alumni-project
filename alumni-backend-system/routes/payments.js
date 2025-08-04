const express = require("express")
const { body, validationResult } = require("express-validator")
const Payment = require("../models/Payment")
const { authenticateToken, requireRole } = require("../middleware/auth")
const {
  createStripePayment,
  processMobileMoneyPayment,
  handleStripeWebhook,
  generateReceipt,
} = require("../services/paymentService")
const axios = require("axios")

// Hormuud Payment API endpoint
const HORMUUD_API_URL = "https://api.waafipay.net/asm"

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment processing and management
 */

/**
 * @swagger
 * /api/payments/create-intent:
 *   post:
 *     summary: Create payment intent
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - currency
 *               - type
 *               - purpose
 *               - paymentMethod
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *                 description: Payment amount
 *               currency:
 *                 type: string
 *                 enum: [USD, EUR, GBP]
 *                 description: Payment currency
 *               type:
 *                 type: string
 *                 enum: [membership, donation, event_ticket, merchandise]
 *                 description: Payment type
 *               purpose:
 *                 type: string
 *                 description: Payment purpose
 *               paymentMethod:
 *                 type: string
 *                 enum: [card, hormuud, zaad]
 *                 description: Payment method
 *               phoneNumber:
 *                 type: string
 *                 description: Phone number (required for mobile money payments)
 *     responses:
 *       200:
 *         description: Payment intent created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 paymentIntent:
 *                   type: object
 *                 clientSecret:
 *                   type: string
 *       400:
 *         description: Validation error or missing phone number for mobile money
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/payments/my-payments:
 *   get:
 *     summary: Get user's payments
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of payments per page
 *     responses:
 *       200:
 *         description: List of user payments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 payments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Payment'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/payments/{id}:
 *   get:
 *     summary: Get payment by ID
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment ID
 *     responses:
 *       200:
 *         description: Payment details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Payment'
 *       403:
 *         description: Access denied
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Payment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/payments/{id}/receipt:
 *   get:
 *     summary: Download payment receipt
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment ID
 *     responses:
 *       200:
 *         description: Receipt HTML
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *       400:
 *         description: Receipt not available for incomplete payments
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Access denied
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Payment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/payments/webhook/stripe:
 *   post:
 *     summary: Stripe webhook endpoint
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Stripe webhook payload
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 received:
 *                   type: boolean
 *       400:
 *         description: Webhook error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/payments/admin/all:
 *   get:
 *     summary: Get all payments (Admin only)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Number of payments per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, completed, failed, cancelled, refunded]
 *         description: Filter by payment status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [membership, donation, event_ticket, merchandise]
 *         description: Filter by payment type
 *       - in: query
 *         name: paymentMethod
 *         schema:
 *           type: string
 *           enum: [hormuud, zaad, card, paypal, bank_transfer]
 *         description: Filter by payment method
 *     responses:
 *       200:
 *         description: List of all payments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 payments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Payment'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/payments/admin/analytics:
 *   get:
 *     summary: Get payment analytics (Admin only)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for analytics
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for analytics
 *     responses:
 *       200:
 *         description: Payment analytics data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalRevenue:
 *                   type: number
 *                 totalTransactions:
 *                   type: number
 *                 averageTransaction:
 *                   type: number
 *                 revenueByType:
 *                   type: object
 *                 revenueByMethod:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

const router = express.Router()

// Create payment intent
router.post(
  "/create-intent",
  authenticateToken,
  [
    body("amount").isFloat({ min: 0.01 }).withMessage("Amount must be greater than 0"),
    body("currency").isIn(["USD", "EUR", "GBP"]).withMessage("Invalid currency"),
    body("type").isIn(["membership", "donation", "event_ticket", "merchandise"]).withMessage("Invalid payment type"),
    body("purpose").notEmpty().withMessage("Purpose is required"),
    body("paymentMethod").isIn(["card", "hormuud", "zaad"]).withMessage("Invalid payment method"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { amount, currency, type, purpose, paymentMethod, phoneNumber } = req.body
      const userId = req.user._id

      let result

      if (paymentMethod === "card") {
        result = await createStripePayment({
          amount,
          currency,
          userId,
          type,
          purpose,
        })
      } else if (["hormuud", "zaad"].includes(paymentMethod)) {
        if (!phoneNumber) {
          return res.status(400).json({ message: "Phone number is required for mobile money payments" })
        }

        result = await processMobileMoneyPayment({
          phoneNumber,
          amount,
          currency,
          userId,
          type,
          purpose,
          provider: paymentMethod,
        })
      }

      res.json(result)
    } catch (error) {
      console.error("Create payment intent error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Get user payments
router.get("/my-payments", authenticateToken, async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit

    const payments = await Payment.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-paymentDetails.stripePaymentIntentId -paymentDetails.paypalOrderId")

    const total = await Payment.countDocuments({ user: req.user._id })

    res.json({
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get user payments error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get payment by ID
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate("user", "firstName lastName email")

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" })
    }

    // Check if user owns this payment or is admin
    if (payment.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" })
    }

    res.json(payment)
  } catch (error) {
    console.error("Get payment error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Download receipt
router.get("/:id/receipt", authenticateToken, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" })
    }

    // Check if user owns this payment or is admin
    if (payment.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" })
    }

    if (payment.status !== "completed") {
      return res.status(400).json({ message: "Receipt not available for incomplete payments" })
    }

    const receiptHtml = await generateReceipt(payment._id)

    res.setHeader("Content-Type", "text/html")
    res.send(receiptHtml)
  } catch (error) {
    console.error("Download receipt error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Stripe webhook
router.post("/webhook/stripe", express.raw({ type: "application/json" }), async (req, res) => {
  try {
    const sig = req.headers["stripe-signature"]
    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)

    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)

    await handleStripeWebhook(event)

    res.json({ received: true })
  } catch (error) {
    console.error("Stripe webhook error:", error)
    res.status(400).json({ message: "Webhook error" })
  }
})

// Admin: Get all payments
router.get("/admin/all", authenticateToken, requireRole(["admin"]), async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 50
    const skip = (page - 1) * limit

    const filter = {}
    if (req.query.status) {
      filter.status = req.query.status
    }
    if (req.query.type) {
      filter.type = req.query.type
    }
    if (req.query.paymentMethod) {
      filter.paymentMethod = req.query.paymentMethod
    }

    const payments = await Payment.find(filter)
      .populate("user", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Payment.countDocuments(filter)

    res.json({
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Admin get payments error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Admin: Payment analytics
router.get("/admin/analytics", authenticateToken, requireRole(["admin"]), async (req, res) => {
  try {
    const { startDate, endDate } = req.query

    const dateFilter = {}
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      }
    }

    const analytics = await Payment.aggregate([
      { $match: { ...dateFilter, status: "completed" } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" },
          totalTransactions: { $sum: 1 },
          averageTransaction: { $avg: "$amount" },
          revenueByType: {
            $push: {
              type: "$type",
              amount: "$amount",
            },
          },
          revenueByMethod: {
            $push: {
              method: "$paymentMethod",
              amount: "$amount",
            },
          },
        },
      },
    ])

    // Group revenue by type and method
    const typeRevenue = {}
    const methodRevenue = {}

    if (analytics[0]) {
      analytics[0].revenueByType.forEach((item) => {
        typeRevenue[item.type] = (typeRevenue[item.type] || 0) + item.amount
      })

      analytics[0].revenueByMethod.forEach((item) => {
        methodRevenue[item.method] = (methodRevenue[item.method] || 0) + item.amount
      })
    }

    res.json({
      totalRevenue: analytics[0]?.totalRevenue || 0,
      totalTransactions: analytics[0]?.totalTransactions || 0,
      averageTransaction: analytics[0]?.averageTransaction || 0,
      revenueByType: typeRevenue,
      revenueByMethod: methodRevenue,
    })
  } catch (error) {
    console.error("Payment analytics error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Hormuud Payment route
router.post("/hormuud", authenticateToken, async (req, res) => {
  try {
    const { phone, amount } = req.body;
    console.log("Hormuud payment request:", { phone, amount });
    
    // Validate required fields
    if (!phone || !amount) {
      return res.status(400).json({
        error: "Phone number and amount are required"
      });
    }

    // Check if Hormuud environment variables are configured
    const hormuudConfig = {
      merchantUid: process.env.HORMUUD_MERCHANT_UID,
      apiUserId: process.env.HORMUUD_API_USER_ID,
      apiKey: process.env.HORMUUD_API_KEY,
    };

    // Check if any required config is missing
    const missingConfig = Object.entries(hormuudConfig)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    if (missingConfig.length > 0) {
      console.error("Missing Hormuud configuration:", missingConfig);
      return res.status(500).json({
        success: false,
        message: "Hormuud payment service is not configured. Please contact administrator.",
        error: `Missing configuration: ${missingConfig.join(', ')}`
      });
    }

    const paymentData = {
      schemaVersion: "1.0",
      requestId: Date.now().toString(),
      timestamp: new Date().toISOString(),
      channelName: "WEB",
      serviceName: "API_PURCHASE",
      serviceParams: {
        merchantUid: hormuudConfig.merchantUid,
        apiUserId: hormuudConfig.apiUserId,
        apiKey: hormuudConfig.apiKey,
        paymentMethod: "mwallet_account",
        payerInfo: {
          accountNo: phone,
        },
        transactionInfo: {
          referenceId: `REF_${Date.now()}`,
          invoiceId: `INV_${Date.now()}`,
          amount: amount,
          currency: "USD",
          description: "Alumni Network Payment",
        },
      },
    };

    console.log("Sending request to Hormuud API:", {
      ...paymentData,
      serviceParams: {
        ...paymentData.serviceParams,
        apiKey: "***HIDDEN***" // Hide sensitive data in logs
      }
    });

    const response = await axios.post(HORMUUD_API_URL, paymentData, {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 30000, // 30 second timeout
    });

    console.log("Hormuud API response:", response.data);

    const hormuudResponse = response.data;
    const params = hormuudResponse.params || {};
    const isSuccess =
      hormuudResponse.responseMsg === 'RCS_SUCCESS' &&
      params.state === 'APPROVED' &&
      (hormuudResponse.responseCode === '0' || hormuudResponse.responseCode === '2001');

    // Create a payment record in the database
    const payment = new Payment({ 
      user: req.user._id,
      type: "event_ticket", // Use a valid type from the Payment model enum
      purpose: "Hormuud Payment Test",
      amount: amount,
      currency: "USD",
      paymentMethod: "hormuud",
      paymentDetails: {
        phoneNumber: phone,
        transactionId: hormuudResponse.requestId || hormuudResponse.transactionId,
      },
      status: isSuccess ? "processing" : "failed",
      receipt: {
        receiptNumber: `HORMUUD_${Date.now()}`,
        issuedAt: new Date(),
      },
      metadata: {
        source: "mobile_app",
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      },
    });

    await payment.save();

    if (!isSuccess) {
      return res.status(400).json({
        success: false,
        message: "Payment was not approved",
        hormuudResponse
      });
    }

    res.json({
      success: true,
      paymentId: payment._id,
      requestId: hormuudResponse.requestId || hormuudResponse.transactionId,
      message: "Payment initiated successfully",
      hormuudResponse,
    });

  } catch (error) {
    console.error("Hormuud payment error:", error);
    
    // Handle specific error types
    if (error.code === 'ECONNABORTED') {
      return res.status(408).json({
        success: false,
        message: "Payment request timed out. Please try again.",
        error: "Request timeout"
      });
    }
    
    if (error.response) {
      // API responded with error status
      console.error("Hormuud API error response:", error.response.data);
      return res.status(400).json({
        success: false,
        message: "Payment processing failed",
        hormuudResponse: error.response.data,
        error: error.response.data?.params?.description || error.response.data?.responseMsg || "API Error"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Payment processing failed",
      error: error.message || "Unknown error occurred"
    });
  }
});

module.exports = router
