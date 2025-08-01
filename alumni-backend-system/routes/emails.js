const express = require("express")
const { body, validationResult } = require("express-validator")
const { authenticateToken, requireRole } = require("../middleware/auth")
const { sendEmail, sendBulkEmail } = require("../services/notificationService")
const User = require("../models/User")
const Message = require("../models/Message")

const router = express.Router()

/**
 * @swagger
 * tags:
 *   name: Emails
 *   description: Email sending functionality
 */

/**
 * @swagger
 * /api/emails/send:
 *   post:
 *     summary: Send email to users
 *     tags: [Emails]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subject
 *               - message
 *               - recipientType
 *             properties:
 *               subject:
 *                 type: string
 *                 description: Email subject
 *               message:
 *                 type: string
 *                 description: Email message content
 *               recipientType:
 *                 type: string
 *                 enum: [all, students, specific]
 *                 description: Type of recipients
 *               specificUser:
 *                 type: string
 *                 description: Email address for specific user (required if recipientType is 'specific')
 *               sendEmail:
 *                 type: boolean
 *                 default: true
 *                 description: Whether to send email
 *               sendNotification:
 *                 type: boolean
 *                 default: true
 *                 description: Whether to send in-app notification
 *     responses:
 *       200:
 *         description: Email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 sentCount:
 *                   type: number
 *                 failedCount:
 *                   type: number
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */
router.post("/send", authenticateToken, requireRole(["admin"]), [
  body("subject").notEmpty().withMessage("Subject is required"),
  body("message").notEmpty().withMessage("Message is required"),
     body("recipientType").isIn(["all", "students", "specific", "multiple"]).withMessage("Invalid recipient type"),
  body("specificUser").optional().isEmail().withMessage("Invalid email address"),
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Validation error", errors: errors.array() })
    }

         const {
       subject,
       message,
       recipientType,
       specificUser,
       selectedUsers = [],
       sendEmail: shouldSendEmail = true,
       sendNotification: shouldSendNotification = true,
     } = req.body

         // Validate specific user if required
     if (recipientType === "specific" && !specificUser) {
       return res.status(400).json({ message: "Specific user email is required" })
     }
     
     // Validate selected users if required
     if (recipientType === "multiple" && (!selectedUsers || selectedUsers.length === 0)) {
       return res.status(400).json({ message: "At least one user must be selected" })
     }

    let recipients = []
    let notificationRecipients = []

    // Get recipients based on type
    switch (recipientType) {
      case "all":
        recipients = await User.find({ role: "alumni" }).select("email firstName lastName")
        notificationRecipients = await User.find({ role: "alumni" }).select("_id")
        break
      case "students":
        recipients = await User.find({ role: "student" }).select("email firstName lastName")
        notificationRecipients = await User.find({ role: "student" }).select("_id")
        break
             case "specific":
         const user = await User.findOne({ email: specificUser }).select("email firstName lastName _id")
         if (!user) {
           return res.status(404).json({ message: "User not found" })
         }
         recipients = [user]
         notificationRecipients = [user]
         break
       case "multiple":
         const selectedUserIds = selectedUsers.map(id => id)
         const multipleUsers = await User.find({ _id: { $in: selectedUserIds } }).select("email firstName lastName _id")
         if (multipleUsers.length === 0) {
           return res.status(404).json({ message: "No users found" })
         }
         recipients = multipleUsers
         notificationRecipients = multipleUsers
         break
    }

    if (recipients.length === 0) {
      return res.status(404).json({ message: "No recipients found" })
    }

    let emailResults = { sent: 0, failed: 0 }
    let notificationResults = { sent: 0, failed: 0 }

    // Send emails if requested
    if (shouldSendEmail) {
      try {
        const emailAddresses = recipients.map(user => user.email)
        const htmlMessage = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Alumni Network</h2>
            <h3>${subject}</h3>
            <div style="line-height: 1.6; color: #374151;">
              ${message.replace(/\n/g, '<br>')}
            </div>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 12px; color: #6b7280;">
              This email was sent from the Alumni Network system.
            </p>
          </div>
        `

        const result = await sendBulkEmail(emailAddresses, {
          subject,
          html: htmlMessage,
          text: message,
        })

        emailResults = result
      } catch (error) {
        console.error("Email sending error:", error)
        emailResults = { sent: 0, failed: recipients.length }
      }
    }

    // Send notifications if requested
    if (shouldSendNotification) {
      try {
        const notification = new Message({
          type: "broadcast",
          subject,
          content: message,
          sender: req.user.id,
          recipients: notificationRecipients.map(user => ({
            user: user._id,
            status: "sent",
            sentAt: new Date(),
          })),
        })

        await notification.save()
        notificationResults = { sent: notificationRecipients.length, failed: 0 }
      } catch (error) {
        console.error("Notification sending error:", error)
        notificationResults = { sent: 0, failed: notificationRecipients.length }
      }
    }

    res.json({
      success: true,
      message: "Communication sent successfully",
      emailResults,
      notificationResults,
      totalRecipients: recipients.length,
    })

  } catch (error) {
    console.error("Send email error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})

module.exports = router 