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

/**
 * @swagger
 * /api/events/admin:
 *   post:
 *     summary: Create new event (Admin/Moderator only)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - type
 *               - date
 *               - location
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [reunion, webinar, fundraiser, networking, workshop, social, other]
 *               date:
 *                 type: object
 *                 properties:
 *                   start:
 *                     type: string
 *                     format: date-time
 *                   end:
 *                     type: string
 *                     format: date-time
 *               location:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [physical, virtual, hybrid]
 *                   venue:
 *                     type: string
 *                   address:
 *                     type: string
 *                   city:
 *                     type: string
 *                   country:
 *                     type: string
 *                   virtualLink:
 *                     type: string
 *                   virtualPlatform:
 *                     type: string
 *               capacity:
 *                 type: number
 *               registration:
 *                 type: object
 *                 properties:
 *                   isRequired:
 *                     type: boolean
 *                   deadline:
 *                     type: string
 *                     format: date-time
 *                   fee:
 *                     type: object
 *                     properties:
 *                       amount:
 *                         type: number
 *                       currency:
 *                         type: string
 *               organizer:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               isPublic:
 *                 type: boolean
 *               status:
 *                 type: string
 *                 enum: [draft, published, cancelled, completed]
 *     responses:
 *       201:
 *         description: Event created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Server error
 */

// Admin create event with full control
router.post("/admin", authenticateToken, requireRole(["admin", "moderator"]), [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("description").notEmpty().withMessage("Description is required"),
  body("type").isIn(["reunion", "webinar", "fundraiser", "networking", "workshop", "social", "other"]).withMessage("Invalid event type"),
  body("date.start").isISO8601().withMessage("Valid start date is required"),
  body("date.end").isISO8601().withMessage("Valid end date is required"),
  body("location.type").isIn(["physical", "virtual", "hybrid"]).withMessage("Invalid location type"),
  body("location.venue").optional().isString().withMessage("Venue must be a string"),
  body("location.address").optional().isString().withMessage("Address must be a string"),
  body("location.city").optional().isString().withMessage("City must be a string"),
  body("location.country").optional().isString().withMessage("Country must be a string"),
  body("location.virtualLink").optional().isURL().withMessage("Virtual link must be a valid URL"),
  body("location.virtualPlatform").optional().isString().withMessage("Virtual platform must be a string"),
  body("capacity").optional().isInt({ min: 1 }).withMessage("Capacity must be a positive integer"),
  body("registration.isRequired").optional().isBoolean().withMessage("Registration required must be boolean"),
  body("registration.deadline").optional().isISO8601().withMessage("Registration deadline must be valid date"),
  body("registration.fee.amount").optional().isFloat({ min: 0 }).withMessage("Fee amount must be non-negative"),
  body("registration.fee.currency").optional().isString().withMessage("Currency must be a string"),
  body("organizer").optional().isMongoId().withMessage("Organizer must be valid user ID"),
  body("images").optional().isArray().withMessage("Images must be an array"),
  body("images.*").optional().isURL().withMessage("Each image must be a valid URL"),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
  body("tags.*").optional().isString().withMessage("Each tag must be a string"),
  body("isPublic").optional().isBoolean().withMessage("isPublic must be boolean"),
  body("status").optional().isIn(["draft", "published", "cancelled", "completed"]).withMessage("Invalid status"),
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    // Validate date logic
    const startDate = new Date(req.body.date.start)
    const endDate = new Date(req.body.date.end)

    if (endDate <= startDate) {
      return res.status(400).json({ message: "End date must be after start date" })
    }

    // Validate registration deadline
    if (req.body.registration?.deadline) {
      const deadline = new Date(req.body.registration.deadline)
      if (deadline >= startDate) {
        return res.status(400).json({ message: "Registration deadline must be before event start date" })
      }
    }

    // If organizer is specified, validate it exists
    let organizerId = req.user._id
    if (req.body.organizer && req.user.role === "admin") {
      const organizer = await User.findById(req.body.organizer)
      if (!organizer) {
        return res.status(400).json({ message: "Specified organizer not found" })
      }
      organizerId = req.body.organizer
    }

    // Prepare event data with defaults
    const eventData = {
      title: req.body.title,
      description: req.body.description,
      type: req.body.type,
      date: {
        start: startDate,
        end: endDate
      },
      location: {
        type: req.body.location.type,
        venue: req.body.location.venue || "",
        address: req.body.location.address || "",
        city: req.body.location.city || "",
        country: req.body.location.country || "",
        virtualLink: req.body.location.virtualLink || "",
        virtualPlatform: req.body.location.virtualPlatform || ""
      },
      organizer: organizerId,
      capacity: req.body.capacity || null,
      registration: {
        isRequired: req.body.registration?.isRequired !== false, // Default to true
        deadline: req.body.registration?.deadline ? new Date(req.body.registration.deadline) : null,
        fee: {
          amount: req.body.registration?.fee?.amount || 0,
          currency: req.body.registration?.fee?.currency || "USD"
        }
      },
      images: req.body.images || [],
      tags: req.body.tags || [],
      isPublic: req.body.isPublic !== false, // Default to true
      status: req.body.status || "draft",
      attendees: [],
      reminders: []
    }

    const event = new Event(eventData)
    await event.save()

    const populatedEvent = await Event.findById(event._id)
      .populate("organizer", "firstName lastName email role")

    res.status(201).json({
      message: "Event created successfully",
      event: {
        ...populatedEvent.toObject(),
        attendeeCount: 0,
        revenue: 0
      }
    })
  } catch (error) {
    console.error("Admin create event error:", error)
    
    // Handle specific MongoDB validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }))
      return res.status(400).json({ 
        message: "Validation error", 
        errors: validationErrors 
      })
    }
    
    res.status(500).json({ message: "Server error" })
  }
})

