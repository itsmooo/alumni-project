const express = require("express")
const { body, query, validationResult } = require("express-validator")
const Payment = require("../models/Payment")
const { authenticateToken, requireRole } = require("../middleware/auth")
const { processMobileMoneyPayment } = require("../services/paymentService")

const router = express.Router()

/**
 * @swagger
 * tags:
 *   name: Donations
 *   description: Donation campaigns and payment processing
 */

/**
 * @swagger
 * /api/donations:
 *   get:
 *     summary: List active donation campaigns
 *     tags: [Donations]
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
 *         description: Number of campaigns per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [scholarship, infrastructure, events, general]
 *         description: Filter by donation category
 *     responses:
 *       200:
 *         description: List of donation campaigns
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 campaigns:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       category:
 *                         type: string
 *                       targetAmount:
 *                         type: number
 *                       currentAmount:
 *                         type: number
 *                       currency:
 *                         type: string
 *                       startDate:
 *                         type: string
 *                         format: date-time
 *                       endDate:
 *                         type: string
 *                         format: date-time
 *                       isActive:
 *                         type: boolean
 *                       image:
 *                         type: string
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
 *                     hasNextPage:
 *                       type: boolean
 *                     hasPrevPage:
 *                       type: boolean
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.get(
  "/",
  [
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Validation error", errors: errors.array() })
      }

      const page = parseInt(req.query.page) || 1
      const limit = parseInt(req.query.limit) || 20
      const skip = (page - 1) * limit

      // Build filter query
      const filter = { type: "donation", isActive: true }
      
      if (req.query.category) {
        filter.category = req.query.category
      }

      // Get total count
      const totalItems = await Payment.countDocuments(filter)
      const totalPages = Math.ceil(totalItems / limit)

      // Get donation campaigns with pagination
      const campaigns = await Payment.find(filter)
        .select("title description category targetAmount currentAmount currency startDate endDate isActive image")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()

      res.json({
        campaigns,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      })
    } catch (error) {
      console.error("Donation campaigns error:", error)
      res.status(500).json({ message: "Internal server error" })
    }
  }
)

/**
 * @swagger
 * /api/donations/{id}:
 *   get:
 *     summary: Get donation campaign details
 *     tags: [Donations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Campaign ID
 *     responses:
 *       200:
 *         description: Donation campaign details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 campaign:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     category:
 *                       type: string
 *                     targetAmount:
 *                       type: number
 *                     currentAmount:
 *                       type: number
 *                     currency:
 *                       type: string
 *                     startDate:
 *                       type: string
 *                       format: date-time
 *                     endDate:
 *                       type: string
 *                       format: date-time
 *                     isActive:
 *                       type: boolean
 *                     image:
 *                       type: string
 *                     progress:
 *                       type: number
 *                     daysLeft:
 *                       type: number
 *       404:
 *         description: Campaign not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.get("/:id", async (req, res) => {
  try {
    const campaign = await Payment.findOne({
      _id: req.params.id,
      type: "donation",
      isActive: true,
    }).lean()

    if (!campaign) {
      return res.status(404).json({ message: "Donation campaign not found" })
    }

    // Calculate progress and days left
    const progress = campaign.targetAmount > 0 ? (campaign.currentAmount / campaign.targetAmount) * 100 : 0
    const daysLeft = campaign.endDate ? Math.ceil((new Date(campaign.endDate) - new Date()) / (1000 * 60 * 60 * 24)) : null

    res.json({
      campaign: {
        ...campaign,
        progress: Math.round(progress * 100) / 100,
        daysLeft: daysLeft > 0 ? daysLeft : 0,
      },
    })
  } catch (error) {
    console.error("Get donation campaign error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})

/**
 * @swagger
 * /api/donations/{id}/pay:
 *   post:
 *     summary: Make a donation payment
 *     tags: [Donations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Campaign ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - paymentMethod
 *               - phoneNumber
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 1
 *                 description: Donation amount
 *               paymentMethod:
 *                 type: string
 *                 enum: [hormuud, zaad]
 *                 description: Payment method
 *               phoneNumber:
 *                 type: string
 *                 description: Phone number for mobile money payment
 *               message:
 *                 type: string
 *                 description: Optional message with donation
 *     responses:
 *       200:
 *         description: Payment initiated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 paymentId:
 *                   type: string
 *                 transactionId:
 *                   type: string
 *       400:
 *         description: Validation error or campaign not active
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Campaign not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.post(
  "/:id/pay",
  authenticateToken,
  requireRole(["alumni"]),
  [
    body("amount").isFloat({ min: 1 }).withMessage("Amount must be at least 1"),
    body("paymentMethod").isIn(["hormuud", "zaad"]).withMessage("Invalid payment method"),
    body("phoneNumber").notEmpty().withMessage("Phone number is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Validation error", errors: errors.array() })
      }

      // Check if campaign exists and is active
      const campaign = await Payment.findOne({
        _id: req.params.id,
        type: "donation",
        isActive: true,
      })

      if (!campaign) {
        return res.status(404).json({ message: "Donation campaign not found" })
      }

      // Check if campaign is still active
      if (campaign.endDate && new Date() > new Date(campaign.endDate)) {
        return res.status(400).json({ message: "Donation campaign has ended" })
      }

      // Create payment record
      const payment = new Payment({
        user: req.user.id,
        amount: req.body.amount,
        currency: campaign.currency || "USD",
        type: "donation",
        purpose: `Donation to ${campaign.title}`,
        paymentMethod: req.body.paymentMethod,
        phoneNumber: req.body.phoneNumber,
        status: "pending",
        metadata: {
          campaignId: campaign._id,
          campaignTitle: campaign.title,
          message: req.body.message,
        },
      })

      await payment.save()

      // Process mobile money payment
      const paymentResult = await processMobileMoneyPayment({
        amount: req.body.amount,
        phoneNumber: req.body.phoneNumber,
        paymentMethod: req.body.paymentMethod,
        reference: payment._id.toString(),
        description: `Donation to ${campaign.title}`,
      })

      if (paymentResult.success) {
        payment.status = "completed"
        payment.transactionId = paymentResult.transactionId
        payment.completedAt = new Date()
        await payment.save()

        // Update campaign current amount
        campaign.currentAmount += req.body.amount
        await campaign.save()

        res.json({
          message: "Donation payment successful",
          paymentId: payment._id,
          transactionId: paymentResult.transactionId,
        })
      } else {
        payment.status = "failed"
        payment.failureReason = paymentResult.error
        await payment.save()

        res.status(400).json({
          message: "Payment failed",
          error: paymentResult.error,
        })
      }
    } catch (error) {
      console.error("Donation payment error:", error)
      res.status(500).json({ message: "Internal server error" })
    }
  }
)

/**
 * @swagger
 * /api/donations/my:
 *   get:
 *     summary: Get user's donation history
 *     tags: [Donations]
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
 *         description: Number of donations per page
 *     responses:
 *       200:
 *         description: User's donation history
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 donations:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       amount:
 *                         type: number
 *                       currency:
 *                         type: string
 *                       purpose:
 *                         type: string
 *                       status:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       completedAt:
 *                         type: string
 *                         format: date-time
 *                       metadata:
 *                         type: object
 *                         properties:
 *                           campaignTitle:
 *                             type: string
 *                           message:
 *                             type: string
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
 *                     hasNextPage:
 *                       type: boolean
 *                     hasPrevPage:
 *                       type: boolean
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.get(
  "/my",
  authenticateToken,
  requireRole(["alumni"]),
  [
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Validation error", errors: errors.array() })
      }

      const page = parseInt(req.query.page) || 1
      const limit = parseInt(req.query.limit) || 20
      const skip = (page - 1) * limit

      // Get user's donations
      const filter = { user: req.user.id, type: "donation" }
      const totalItems = await Payment.countDocuments(filter)
      const totalPages = Math.ceil(totalItems / limit)

      const donations = await Payment.find(filter)
        .select("amount currency purpose status createdAt completedAt metadata")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()

      res.json({
        donations,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      })
    } catch (error) {
      console.error("Get user donations error:", error)
      res.status(500).json({ message: "Internal server error" })
    }
  }
)

module.exports = router 