const express = require("express")
const User = require("../models/User")
const Event = require("../models/Event")
const Payment = require("../models/Payment")
const { authenticateToken, requireRole } = require("../middleware/auth")

/**
 * @swagger
 * tags:
 *   name: System
 *   description: System settings and configuration
 */

const router = express.Router()

/**
 * @swagger
 * /api/system/settings:
 *   get:
 *     summary: Get system settings (Admin only)
 *     tags: [System]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System settings
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Server error
 */

// System settings
router.get("/settings", authenticateToken, requireRole(["admin"]), async (req, res) => {
  try {
    // This would typically come from a settings collection
    // For now, return default settings
    const settings = {
      general: {
        siteName: "Alumni Network",
        siteDescription: "Connect with your fellow alumni",
        contactEmail: "admin@alumninetwork.com",
        supportPhone: "+1234567890",
      },
      notifications: {
        emailEnabled: true,
        emailEnabled: true,
        pushEnabled: true,
      },
      payments: {
        stripeEnabled: true,
        mobileMoneyEnabled: true,
        defaultCurrency: "USD",
      },
      features: {
        jobBoardEnabled: true,
        eventsEnabled: true,
        announcementsEnabled: true,
        messagingEnabled: true,
      },
    }

    res.json(settings)
  } catch (error) {
    console.error("Get settings error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

/**
 * @swagger
 * /api/system/export/{type}:
 *   get:
 *     summary: Export system data (Admin only)
 *     tags: [System]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [users, events, payments]
 *         description: Type of data to export
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, csv]
 *           default: json
 *         description: Export format
 *     responses:
 *       200:
 *         description: Data exported successfully
 *       400:
 *         description: Invalid export type
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Server error
 */

// Export data
router.get("/export/:type", authenticateToken, requireRole(["admin"]), async (req, res) => {
  try {
    const { type } = req.params
    const { format = "json" } = req.query

    let data
    let filename

    switch (type) {
      case "users":
        data = await User.find({ isActive: true })
          .select("firstName lastName email phone profile.graduationYear profile.profession profile.company createdAt")
          .lean()
        filename = `users_export_${Date.now()}`
        break

      case "events":
        data = await Event.find().populate("organizer", "firstName lastName").lean()
        filename = `events_export_${Date.now()}`
        break

      case "payments":
        data = await Payment.find({ status: "completed" })
          .populate("user", "firstName lastName email")
          .select("-paymentDetails")
          .lean()
        filename = `payments_export_${Date.now()}`
        break

      default:
        return res.status(400).json({ message: "Invalid export type" })
    }

    if (format === "csv") {
      // Convert to CSV (simplified implementation)
      const csv = convertToCSV(data)
      res.setHeader("Content-Type", "text/csv")
      res.setHeader("Content-Disposition", `attachment; filename="${filename}.csv"`)
      res.send(csv)
    } else {
      res.setHeader("Content-Type", "application/json")
      res.setHeader("Content-Disposition", `attachment; filename="${filename}.json"`)
      res.json(data)
    }
  } catch (error) {
    console.error("Export data error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Helper function to convert JSON to CSV
function convertToCSV(data) {
  if (!data.length) return ""

  const headers = Object.keys(data[0])
  const csvHeaders = headers.join(",")

  const csvRows = data.map((row) => {
    return headers
      .map((header) => {
        const value = row[header]
        return typeof value === "string" ? `"${value}"` : value
      })
      .join(",")
  })

  return [csvHeaders, ...csvRows].join("\n")
}

module.exports = router 