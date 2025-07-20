const express = require("express")
const { query, validationResult } = require("express-validator")
const Message = require("../models/Message")
const { authenticateToken, requireRole } = require("../middleware/auth")

const router = express.Router()

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: System notifications and messaging
 */

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get user's notifications
 *     tags: [Notifications]
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
 *         description: Number of notifications per page
 *       - in: query
 *         name: unreadOnly
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Filter to show only unread notifications
 *     responses:
 *       200:
 *         description: List of user notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 notifications:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       type:
 *                         type: string
 *                         enum: [direct, broadcast, group]
 *                       subject:
 *                         type: string
 *                       content:
 *                         type: string
 *                       status:
 *                         type: string
 *                         enum: [sent, delivered, read]
 *                       readAt:
 *                         type: string
 *                         format: date-time
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       sender:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           firstName:
 *                             type: string
 *                           lastName:
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
 *                 unreadCount:
 *                   type: integer
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
  "/",
  authenticateToken,
  requireRole(["alumni"]),
  [
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
    query("unreadOnly").optional().isBoolean().withMessage("unreadOnly must be a boolean"),
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
      const unreadOnly = req.query.unreadOnly === "true"

      // Build filter query
      const filter = {
        "recipients.user": req.user.id,
      }

      if (unreadOnly) {
        filter["recipients.status"] = { $ne: "read" }
      }

      // Get total count
      const totalItems = await Message.countDocuments(filter)
      const totalPages = Math.ceil(totalItems / limit)

      // Get notifications with pagination
      const notifications = await Message.find(filter)
        .populate("sender", "firstName lastName")
        .populate("recipients.user", "firstName lastName")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()

      // Get unread count
      const unreadCount = await Message.countDocuments({
        "recipients.user": req.user.id,
        "recipients.status": { $ne: "read" },
      })

      // Format notifications for response
      const formattedNotifications = notifications.map((notification) => {
        const recipientInfo = notification.recipients.find(
          (r) => r.user._id.toString() === req.user.id
        )

        return {
          _id: notification._id,
          type: notification.type,
          subject: notification.subject,
          content: notification.content,
          status: recipientInfo ? recipientInfo.status : "sent",
          readAt: recipientInfo ? recipientInfo.readAt : null,
          createdAt: notification.createdAt,
          sender: notification.sender,
        }
      })

      res.json({
        notifications: formattedNotifications,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        unreadCount,
      })
    } catch (error) {
      console.error("Get notifications error:", error)
      res.status(500).json({ message: "Internal server error" })
    }
  }
)

/**
 * @swagger
 * /api/notifications/{id}:
 *   patch:
 *     summary: Mark notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 notification:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     status:
 *                       type: string
 *                     readAt:
 *                       type: string
 *                       format: date-time
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
 *         description: Notification not found
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
router.patch("/:id", authenticateToken, requireRole(["alumni"]), async (req, res) => {
  try {
    const notification = await Message.findOne({
      _id: req.params.id,
      "recipients.user": req.user.id,
    })

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" })
    }

    // Update recipient status to read
    const recipientIndex = notification.recipients.findIndex(
      (r) => r.user.toString() === req.user.id
    )

    if (recipientIndex !== -1) {
      notification.recipients[recipientIndex].status = "read"
      notification.recipients[recipientIndex].readAt = new Date()
      await notification.save()
    }

    res.json({
      message: "Notification marked as read",
      notification: {
        _id: notification._id,
        status: "read",
        readAt: notification.recipients[recipientIndex].readAt,
      },
    })
  } catch (error) {
    console.error("Mark notification as read error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})

/**
 * @swagger
 * /api/notifications/mark-all-read:
 *   patch:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 updatedCount:
 *                   type: integer
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
router.patch("/mark-all-read", authenticateToken, requireRole(["alumni"]), async (req, res) => {
  try {
    const result = await Message.updateMany(
      {
        "recipients.user": req.user.id,
        "recipients.status": { $ne: "read" },
      },
      {
        $set: {
          "recipients.$.status": "read",
          "recipients.$.readAt": new Date(),
        },
      }
    )

    res.json({
      message: "All notifications marked as read",
      updatedCount: result.modifiedCount,
    })
  } catch (error) {
    console.error("Mark all notifications as read error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})

module.exports = router 