/**
 * @swagger
 * /api/events/admin/{id}:
 *   get:
 *     summary: Get event by ID with admin details (Admin/Moderator only)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event details with admin information
 *       404:
 *         description: Event not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Server error
 */

// Admin get event by ID with full details
router.get("/admin/:id", authenticateToken, requireRole(["admin", "moderator"]), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("organizer", "firstName lastName email role profile")
      .populate("attendees.user", "firstName lastName email phone profile.graduationYear profile.profession")

    if (!event) {
      return res.status(404).json({ message: "Event not found" })
    }

    // Calculate additional stats
    const registeredAttendees = event.attendees.filter(a => a.status === "registered")
    const attendedCount = event.attendees.filter(a => a.status === "attended").length
    const cancelledCount = event.attendees.filter(a => a.status === "cancelled").length
    const revenue = registeredAttendees.length * (event.registration?.fee?.amount || 0)
    const capacityUtilization = event.capacity ? (registeredAttendees.length / event.capacity) * 100 : null

    // Attendee breakdown by graduation year
    const attendeesByYear = {}
    registeredAttendees.forEach(attendee => {
      const year = attendee.user?.profile?.graduationYear || 'Unknown'
      attendeesByYear[year] = (attendeesByYear[year] || 0) + 1
    })

    res.json({
      event: event.toObject(),
      adminStats: {
        attendeeCount: registeredAttendees.length,
        attendedCount,
        cancelledCount,
        revenue,
        capacityUtilization,
        attendeesByYear,
        registrationRate: event.capacity ? (registeredAttendees.length / event.capacity) * 100 : null,
        lastRegistration: registeredAttendees.length > 0 ? 
          Math.max(...registeredAttendees.map(a => new Date(a.registeredAt).getTime())) : null
      }
    })
  } catch (error) {
    console.error("Admin get event by ID error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

/**
 * @swagger
 * /api/events/admin/{id}:
 *   put:
 *     summary: Update event (Admin/Moderator only)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [reunion, webinar, fundraiser, networking, workshop, social, other]
 *               date:
 *                 type: object
 *                 properties:
 *                   start:
 *                     type: string
 *                     format: date-time
 *                   end:
 *                     type: string
 *                     format: date-time
 *               location:
 *                 type: object
 *               capacity:
 *                 type: number
 *               registration:
 *                 type: object
 *               organizer:
 *                 type: string
 *               images:
 *                 type: array
 *               tags:
 *                 type: array
 *               isPublic:
 *                 type: boolean
 *               status:
 *                 type: string
 *                 enum: [draft, published, cancelled, completed]
 *     responses:
 *       200:
 *         description: Event updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Event not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Server error
 */

// Admin update event
router.put("/admin/:id", authenticateToken, requireRole(["admin", "moderator"]), [
  body("title").optional().trim().notEmpty().withMessage("Title cannot be empty"),
  body("description").optional().notEmpty().withMessage("Description cannot be empty"),
  body("type").optional().isIn(["reunion", "webinar", "fundraiser", "networking", "workshop", "social", "other"]).withMessage("Invalid event type"),
  body("date.start").optional().isISO8601().withMessage("Valid start date is required"),
  body("date.end").optional().isISO8601().withMessage("Valid end date is required"),
  body("location.type").optional().isIn(["physical", "virtual", "hybrid"]).withMessage("Invalid location type"),
  body("capacity").optional().isInt({ min: 1 }).withMessage("Capacity must be a positive integer"),
  body("organizer").optional().isMongoId().withMessage("Organizer must be valid user ID"),
  body("status").optional().isIn(["draft", "published", "cancelled", "completed"]).withMessage("Invalid status"),
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const event = await Event.findById(req.params.id)

    if (!event) {
      return res.status(404).json({ message: "Event not found" })
    }

    // Check permissions - moderators can only edit their own events
    if (req.user.role === "moderator" && event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only edit your own events" })
    }

    // Validate date logic if dates are being updated
    if (req.body.date) {
      const startDate = new Date(req.body.date.start || event.date.start)
      const endDate = new Date(req.body.date.end || event.date.end)

      if (endDate <= startDate) {
        return res.status(400).json({ message: "End date must be after start date" })
      }
    }

    // Validate organizer change (admin only)
    if (req.body.organizer && req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can change event organizer" })
    }

    if (req.body.organizer) {
      const organizer = await User.findById(req.body.organizer)
      if (!organizer) {
        return res.status(400).json({ message: "Specified organizer not found" })
      }
    }

    // Update event fields
    Object.keys(req.body).forEach((key) => {
      if (req.body[key] !== undefined) {
        if (key === "date" || key === "location" || key === "registration") {
          // Handle nested objects
          Object.keys(req.body[key]).forEach((nestedKey) => {
            if (req.body[key][nestedKey] !== undefined) {
              event[key][nestedKey] = req.body[key][nestedKey]
            }
          })
        } else {
          event[key] = req.body[key]
        }
      }
    })

    await event.save()

    const updatedEvent = await Event.findById(event._id)
      .populate("organizer", "firstName lastName email role")

    const attendeeCount = event.attendees.filter(a => a.status === "registered").length
    const revenue = attendeeCount * (event.registration?.fee?.amount || 0)

    res.json({
      message: "Event updated successfully",
      event: {
        ...updatedEvent.toObject(),
        attendeeCount,
        revenue
      }
    })
  } catch (error) {
    console.error("Admin update event error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

/**
 * @swagger
 * /api/events/admin/{id}:
 *   delete:
 *     summary: Delete event (Admin only)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *       404:
 *         description: Event not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Server error
 */

// Admin delete event (hard delete)
router.delete("/admin/:id", authenticateToken, requireRole(["admin"]), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)

    if (!event) {
      return res.status(404).json({ message: "Event not found" })
    }

    // Store event info for response
    const eventInfo = {
      id: event._id,
      title: event.title,
      type: event.type,
      attendeeCount: event.attendees.filter(a => a.status === "registered").length
    }

    // Hard delete - completely remove from database
    await Event.findByIdAndDelete(req.params.id)

    res.json({
      message: "Event deleted successfully",
      deletedEvent: eventInfo
    })
  } catch (error) {
    console.error("Admin delete event error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

/**
 * @swagger
 * /api/events/admin/bulk:
 *   post:
 *     summary: Bulk operations on events (Admin only)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *               - eventIds
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [delete, publish, cancel, complete, draft]
 *               eventIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Bulk operation completed
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Server error
 */

// Admin bulk operations on events  
router.post("/admin/bulk", authenticateToken, requireRole(["admin"]), [
  body("action").isIn(["delete", "publish", "cancel", "complete", "draft"]).withMessage("Invalid action"),
  body("eventIds").isArray({ min: 1 }).withMessage("Event IDs array is required"),
  body("eventIds.*").isMongoId().withMessage("Each event ID must be valid"),
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { action, eventIds } = req.body

    let result
    let successCount = 0
    let failedCount = 0
    const failedEvents = []

    switch (action) {
      case "delete":
        for (const eventId of eventIds) {
          try {
            const event = await Event.findByIdAndDelete(eventId)
            if (event) successCount++
            else failedCount++
          } catch (error) {
            failedCount++
            failedEvents.push({ eventId, error: error.message })
          }
        }
        break

      case "publish":
      case "cancel":
      case "complete":
      case "draft":
        result = await Event.updateMany(
          { _id: { $in: eventIds } },
          { status: action === "publish" ? "published" : action }
        )
        successCount = result.modifiedCount
        failedCount = eventIds.length - successCount
        break

      default:
        return res.status(400).json({ message: "Invalid action" })
    }

    res.json({
      message: `Bulk ${action} operation completed`,
      results: {
        total: eventIds.length,
        successful: successCount,
        failed: failedCount,
        failedEvents: failedEvents.length > 0 ? failedEvents : undefined
      }
    })
  } catch (error) {
    console.error("Admin bulk events error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

/**
 * @swagger
 * /api/events/admin/export:
 *   get:
 *     summary: Export events data (Admin only)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [csv, json]
 *           default: csv
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
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Events data exported
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Server error
 */

// Admin export events
router.get("/admin/export", authenticateToken, requireRole(["admin"]), [
  query("format").optional().isIn(["csv", "json"]),
  query("status").optional().isIn(["draft", "published", "cancelled", "completed"]),
  query("type").optional().isIn(["reunion", "webinar", "fundraiser", "networking", "workshop", "social", "other"]),
  query("startDate").optional().isISO8601(),
  query("endDate").optional().isISO8601(),
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const format = req.query.format || "csv"
    
    // Build filter
    const filter = {}
    
    if (req.query.status) {
      filter.status = req.query.status
    }
    
    if (req.query.type) {
      filter.type = req.query.type
    }
    
    if (req.query.startDate || req.query.endDate) {
      filter["date.start"] = {}
      if (req.query.startDate) {
        filter["date.start"].$gte = new Date(req.query.startDate)
      }
      if (req.query.endDate) {
        filter["date.start"].$lte = new Date(req.query.endDate)
      }
    }

    const events = await Event.find(filter)
      .populate("organizer", "firstName lastName email")
      .sort({ "date.start": -1 })
      .lean()

    // Transform data for export
    const exportData = events.map(event => ({
      id: event._id,
      title: event.title,
      description: event.description,
      type: event.type,
      status: event.status,
      startDate: event.date.start,
      endDate: event.date.end,
      locationType: event.location.type,
      venue: event.location.venue || "",
      city: event.location.city || "",
      country: event.location.country || "",
      virtualLink: event.location.virtualLink || "",
      organizer: `${event.organizer.firstName} ${event.organizer.lastName}`,
      organizerEmail: event.organizer.email,
      capacity: event.capacity || "Unlimited",
      registrationRequired: event.registration.isRequired,
      registrationFee: event.registration.fee.amount || 0,
      currency: event.registration.fee.currency || "USD",
      attendeeCount: event.attendees.filter(a => a.status === "registered").length,
      revenue: event.attendees.filter(a => a.status === "registered").length * (event.registration.fee.amount || 0),
      isPublic: event.isPublic,
      tags: event.tags.join(", "),
      createdAt: event.createdAt,
      updatedAt: event.updatedAt
    }))

    if (format === "json") {
      res.json({
        events: exportData,
        exportInfo: {
          totalEvents: exportData.length,
          exportDate: new Date(),
          filters: filter
        }
      })
    } else {
      // CSV format
      const csv = convertToCSV(exportData)
      const filename = `events_export_${new Date().toISOString().split('T')[0]}.csv`
      
      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
      res.send(csv)
    }
  } catch (error) {
    console.error("Admin export events error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// ============== END ADMIN EVENT MANAGEMENT ROUTES ==============

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: Get all events
 *     tags: [Events]
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
 *         description: Number of events per page
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [reunion, webinar, fundraiser, networking, workshop, social, other]
 *         description: Filter by event type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, cancelled, completed]
 *         description: Filter by event status
 *       - in: query
 *         name: upcoming
 *         schema:
 *           type: boolean
 *         description: Filter upcoming events
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search events by title or description
 *     responses:
 *       200:
 *         description: List of events with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 events:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Event'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationResponse'
 *       400:
 *         description: Validation error
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
 *   post:
 *     summary: Create new event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - type
 *               - date
 *               - location
 *             properties:
 *               title:
 *                 type: string
 *                 description: Event title
 *               description:
 *                 type: string
 *                 description: Event description
 *               type:
 *                 type: string
 *                 enum: [reunion, webinar, fundraiser, networking, workshop, social, other]
 *                 description: Event type
 *               date:
 *                 type: object
 *                 required:
 *                   - start
 *                   - end
 *                 properties:
 *                   start:
 *                     type: string
 *                     format: date-time
 *                     description: Event start date and time
 *                   end:
 *                     type: string
 *                     format: date-time
 *                     description: Event end date and time
 *               location:
 *                 type: object
 *                 required:
 *                   - type
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [physical, virtual, hybrid]
 *                     description: Location type
 *                   address:
 *                     type: string
 *                     description: Physical address
 *                   city:
 *                     type: string
 *                     description: City
 *                   country:
 *                     type: string
 *                     description: Country
 *                   virtualUrl:
 *                     type: string
 *                     description: Virtual meeting URL
 *               capacity:
 *                 type: number
 *                 description: Maximum number of attendees
 *               registration:
 *                 type: object
 *                 properties:
 *                   required:
 *                     type: boolean
 *                     description: Whether registration is required
 *                   deadline:
 *                     type: string
 *                     format: date-time
 *                     description: Registration deadline
 *                   fee:
 *                     type: number
 *                     description: Registration fee
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Event tags
 *               isPublic:
 *                 type: boolean
 *                 description: Whether event is public
 *               featured:
 *                 type: boolean
 *                 description: Whether event is featured
 *     responses:
 *       201:
 *         description: Event created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 event:
 *                   $ref: '#/components/schemas/Event'
 *       400:
 *         description: Validation error
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
 * /api/events/{id}:
 *   get:
 *     summary: Get event by ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       403:
 *         description: Access denied for private event
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Event not found
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
 *   put:
 *     summary: Update event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [reunion, webinar, fundraiser, networking, workshop, social, other]
 *               date:
 *                 type: object
 *                 properties:
 *                   start:
 *                     type: string
 *                     format: date-time
 *                   end:
 *                     type: string
 *                     format: date-time
 *               location:
 *                 type: object
 *               capacity:
 *                 type: number
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Event updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 event:
 *                   $ref: '#/components/schemas/Event'
 *       400:
 *         description: Validation error
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
 *       403:
 *         description: Access denied
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Event not found
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
 *   delete:
 *     summary: Delete event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Unauthorized
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
 *         description: Event not found
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
 * /api/events/{id}/rsvp:
 *   post:
 *     summary: RSVP to event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Successfully registered for event
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Registration error (deadline passed, event full, already registered)
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
 *       404:
 *         description: Event not found
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
 *   delete:
 *     summary: Cancel RSVP
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: RSVP cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Not registered for this event
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
 *       404:
 *         description: Event not found
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
 * /api/events/{id}/attendees:
 *   get:
 *     summary: Get event attendees (Admin/Moderator only)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: List of event attendees
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 attendees:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user:
 *                         $ref: '#/components/schemas/User'
 *                       status:
 *                         type: string
 *                         enum: [registered, attended, cancelled]
 *                       registeredAt:
 *                         type: string
 *                         format: date-time
 *                 totalCount:
 *                   type: number
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
 *       404:
 *         description: Event not found
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
 * /api/events/{id}/send-reminders:
 *   post:
 *     summary: Send event reminders (Admin/Moderator only)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - message
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [email, sms, both]
 *                 description: Reminder type
 *               message:
 *                 type: string
 *                 description: Reminder message
 *     responses:
 *       200:
 *         description: Reminders sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 results:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: object
 *                       properties:
 *                         successful:
 *                           type: number
 *                         failed:
 *                           type: number
 *                     sms:
 *                       type: object
 *                       properties:
 *                         successful:
 *                           type: number
 *                         failed:
 *                           type: number
 *       400:
 *         description: Validation error or no attendees to notify
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
 *       403:
 *         description: Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Event not found
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
 * /api/events/admin:
 *   post:
 *     summary: Create new event (Admin/Moderator only)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - type
 *               - date
 *               - location
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [reunion, webinar, fundraiser, networking, workshop, social, other]
 *               date:
 *                 type: object
 *                 properties:
 *                   start:
 *                     type: string
 *                     format: date-time
 *                   end:
 *                     type: string
 *                     format: date-time
 *               location:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [physical, virtual, hybrid]
 *               status:
 *                 type: string
 *                 enum: [draft, published, cancelled]
 *                 default: draft
 *     responses:
 *       201:
 *         description: Event created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Server error
 */



/**
 * @swagger
 * /api/events/admin/{id}:
 *   put:
 *     summary: Update event (Admin/Moderator only)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [reunion, webinar, fundraiser, networking, workshop, social, other]
 *               date:
 *                 type: object
 *               location:
 *                 type: object
 *               status:
 *                 type: string
 *                 enum: [draft, published, cancelled]
 *     responses:
 *       200:
 *         description: Event updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Event not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Server error
 */

// Admin update event
router.put("/admin/:id", authenticateToken, requireRole(["admin", "moderator"]), [
  body("title").optional().trim().notEmpty().withMessage("Title cannot be empty"),
  body("description").optional().notEmpty().withMessage("Description cannot be empty"),
  body("type").optional().isIn(["reunion", "webinar", "fundraiser", "networking", "workshop", "social", "other"]).withMessage("Invalid event type"),
  body("date.start").optional().isISO8601().withMessage("Valid start date is required"),
  body("date.end").optional().isISO8601().withMessage("Valid end date is required"),
  body("status").optional().isIn(["draft", "published", "cancelled"]).withMessage("Invalid status"),
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const event = await Event.findById(req.params.id)

    if (!event) {
      return res.status(404).json({ message: "Event not found" })
    }

    // Validate date logic if dates are being updated
    if (req.body.date) {
      const startDate = new Date(req.body.date.start || event.date.start)
      const endDate = new Date(req.body.date.end || event.date.end)

      if (endDate <= startDate) {
        return res.status(400).json({ message: "End date must be after start date" })
      }
    }

    // Update event fields
    Object.keys(req.body).forEach((key) => {
      if (req.body[key] !== undefined) {
        if (key === "pricing" || key === "location" || key === "date" || key === "registration") {
          Object.keys(req.body[key]).forEach((subKey) => {
            if (req.body[key][subKey] !== undefined) {
              event[key][subKey] = req.body[key][subKey]
            }
          })
        } else {
          event[key] = req.body[key]
        }
      }
    })

    await event.save()

    const updatedEvent = await Event.findById(event._id).populate("organizer", "firstName lastName email")

    res.json({
      message: "Event updated successfully",
      event: updatedEvent,
    })
  } catch (error) {
    console.error("Admin update event error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

/**
 * @swagger
 * /api/events/admin/{id}:
 *   delete:
 *     summary: Delete event permanently (Admin only)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *       404:
 *         description: Event not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Server error
 */

// Admin delete event
router.delete("/admin/:id", authenticateToken, requireRole(["admin"]), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)

    if (!event) {
      return res.status(404).json({ message: "Event not found" })
    }

    await Event.findByIdAndDelete(req.params.id)

    res.json({
      message: "Event deleted successfully",
      deletedEvent: {
        id: event._id,
        title: event.title,
        type: event.type
      }
    })
  } catch (error) {
    console.error("Admin delete event error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

/**
 * @swagger
 * /api/events/admin/statistics:
 *   get:
 *     summary: Get event statistics (Admin/Moderator only)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Event statistics
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Server error
 */

// Event statistics endpoint
router.get("/admin/statistics", authenticateToken, requireRole(["admin", "moderator"]), async (req, res) => {
  try {
    const now = new Date()
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    // Helper function to calculate percentage change
    const calculatePercentageChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0
      return Math.round(((current - previous) / previous) * 100)
    }

    // Total Events
    const totalEvents = await Event.countDocuments()
    const totalEventsLastMonth = await Event.countDocuments({
      createdAt: { $lt: currentMonth }
    })
    const totalEventsThisMonth = totalEvents - totalEventsLastMonth

    // Upcoming Events (next 30 days)
    const upcomingEvents = await Event.countDocuments({
      "date.start": { $gte: now, $lte: thirtyDaysFromNow },
      status: "published"
    })

    // Total Attendees across all events
    const attendeesAggregation = await Event.aggregate([
      { $match: { status: "published" } },
      { $unwind: { path: "$attendees", preserveNullAndEmptyArrays: true } },
      { $match: { "attendees.status": "registered" } },
      { $count: "totalAttendees" }
    ])
    const totalAttendees = attendeesAggregation.length > 0 ? attendeesAggregation[0].totalAttendees : 0

    // Revenue calculation (fixed field name)
    const revenueAggregation = await Event.aggregate([
      { $match: { status: "published", "registration.fee.amount": { $gt: 0 } } },
      { $unwind: { path: "$attendees", preserveNullAndEmptyArrays: true } },
      { $match: { "attendees.status": "registered" } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$registration.fee.amount" }
        }
      }
    ])
    const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].totalRevenue : 0

    // Events created this month for comparison
    const eventsThisMonth = await Event.countDocuments({
      createdAt: { $gte: currentMonth }
    })
    const eventsLastMonth = await Event.countDocuments({
      createdAt: { $gte: lastMonth, $lt: currentMonth }
    })

    // Additional comprehensive statistics
    
    // Events by status
    const eventsByStatus = await Event.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ])
    
    // Events by type
    const eventsByType = await Event.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
          totalAttendees: {
            $sum: {
              $size: {
                $filter: {
                  input: "$attendees",
                  cond: { $eq: ["$$this.status", "registered"] }
                }
              }
            }
          },
          totalRevenue: {
            $sum: {
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
        }
      },
      { $sort: { count: -1 } }
    ])
    
    // Monthly event trends (last 12 months)
    const monthlyTrends = await Event.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(now.getFullYear() - 1, now.getMonth(), 1) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          events: { $sum: 1 },
          attendees: {
            $sum: {
              $size: {
                $filter: {
                  input: "$attendees",
                  cond: { $eq: ["$$this.status", "registered"] }
                }
              }
            }
          },
          revenue: {
            $sum: {
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
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ])
    
    // Top performing events
    const topEvents = await Event.aggregate([
      { $match: { status: "published" } },
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
      { $sort: { attendeeCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "organizer",
          foreignField: "_id",
          as: "organizerInfo"
        }
      },
      {
        $project: {
          title: 1,
          type: 1,
          "date.start": 1,
          attendeeCount: 1,
          revenue: 1,
          organizer: { $arrayElemAt: ["$organizerInfo.firstName", 0] }
        }
      }
    ])

    res.json({
      // Main KPIs
      totalEvents: {
        value: totalEvents,
        change: calculatePercentageChange(eventsThisMonth, eventsLastMonth),
        label: "Total Events"
      },
      upcomingEvents: {
        value: upcomingEvents,
        label: "Upcoming Events",
        period: "Next 30 days"
      },
      totalAttendees: {
        value: totalAttendees,
        label: "Total Attendees",
        period: "Across all events"
      },
      revenue: {
        value: totalRevenue,
        label: "Revenue",
        period: "Total event revenue",
        formatted: `$${totalRevenue.toLocaleString()}`
      },
      
      // Detailed analytics
      analytics: {
        eventsByStatus: eventsByStatus.reduce((acc, item) => {
          acc[item._id] = item.count
          return acc
        }, {}),
        
        eventsByType: eventsByType.map(item => ({
          type: item._id,
          events: item.count,
          attendees: item.totalAttendees,
          revenue: item.totalRevenue,
          avgAttendeesPerEvent: Math.round(item.totalAttendees / item.count)
        })),
        
        monthlyTrends: monthlyTrends.map(item => ({
          month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
          events: item.events,
          attendees: item.attendees,
          revenue: item.revenue
        })),
        
        topEvents: topEvents.map(event => ({
          id: event._id,
          title: event.title,
          type: event.type,
          date: event.date.start,
          attendees: event.attendeeCount,
          revenue: event.revenue,
          organizer: event.organizer
        })),
        
        // Additional metrics
        averageAttendeesPerEvent: totalEvents > 0 ? Math.round(totalAttendees / totalEvents) : 0,
        averageRevenuePerEvent: totalEvents > 0 ? Math.round(totalRevenue / totalEvents) : 0,
        averageRevenuePerAttendee: totalAttendees > 0 ? Math.round(totalRevenue / totalAttendees) : 0
      }
    })
  } catch (error) {
    console.error("Event statistics error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// ============== END ADMIN/MODERATOR EVENT MANAGEMENT ROUTES ==============

// ============== PUBLIC EVENT ROUTES ==============
// These routes are accessible by all authenticated users

// Get all events
router.get(
  "/",
  optionalAuth,
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("type").optional().isIn(["reunion", "webinar", "fundraiser", "networking", "workshop", "social", "other"]),
    query("status").optional().isIn(["draft", "published", "cancelled", "completed"]),
    query("upcoming").optional().isBoolean(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const page = Number.parseInt(req.query.page) || 1
      const limit = Number.parseInt(req.query.limit) || 20
      const skip = (page - 1) * limit

      const filter = { isPublic: true }

      // Add filters
      if (req.query.type) {
        filter.type = req.query.type
      }

      if (req.query.status) {
        filter.status = req.query.status
      } else {
        filter.status = "published" // Default to published events
      }

      if (req.query.upcoming === "true") {
        filter["date.start"] = { $gte: new Date() }
      }

      if (req.query.search) {
        filter.$text = { $search: req.query.search }
      }

      const events = await Event.find(filter)
        .populate("organizer", "firstName lastName")
        .sort({ "date.start": 1 })
        .skip(skip)
        .limit(limit)

      const total = await Event.countDocuments(filter)

      res.json({
        events,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      })
    } catch (error) {
      console.error("Get events error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Get event by ID
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("organizer", "firstName lastName email")
      .populate("attendees.user", "firstName lastName")

    if (!event) {
      return res.status(404).json({ message: "Event not found" })
    }

    // Check if event is public or user has access
    if (!event.isPublic && (!req.user || req.user.role !== "admin")) {
      return res.status(403).json({ message: "Access denied" })
    }

    res.json(event)
  } catch (error) {
    console.error("Get event error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create event (Admin only)
router.post(
  "/",
  authenticateToken,
  requireRole(["admin"]),
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("type")
      .isIn(["reunion", "webinar", "fundraiser", "networking", "workshop", "social", "other"])
      .withMessage("Invalid event type"),
    body("date.start").isISO8601().withMessage("Valid start date is required"),
    body("date.end").isISO8601().withMessage("Valid end date is required"),
    body("location.type").isIn(["physical", "virtual", "hybrid"]).withMessage("Invalid location type"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      // Validate date logic
      const startDate = new Date(req.body.date.start)
      const endDate = new Date(req.body.date.end)

      if (endDate <= startDate) {
        return res.status(400).json({ message: "End date must be after start date" })
      }

      const event = new Event({
        ...req.body,
        organizer: req.user._id,
      })

      await event.save()

      const populatedEvent = await Event.findById(event._id).populate("organizer", "firstName lastName")

      res.status(201).json({
        message: "Event created successfully",
        event: populatedEvent,
      })
    } catch (error) {
      console.error("Create event error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Update event (Admin only)
router.put(
  "/:id",
  authenticateToken,
  requireRole(["admin"]),
  [
    body("title").optional().trim().notEmpty().withMessage("Title cannot be empty"),
    body("description").optional().notEmpty().withMessage("Description cannot be empty"),
    body("type").optional().isIn(["reunion", "webinar", "fundraiser", "networking", "workshop", "social", "other"]),
    body("date.start").optional().isISO8601().withMessage("Valid start date is required"),
    body("date.end").optional().isISO8601().withMessage("Valid end date is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const event = await Event.findById(req.params.id)

      if (!event) {
        return res.status(404).json({ message: "Event not found" })
      }

      // Admin can edit any event (role check already handled by middleware)

      // Validate date logic if dates are being updated
      if (req.body.date) {
        const startDate = new Date(req.body.date.start || event.date.start)
        const endDate = new Date(req.body.date.end || event.date.end)

        if (endDate <= startDate) {
          return res.status(400).json({ message: "End date must be after start date" })
        }
      }

      Object.keys(req.body).forEach((key) => {
        if (req.body[key] !== undefined) {
          event[key] = req.body[key]
        }
      })

      await event.save()

      const updatedEvent = await Event.findById(event._id).populate("organizer", "firstName lastName")

      res.json({
        message: "Event updated successfully",
        event: updatedEvent,
      })
    } catch (error) {
      console.error("Update event error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Delete event (Admin only)
router.delete("/:id", authenticateToken, requireRole(["admin"]), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)

    if (!event) {
      return res.status(404).json({ message: "Event not found" })
    }

    // Admin can delete any event (role check already handled by middleware)

    await Event.findByIdAndDelete(req.params.id)

    res.json({ message: "Event deleted successfully" })
  } catch (error) {
    console.error("Delete event error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// RSVP to event (Admin only)
router.post("/:id/rsvp", authenticateToken, requireRole(["admin"]), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)

    if (!event) {
      return res.status(404).json({ message: "Event not found" })
    }

    if (event.status !== "published") {
      return res.status(400).json({ message: "Cannot RSVP to unpublished event" })
    }

    // Check if registration deadline has passed
    if (event.registration.deadline && new Date() > event.registration.deadline) {
      return res.status(400).json({ message: "Registration deadline has passed" })
    }

    // Check if event is full
    if (event.capacity && event.attendeeCount >= event.capacity) {
      return res.status(400).json({ message: "Event is full" })
    }

    // Check if user already registered
    const existingAttendee = event.attendees.find((attendee) => attendee.user.toString() === req.user._id.toString())

    if (existingAttendee) {
      return res.status(400).json({ message: "Already registered for this event" })
    }

    // Add attendee
    event.attendees.push({
      user: req.user._id,
      status: "registered",
    })

    await event.save()

    res.json({ message: "Successfully registered for event" })
  } catch (error) {
    console.error("RSVP error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Cancel RSVP (Admin only)
router.delete("/:id/rsvp", authenticateToken, requireRole(["admin"]), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)

    if (!event) {
      return res.status(404).json({ message: "Event not found" })
    }

    // Find and remove attendee
    const attendeeIndex = event.attendees.findIndex((attendee) => attendee.user.toString() === req.user._id.toString())

    if (attendeeIndex === -1) {
      return res.status(400).json({ message: "Not registered for this event" })
    }

    event.attendees.splice(attendeeIndex, 1)
    await event.save()

    res.json({ message: "RSVP cancelled successfully" })
  } catch (error) {
    console.error("Cancel RSVP error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get event attendees (Admin only)
router.get("/:id/attendees", authenticateToken, requireRole(["admin"]), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      "attendees.user",
      "firstName lastName email phone profile.graduationYear",
    )

    if (!event) {
      return res.status(404).json({ message: "Event not found" })
    }

    res.json({
      attendees: event.attendees,
      totalCount: event.attendees.length,
    })
  } catch (error) {
    console.error("Get attendees error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Send event reminders
router.post(
  "/:id/send-reminders",
  authenticateToken,
  requireRole(["admin", "moderator"]),
  [
    body("type").isIn(["email", "sms", "both"]).withMessage("Invalid reminder type"),
    body("message").notEmpty().withMessage("Message is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { type, message } = req.body
      const event = await Event.findById(req.params.id).populate(
        "attendees.user",
        "firstName lastName email phone preferences",
      )

      if (!event) {
        return res.status(404).json({ message: "Event not found" })
      }

      const attendees = event.attendees.filter((a) => a.status === "registered")

      if (attendees.length === 0) {
        return res.status(400).json({ message: "No registered attendees to notify" })
      }

      let emailResults = { successful: 0, failed: 0 }
      let smsResults = { successful: 0, failed: 0 }

      if (type === "email" || type === "both") {
        const emailRecipients = attendees
          .filter((a) => a.user.preferences?.emailNotifications !== false)
          .map((a) => a.user.email)

        if (emailRecipients.length > 0) {
          emailResults = await sendBulkEmail(emailRecipients, {
            subject: `Reminder: ${event.title}`,
            html: `
            <h2>${event.title}</h2>
            <p><strong>Date:</strong> ${event.date.start.toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${event.date.start.toLocaleTimeString()}</p>
            <p>${message}</p>
          `,
          })
        }
      }

      if (type === "sms" || type === "both") {
        const smsRecipients = attendees
          .filter((a) => a.user.preferences?.smsNotifications !== false)
          .map((a) => a.user.phone)

        if (smsRecipients.length > 0) {
          const smsMessage = `Reminder: ${event.title} on ${event.date.start.toLocaleDateString()}. ${message}`
          smsResults = await sendBulkSMS(smsRecipients, smsMessage)
        }
      }

      res.json({
        message: "Reminders sent successfully",
        results: {
          email: emailResults,
          sms: smsResults,
        },
      })
    } catch (error) {
      console.error("Send reminders error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Helper function to convert data to CSV format
function convertToCSV(data) {
  if (!data || data.length === 0) {
    return ""
  }

  const headers = Object.keys(data[0])
  const csvHeaders = headers.join(",")

  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header]
      // Handle values that contain commas, quotes, or newlines
      if (typeof value === "string" && (value.includes(",") || value.includes('"') || value.includes("\n"))) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value || ""
    }).join(",")
  })

  return [csvHeaders, ...csvRows].join("\n")
}

module.exports = router
