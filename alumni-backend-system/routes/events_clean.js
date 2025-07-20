const express = require("express")
const { body, query, validationResult } = require("express-validator")
const Event = require("../models/Event")
const User = require("../models/User")
const { authenticateToken, requireRole, optionalAuth } = require("../middleware/auth")
const { sendBulkEmail, sendBulkSMS } = require("../services/notificationService")

const router = express.Router()

/**
 * @swagger
 * tags:
 *   name: Events
 *   description: Event management and RSVP operations
 */

// ============== ADMIN EVENT MANAGEMENT ROUTES ==============
// These routes are for admin/moderator event management

/**
 * @swagger
 * /api/events/admin:
 *   get:
 *     summary: Get all events with admin details (Admin/Moderator only)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, cancelled, completed]
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [reunion, webinar, fundraiser, networking, workshop, social, other]
 *       - in: query
 *         name: organizer
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [title, date, attendees, revenue, createdAt]
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: List of events with admin details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Server error
 */

// Admin get all events with comprehensive filtering and sorting
router.get("/admin", authenticateToken, requireRole(["admin", "moderator"]), [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  query("status").optional().isIn(["draft", "published", "cancelled", "completed"]),
  query("type").optional().isIn(["reunion", "webinar", "fundraiser", "networking", "workshop", "social", "other"]),
  query("sortBy").optional().isIn(["title", "date", "attendees", "revenue", "createdAt"]),
  query("sortOrder").optional().isIn(["asc", "desc"]),
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit

    // Build filter object
    const filter = {}

    if (req.query.status) {
      filter.status = req.query.status
    }

    if (req.query.type) {
      filter.type = req.query.type
    }

    if (req.query.organizer) {
      filter.organizer = req.query.organizer
    }

    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: "i" } },
        { description: { $regex: req.query.search, $options: "i" } },
        { tags: { $in: [new RegExp(req.query.search, "i")] } }
      ]
    }

    // Build sort object
    const sortBy = req.query.sortBy || "createdAt"
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1
    let sortObj = {}

    switch (sortBy) {
      case "title":
        sortObj = { title: sortOrder }
        break
      case "date":
        sortObj = { "date.start": sortOrder }
        break
      case "attendees":
        // We'll handle this with aggregation
        break
      case "revenue":
        // We'll handle this with aggregation
        break
      default:
        sortObj = { createdAt: sortOrder }
    }

    let events
    let total

    if (sortBy === "attendees" || sortBy === "revenue") {
      // Use aggregation for complex sorting
      const pipeline = [
        { $match: filter },
        {
          $addFields: {
            attendeeCount: {
              $size: {
                $filter: {
                  input: "$attendees",
                  cond: { $eq: ["$$this.status", "registered"] }
                }
              }
            },
            revenue: {
              $multiply: [
                {
                  $size: {
                    $filter: {
                      input: "$attendees",
                      cond: { $eq: ["$$this.status", "registered"] }
                    }
                  }
                },
                { $ifNull: ["$registration.fee.amount", 0] }
              ]
            }
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "organizer",
            foreignField: "_id",
            as: "organizerInfo"
          }
        },
        {
          $addFields: {
            organizer: { $arrayElemAt: ["$organizerInfo", 0] }
          }
        },
        {
          $project: {
            organizerInfo: 0,
            "organizer.password": 0,
            "organizer.verification": 0,
            "organizer.resetPassword": 0
          }
        },
        { $sort: sortBy === "attendees" ? { attendeeCount: sortOrder } : { revenue: sortOrder } },
        { $skip: skip },
        { $limit: limit }
      ]

      events = await Event.aggregate(pipeline)
      total = await Event.countDocuments(filter)
    } else {
      // Regular query for simple sorting
      events = await Event.find(filter)
        .populate("organizer", "firstName lastName email role")
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean()

      // Add calculated fields
      events = events.map(event => ({
        ...event,
        attendeeCount: event.attendees.filter(a => a.status === "registered").length,
        revenue: event.attendees.filter(a => a.status === "registered").length * (event.registration?.fee?.amount || 0)
      }))

      total = await Event.countDocuments(filter)
    }

    res.json({
      events,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      summary: {
        totalEvents: total,
        totalRevenue: events.reduce((sum, event) => sum + (event.revenue || 0), 0),
        totalAttendees: events.reduce((sum, event) => sum + (event.attendeeCount || 0), 0)
      }
    })
  } catch (error) {
    console.error("Admin get events error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// ... existing admin routes ...

module.exports = router 