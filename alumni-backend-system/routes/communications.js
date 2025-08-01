const express = require("express")
const router = express.Router()
const { body, validationResult } = require("express-validator")
const { authenticateToken, requireRole } = require("../middleware/auth")
const { sendBulkEmail } = require("../services/notificationService")
const User = require("../models/User")

/**
 * @swagger
 * components:
 *   schemas:
 *     BulkCommunicationRequest:
 *       type: object
 *       required:
 *         - type
 *         - subject
 *         - message
 *         - recipients
 *       properties:
 *         type:
 *           type: string
 *           enum: [email, push]
 *           description: Type of communication
 *         subject:
 *           type: string
 *           description: Subject line for email
 *         message:
 *           type: string
 *           description: Message content
 *         recipients:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of recipient IDs or "all" for all users
 *         filters:
 *           type: object
 *           description: Optional filters for targeting specific users
 *           properties:
 *             roles:
 *               type: array
 *               items:
 *                 type: string
 *             graduationYears:
 *               type: array
 *               items:
 *                 type: number
 *             locations:
 *               type: array
 *               items:
 *                 type: string
 *             industries:
 *               type: array
 *               items:
 *                 type: string
 *     BulkCommunicationResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         sent:
 *           type: number
 *         failed:
 *           type: number
 *         totalRecipients:
 *           type: number
 *         message:
 *           type: string
 */

/**
 * @swagger
 * /api/communications/bulk:
 *   post:
 *     summary: Send bulk communication to users
 *     tags: [Communications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BulkCommunicationRequest'
 *     responses:
 *       200:
 *         description: Communication sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BulkCommunicationResponse'
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */
router.post("/bulk", authenticateToken, requireRole(["admin"]), [
  body("type").isIn(["email", "push"]).withMessage("Invalid communication type"),
  body("subject").notEmpty().withMessage("Subject is required"),
  body("message").notEmpty().withMessage("Message is required"),
  body("recipients").isArray().withMessage("Recipients must be an array"),
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array()
      })
    }

    const { type, subject, message, recipients, filters } = req.body

    // Get target users based on recipients and filters
    let targetUsers = []

    if (recipients.includes("all")) {
      // Get all users with optional filters
      let query = {}
      
      if (filters) {
        if (filters.roles && filters.roles.length > 0) {
          query.role = { $in: filters.roles }
        }
        if (filters.graduationYears && filters.graduationYears.length > 0) {
          query["profile.graduationYear"] = { $in: filters.graduationYears }
        }
        if (filters.locations && filters.locations.length > 0) {
          query["profile.location.city"] = { $in: filters.locations }
        }
        if (filters.industries && filters.industries.length > 0) {
          query["profile.profession"] = { $in: filters.industries }
        }
      }

      targetUsers = await User.find(query).select("email firstName lastName")
    } else {
      // Get specific users by ID
      targetUsers = await User.find({ _id: { $in: recipients } }).select("email firstName lastName")
    }

    if (targetUsers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No recipients found matching the criteria"
      })
    }

    let result = { sent: 0, failed: 0 }

    if (type === "email") {
      // Send bulk email
      const emailRecipients = targetUsers.map(user => user.email)
      const emailContent = {
        subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">${subject}</h2>
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
              ${message.replace(/\n/g, '<br>')}
            </div>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">
              This message was sent from the Alumni Network System.<br>
              If you have any questions, please contact the alumni office.
            </p>
          </div>
        `,
        text: message
      }

      result = await sendBulkEmail(emailRecipients, emailContent)
    } else if (type === "push") {
      // For push notifications, we'll just log for now
      // In a real implementation, you'd integrate with a push notification service
      console.log(`Push notification would be sent to ${targetUsers.length} users`)
      result = { sent: targetUsers.length, failed: 0 }
    }

    return res.json({
      success: true,
      sent: result.sent,
      failed: result.failed,
      totalRecipients: targetUsers.length,
      message: `Successfully sent ${type} to ${result.sent} recipients`
    })

  } catch (error) {
    console.error("Bulk communication error:", error)
    return res.status(500).json({
      success: false,
      message: "Failed to send bulk communication",
      error: error.message
    })
  }
})

/**
 * @swagger
 * /api/communications/templates:
 *   get:
 *     summary: Get communication templates
 *     tags: [Communications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of communication templates
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 templates:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       type:
 *                         type: string
 *                       subject:
 *                         type: string
 *                       content:
 *                         type: string
 *                       category:
 *                         type: string
 */
router.get("/templates", authenticateToken, requireRole(["admin"]), async (req, res) => {
  try {
    // In a real implementation, you'd store templates in a database
    const templates = [
      {
        id: "1",
        name: "Welcome New Alumni",
        type: "email",
        subject: "Welcome to the Alumni Network!",
        content: "Dear {firstName},\n\nWelcome to our alumni network! We're excited to have you join our community of graduates.\n\nBest regards,\nAlumni Team",
        category: "Welcome"
      },
      {
        id: "2",
        name: "Event Reminder",
        type: "email",
        subject: "Don't Miss: {eventName} - {eventDate}",
        content: "Hi {firstName},\n\nThis is a friendly reminder about the upcoming event: {eventName}\n\nDate: {eventDate}\nLocation: {eventLocation}\n\nWe look forward to seeing you there!",
        category: "Events"
      },
      {
        id: "3",
        name: "Newsletter Update",
        type: "email",
        subject: "Alumni Newsletter - {month} {year}",
        content: "Dear Alumni,\n\nHere's what's happening in our community this month:\n\n• Recent achievements\n• Upcoming events\n• New job opportunities\n\nStay connected!",
        category: "Newsletter"
      },
      {
        id: "4",
        name: "Job Alert",
        type: "email",
        subject: "New Job Opportunity",
        content: "New job posted: {jobTitle} at {company}. Check your alumni portal for details!",
        category: "Jobs"
      },
      {
        id: "5",
        name: "Emergency Alert",
        type: "push",
        subject: "Important Notice",
        content: "Important update from the Alumni Office. Please check your email for details.",
        category: "Emergency"
      }
    ]

    return res.json({ templates })
  } catch (error) {
    console.error("Get templates error:", error)
    return res.status(500).json({
      success: false,
      message: "Failed to get templates"
    })
  }
})

module.exports = router 