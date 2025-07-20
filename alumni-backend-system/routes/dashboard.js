const express = require("express")
const { query, validationResult } = require("express-validator")
const User = require("../models/User")
const Event = require("../models/Event")
const Announcement = require("../models/Announcement")
const Payment = require("../models/Payment")
const Job = require("../models/Job")
const { authenticateToken, requireRole } = require("../middleware/auth")

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Admin dashboard analytics and statistics
 */

const router = express.Router()

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     summary: Get dashboard analytics (Admin only)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for analytics period
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for analytics period
 *     responses:
 *       200:
 *         description: Dashboard analytics data
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Server error
 */

// Dashboard analytics
router.get("/", authenticateToken, requireRole(["admin"]), async (req, res) => {
  try {
    const { startDate, endDate } = req.query

    const dateFilter = {}
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      }
    }

    // User statistics
    const totalUsers = await User.countDocuments({ isActive: true })
    const newUsers = await User.countDocuments({
      ...dateFilter,
      isActive: true,
    })
    const usersByRole = await User.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ])

    // Event statistics
    const totalEvents = await Event.countDocuments()
    const upcomingEvents = await Event.countDocuments({
      "date.start": { $gte: new Date() },
      status: "published",
    })
    const eventsByType = await Event.aggregate([{ $group: { _id: "$type", count: { $sum: 1 } } }])

    // Payment statistics
    const totalRevenue = await Payment.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ])

    const recentRevenue = await Payment.aggregate([
      {
        $match: {
          status: "completed",
          ...dateFilter,
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ])

    // Announcement statistics
    const totalAnnouncements = await Announcement.countDocuments({ status: "published" })
    const announcementsByCategory = await Announcement.aggregate([
      { $match: { status: "published" } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ])

    // Job statistics
    const totalJobs = await Job.countDocuments({ status: "active" })
    const jobsByCategory = await Job.aggregate([
      { $match: { status: "active" } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ])

    // Recent activity
    const recentUsers = await User.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("firstName lastName email createdAt")

    const recentEvents = await Event.find()
      .populate("organizer", "firstName lastName")
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title type date.start organizer createdAt")

    res.json({
      users: {
        total: totalUsers,
        new: newUsers,
        byRole: usersByRole.reduce((acc, item) => {
          acc[item._id] = item.count
          return acc
        }, {}),
        recent: recentUsers,
      },
      events: {
        total: totalEvents,
        upcoming: upcomingEvents,
        byType: eventsByType.reduce((acc, item) => {
          acc[item._id] = item.count
          return acc
        }, {}),
        recent: recentEvents,
      },
      payments: {
        totalRevenue: totalRevenue[0]?.total || 0,
        recentRevenue: recentRevenue[0]?.total || 0,
      },
      announcements: {
        total: totalAnnouncements,
        byCategory: announcementsByCategory.reduce((acc, item) => {
          acc[item._id] = item.count
          return acc
        }, {}),
      },
      jobs: {
        total: totalJobs,
        byCategory: jobsByCategory.reduce((acc, item) => {
          acc[item._id] = item.count
          return acc
        }, {}),
      },
    })
  } catch (error) {
    console.error("Dashboard analytics error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router 