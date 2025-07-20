const express = require("express")
const { query, validationResult } = require("express-validator")
const Payment = require("../models/Payment")
const { authenticateToken, requireRole } = require("../middleware/auth")

const router = express.Router()

/**
 * @swagger
 * tags:
 *   name: Transactions
 *   description: Personal transaction history
 */

/**
 * @swagger
 * /api/transactions/my:
 *   get:
 *     summary: Get user's transaction history
 *     tags: [Transactions]
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
 *         description: Number of transactions per page
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [donation, event_ticket, membership, merchandise]
 *         description: Filter by transaction type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed, failed, cancelled]
 *         description: Filter by transaction status
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter transactions from this date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter transactions until this date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: User's transaction history
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 transactions:
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
 *                       type:
 *                         type: string
 *                       purpose:
 *                         type: string
 *                       status:
 *                         type: string
 *                       paymentMethod:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       completedAt:
 *                         type: string
 *                         format: date-time
 *                       transactionId:
 *                         type: string
 *                       metadata:
 *                         type: object
 *                         properties:
 *                           campaignTitle:
 *                             type: string
 *                           eventTitle:
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
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalAmount:
 *                       type: number
 *                     totalTransactions:
 *                       type: integer
 *                     completedTransactions:
 *                       type: integer
 *                     pendingTransactions:
 *                       type: integer
 *                     failedTransactions:
 *                       type: integer
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
    query("type").optional().isIn(["donation", "event_ticket", "membership", "merchandise"]).withMessage("Invalid transaction type"),
    query("status").optional().isIn(["pending", "completed", "failed", "cancelled"]).withMessage("Invalid status"),
    query("startDate").optional().isISO8601().withMessage("Invalid start date format"),
    query("endDate").optional().isISO8601().withMessage("Invalid end date format"),
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
      const filter = { user: req.user.id }
      
      if (req.query.type) {
        filter.type = req.query.type
      }

      if (req.query.status) {
        filter.status = req.query.status
      }

      if (req.query.startDate || req.query.endDate) {
        filter.createdAt = {}
        if (req.query.startDate) {
          filter.createdAt.$gte = new Date(req.query.startDate)
        }
        if (req.query.endDate) {
          filter.createdAt.$lte = new Date(req.query.endDate + "T23:59:59.999Z")
        }
      }

      // Get total count
      const totalItems = await Payment.countDocuments(filter)
      const totalPages = Math.ceil(totalItems / limit)

      // Get transactions with pagination
      const transactions = await Payment.find(filter)
        .select("amount currency type purpose status paymentMethod createdAt completedAt transactionId metadata")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()

      // Calculate summary statistics
      const summary = await Payment.aggregate([
        { $match: { user: req.user.id } },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$amount" },
            totalTransactions: { $sum: 1 },
            completedTransactions: {
              $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
            },
            pendingTransactions: {
              $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
            },
            failedTransactions: {
              $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] },
            },
          },
        },
      ])

      const summaryData = summary[0] || {
        totalAmount: 0,
        totalTransactions: 0,
        completedTransactions: 0,
        pendingTransactions: 0,
        failedTransactions: 0,
      }

      res.json({
        transactions,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        summary: summaryData,
      })
    } catch (error) {
      console.error("Get transactions error:", error)
      res.status(500).json({ message: "Internal server error" })
    }
  }
)

/**
 * @swagger
 * /api/transactions/my/{id}:
 *   get:
 *     summary: Get specific transaction details
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction ID
 *     responses:
 *       200:
 *         description: Transaction details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 transaction:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     amount:
 *                       type: number
 *                     currency:
 *                       type: string
 *                     type:
 *                       type: string
 *                     purpose:
 *                       type: string
 *                     status:
 *                       type: string
 *                     paymentMethod:
 *                       type: string
 *                     phoneNumber:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     completedAt:
 *                       type: string
 *                       format: date-time
 *                     transactionId:
 *                       type: string
 *                     failureReason:
 *                       type: string
 *                     metadata:
 *                       type: object
 *                       properties:
 *                         campaignTitle:
 *                           type: string
 *                         eventTitle:
 *                           type: string
 *                         message:
 *                           type: string
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       403:
 *         description: Access denied
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Transaction not found
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
router.get("/my/:id", authenticateToken, requireRole(["alumni"]), async (req, res) => {
  try {
    const transaction = await Payment.findOne({
      _id: req.params.id,
      user: req.user.id,
    }).lean()

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" })
    }

    res.json({ transaction })
  } catch (error) {
    console.error("Get transaction details error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})

module.exports = router 