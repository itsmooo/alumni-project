const express = require("express")
const { body, query, validationResult } = require("express-validator")
const Announcement = require("../models/Announcement")
const { authenticateToken, requireRole, optionalAuth } = require("../middleware/auth")

/**
 * @swagger
 * tags:
 *   name: Announcements
 *   description: Announcement and news management
 */

const router = express.Router()

// =============================================================================
// ADMIN ROUTES (restricted to admin/moderator users only)
// NOTE: Admin routes must be defined BEFORE parameterized routes (/:id)
// IMPORTANT: Specific routes (/admin/statistics, /admin/export, /admin/bulk) 
// must come BEFORE parameterized routes (/admin/:id)
// =============================================================================

// Admin: Get all announcements with advanced filtering
router.get("/admin", 
  authenticateToken, 
  requireRole(["admin", "moderator"]), 
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("category").optional().isIn(["general", "jobs", "news", "scholarships", "events", "achievements", "obituary"]),
    query("status").optional().isIn(["draft", "published", "archived"]),
    query("priority").optional().isIn(["low", "medium", "high", "urgent"]),
    query("author").optional().isMongoId(),
    query("search").optional().isString(),
    query("sortBy").optional().isIn(["createdAt", "publishDate", "views", "likes", "comments", "title"]),
    query("sortOrder").optional().isIn(["asc", "desc"]),
    query("dateFrom").optional().isISO8601(),
    query("dateTo").optional().isISO8601(),
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

      const filter = {}

      // Add filters
      if (req.query.category) filter.category = req.query.category
      if (req.query.status) filter.status = req.query.status
      if (req.query.priority) filter.priority = req.query.priority
      if (req.query.author) filter.author = req.query.author

      if (req.query.search) {
        filter.$text = { $search: req.query.search }
      }

      // Date range filter
      if (req.query.dateFrom || req.query.dateTo) {
        filter.createdAt = {}
        if (req.query.dateFrom) filter.createdAt.$gte = new Date(req.query.dateFrom)
        if (req.query.dateTo) filter.createdAt.$lte = new Date(req.query.dateTo)
      }

      // Sorting
      const sortBy = req.query.sortBy || "createdAt"
      const sortOrder = req.query.sortOrder === "asc" ? 1 : -1
      const sort = { [sortBy]: sortOrder }

      // Special sorting for engagement metrics
      if (sortBy === "likes") {
        sort["engagement.likes"] = sortOrder
      } else if (sortBy === "views") {
        sort["engagement.views"] = sortOrder
      } else if (sortBy === "comments") {
        sort["engagement.comments"] = sortOrder
      }

      const announcements = await Announcement.find(filter)
        .populate("author", "firstName lastName role")
        .sort(sort)
        .skip(skip)
        .limit(limit)

      const total = await Announcement.countDocuments(filter)

      // Add engagement statistics to each announcement
      const announcementsWithStats = announcements.map(announcement => ({
        ...announcement.toObject(),
        stats: {
          likes: announcement.engagement.likes.length,
          comments: announcement.engagement.comments.length,
          views: announcement.engagement.views,
          totalEngagement: announcement.engagement.likes.length + announcement.engagement.comments.length
        }
      }))

      res.json({
        announcements: announcementsWithStats,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      })
    } catch (error) {
      console.error("Get admin announcements error:", error)
      res.status(500).json({ message: "Server error" })
    }
  }
)

// Admin: Get announcement statistics (MUST be before /admin/:id)
router.get("/admin/statistics", 
  authenticateToken, 
  requireRole(["admin", "moderator"]), 
  async (req, res) => {
    try {
      const stats = await Announcement.aggregate([
        {
          $facet: {
            totalStats: [
              {
                $group: {
                  _id: null,
                  total: { $sum: 1 },
                  totalViews: { $sum: "$engagement.views" },
                  totalLikes: { $sum: { $size: "$engagement.likes" } },
                  totalComments: { $sum: { $size: "$engagement.comments" } }
                }
              }
            ],
            statusBreakdown: [
              {
                $group: {
                  _id: "$status",
                  count: { $sum: 1 }
                }
              }
            ],
            categoryBreakdown: [
              {
                $group: {
                  _id: "$category",
                  count: { $sum: 1 },
                  averageViews: { $avg: "$engagement.views" },
                  totalEngagement: { 
                    $sum: { 
                      $add: [
                        { $size: "$engagement.likes" },
                        { $size: "$engagement.comments" }
                      ]
                    }
                  }
                }
              }
            ],
            priorityBreakdown: [
              {
                $group: {
                  _id: "$priority",
                  count: { $sum: 1 }
                }
              }
            ],
            recentActivity: [
              {
                $match: {
                  createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
                }
              },
              {
                $group: {
                  _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                  count: { $sum: 1 }
                }
              },
              { $sort: { _id: 1 } }
            ],
            topAnnouncements: [
              { $match: { status: "published" } },
              {
                $addFields: {
                  engagementScore: {
                    $add: [
                      { $multiply: ["$engagement.views", 1] },
                      { $multiply: [{ $size: "$engagement.likes" }, 5] },
                      { $multiply: [{ $size: "$engagement.comments" }, 10] }
                    ]
                  }
                }
              },
              { $sort: { engagementScore: -1 } },
              { $limit: 10 },
              {
                $lookup: {
                  from: "users",
                  localField: "author",
                  foreignField: "_id",
                  as: "author"
                }
              },
              { $unwind: "$author" },
              {
                $project: {
                  title: 1,
                  category: 1,
                  author: { firstName: 1, lastName: 1 },
                  views: "$engagement.views",
                  likes: { $size: "$engagement.likes" },
                  comments: { $size: "$engagement.comments" },
                  engagementScore: 1
                }
              }
            ]
          }
        }
      ])

      const result = stats[0]
      const totalStats = result.totalStats[0] || { total: 0, totalViews: 0, totalLikes: 0, totalComments: 0 }

      res.json({
        overview: {
          totalAnnouncements: totalStats.total,
          totalViews: totalStats.totalViews,
          totalLikes: totalStats.totalLikes,
          totalComments: totalStats.totalComments,
          averageEngagement: totalStats.total > 0 ? 
            ((totalStats.totalLikes + totalStats.totalComments) / totalStats.total).toFixed(2) : 0
        },
        breakdowns: {
          status: result.statusBreakdown.reduce((acc, item) => {
            acc[item._id] = item.count
            return acc
          }, {}),
          category: result.categoryBreakdown.reduce((acc, item) => {
            acc[item._id] = {
              count: item.count,
              averageViews: Math.round(item.averageViews || 0),
              totalEngagement: item.totalEngagement
            }
            return acc
          }, {}),
          priority: result.priorityBreakdown.reduce((acc, item) => {
            acc[item._id] = item.count
            return acc
          }, {})
        },
        recentActivity: result.recentActivity,
        topAnnouncements: result.topAnnouncements
      })

    } catch (error) {
      console.error("Get announcement statistics error:", error)
      res.status(500).json({ message: "Server error" })
    }
  }
)

// Admin: Export announcements (MUST be before /admin/:id)
router.get("/admin/export", 
  authenticateToken, 
  requireRole(["admin", "moderator"]), 
  [
    query("format").optional().isIn(["csv", "json"]),
    query("category").optional().isIn(["general", "jobs", "news", "scholarships", "events", "achievements", "obituary"]),
    query("status").optional().isIn(["draft", "published", "archived"]),
    query("dateFrom").optional().isISO8601(),
    query("dateTo").optional().isISO8601(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const format = req.query.format || "json"
      const filter = {}

      // Add filters
      if (req.query.category) filter.category = req.query.category
      if (req.query.status) filter.status = req.query.status

      // Date range filter
      if (req.query.dateFrom || req.query.dateTo) {
        filter.createdAt = {}
        if (req.query.dateFrom) filter.createdAt.$gte = new Date(req.query.dateFrom)
        if (req.query.dateTo) filter.createdAt.$lte = new Date(req.query.dateTo)
      }

      const announcements = await Announcement.find(filter)
        .populate("author", "firstName lastName")
        .sort({ createdAt: -1 })

      // Transform data for export
      const exportData = announcements.map(announcement => ({
        id: announcement._id,
        title: announcement.title,
        category: announcement.category,
        author: `${announcement.author.firstName} ${announcement.author.lastName}`,
        status: announcement.status,
        priority: announcement.priority,
        views: announcement.engagement.views,
        likes: announcement.engagement.likes.length,
        comments: announcement.engagement.comments.length,
        isPinned: announcement.isPinned,
        publishDate: announcement.publishDate,
        createdAt: announcement.createdAt,
        updatedAt: announcement.updatedAt
      }))

      if (format === "csv") {
        const csv = convertToCSV(exportData)
        res.setHeader("Content-Type", "text/csv")
        res.setHeader("Content-Disposition", "attachment; filename=announcements.csv")
        res.send(csv)
      } else {
        res.setHeader("Content-Type", "application/json")
        res.setHeader("Content-Disposition", "attachment; filename=announcements.json")
        res.json(exportData)
      }

    } catch (error) {
      console.error("Export announcements error:", error)
      res.status(500).json({ message: "Server error" })
    }
  }
)

// Admin: Bulk operations (MUST be before /admin/:id)
router.post("/admin/bulk", 
  authenticateToken, 
  requireRole(["admin", "moderator"]), 
  [
    body("action").isIn(["publish", "archive", "delete", "pin", "unpin"]).withMessage("Invalid action"),
    body("announcementIds").isArray({ min: 1 }).withMessage("At least one announcement ID is required"),
    body("announcementIds.*").isMongoId().withMessage("Invalid announcement ID"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { action, announcementIds } = req.body
      let updateData = {}
      let results = { success: 0, failed: 0, errors: [] }

      switch (action) {
        case "publish":
          updateData = { status: "published", publishDate: new Date() }
          break
        case "archive":
          updateData = { status: "archived" }
          break
        case "pin":
          updateData = { isPinned: true }
          break
        case "unpin":
          updateData = { isPinned: false }
          break
        case "delete":
          if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Only admins can delete announcements" })
          }
          
          const deleteResult = await Announcement.deleteMany({ _id: { $in: announcementIds } })
          return res.json({
            message: `${deleteResult.deletedCount} announcements deleted successfully`,
            deletedCount: deleteResult.deletedCount
          })
      }

      // For non-delete operations
      const updateResult = await Announcement.updateMany(
        { _id: { $in: announcementIds } },
        updateData
      )

      res.json({
        message: `Bulk ${action} completed successfully`,
        modifiedCount: updateResult.modifiedCount,
        matchedCount: updateResult.matchedCount
      })

    } catch (error) {
      console.error("Bulk announcement operation error:", error)
      res.status(500).json({ message: "Server error" })
    }
  }
)

// Admin: Create announcement
router.post(
  "/admin",
  authenticateToken,
  requireRole(["admin", "moderator"]),
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("content").notEmpty().withMessage("Content is required"),
    body("category")
      .isIn(["general", "jobs", "news", "scholarships", "events", "achievements", "obituary"])
      .withMessage("Invalid category"),
    body("priority").optional().isIn(["low", "medium", "high", "urgent"]),
    body("status").optional().isIn(["draft", "published", "archived"]),
    body("publishDate").optional().isISO8601(),
    body("expiryDate").optional().isISO8601(),
    body("isPinned").optional().isBoolean(),
    body("targetAudience.graduationYears").optional().isArray(),
    body("targetAudience.locations").optional().isArray(),
    body("targetAudience.roles").optional().isArray(),
    body("targetAudience.isPublic").optional().isBoolean(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const announcement = new Announcement({
        ...req.body,
        author: req.user._id,
      })

      // Set publish date if not provided and status is published
      if (!announcement.publishDate && announcement.status === "published") {
        announcement.publishDate = new Date()
      }

      await announcement.save()

      const populatedAnnouncement = await Announcement.findById(announcement._id)
        .populate("author", "firstName lastName")

      res.status(201).json({
        message: "Announcement created successfully",
        announcement: populatedAnnouncement,
      })
    } catch (error) {
      console.error("Create admin announcement error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Admin: Get announcement details (MUST be AFTER specific routes)
router.get("/admin/:id", 
  authenticateToken, 
  requireRole(["admin", "moderator"]), 
  async (req, res) => {
    try {
      const announcement = await Announcement.findById(req.params.id)
        .populate("author", "firstName lastName role email")
        .populate("engagement.likes.user", "firstName lastName")
        .populate("engagement.comments.user", "firstName lastName")
        .populate("engagement.comments.replies.user", "firstName lastName")

      if (!announcement) {
        return res.status(404).json({ message: "Announcement not found" })
      }

      // Add detailed statistics
      const stats = {
        likes: announcement.engagement.likes.length,
        comments: announcement.engagement.comments.length,
        replies: announcement.engagement.comments.reduce((total, comment) => total + comment.replies.length, 0),
        views: announcement.engagement.views,
        totalEngagement: announcement.engagement.likes.length + announcement.engagement.comments.length,
        engagementRate: announcement.engagement.views > 0 ? 
          ((announcement.engagement.likes.length + announcement.engagement.comments.length) / announcement.engagement.views * 100).toFixed(2) 
          : 0
      }

      res.json({
        ...announcement.toObject(),
        stats
      })
    } catch (error) {
      console.error("Get admin announcement details error:", error)
      res.status(500).json({ message: "Server error" })
    }
  }
)

// Admin: Update announcement
router.put(
  "/admin/:id",
  authenticateToken,
  requireRole(["admin", "moderator"]),
  [
    body("title").optional().trim().notEmpty().withMessage("Title cannot be empty"),
    body("content").optional().notEmpty().withMessage("Content cannot be empty"),
    body("category").optional().isIn(["general", "jobs", "news", "scholarships", "events", "achievements", "obituary"]),
    body("priority").optional().isIn(["low", "medium", "high", "urgent"]),
    body("status").optional().isIn(["draft", "published", "archived"]),
    body("publishDate").optional().isISO8601(),
    body("expiryDate").optional().isISO8601(),
    body("isPinned").optional().isBoolean(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const announcement = await Announcement.findById(req.params.id)

      if (!announcement) {
        return res.status(404).json({ message: "Announcement not found" })
      }

      // Check if user can edit this announcement
      if (announcement.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" })
      }

      // Handle status change to published
      if (req.body.status === "published" && !announcement.publishDate && !req.body.publishDate) {
        req.body.publishDate = new Date()
      }

      Object.keys(req.body).forEach((key) => {
        if (req.body[key] !== undefined) {
          announcement[key] = req.body[key]
        }
      })

      await announcement.save()

      const updatedAnnouncement = await Announcement.findById(announcement._id)
        .populate("author", "firstName lastName")

      res.json({
        message: "Announcement updated successfully",
        announcement: updatedAnnouncement,
      })
    } catch (error) {
      console.error("Update admin announcement error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Admin: Delete announcement
router.delete("/admin/:id", 
  authenticateToken, 
  requireRole(["admin"]), 
  async (req, res) => {
    try {
      const announcement = await Announcement.findById(req.params.id)

      if (!announcement) {
        return res.status(404).json({ message: "Announcement not found" })
      }

      await Announcement.findByIdAndDelete(req.params.id)

      res.json({ message: "Announcement deleted successfully" })
    } catch (error) {
      console.error("Delete admin announcement error:", error)
      res.status(500).json({ message: "Server error" })
    }
  }
)

// =============================================================================
// ALUMNI ROUTES (restricted to alumni users only)
// =============================================================================

// Alumni: Get announcements summary/statistics
router.get("/summary", 
  authenticateToken, 
  requireRole(["alumni"]), 
  async (req, res) => {
    try {
      const userId = req.user._id

      // Get user's announcement engagement stats
      const engagementStats = await Announcement.aggregate([
        {
          $facet: {
            totalAnnouncements: [
              { $match: { status: "published" } },
              { $count: "count" }
            ],
            likedAnnouncements: [
              { $match: { "engagement.likes.user": userId } },
              { $count: "count" }
            ],
            commentedAnnouncements: [
              { $match: { "engagement.comments.user": userId } },
              { $count: "count" }
            ],
            categoryBreakdown: [
              { $match: { status: "published" } },
              { $group: { _id: "$category", count: { $sum: 1 } } }
            ],
            recentActivity: [
              { 
                $match: { 
                  status: "published",
                  publishDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
                }
              },
              { $count: "count" }
            ]
          }
        }
      ])

      const stats = engagementStats[0]
      
      res.json({
        totalAnnouncements: stats.totalAnnouncements[0]?.count || 0,
        likedAnnouncements: stats.likedAnnouncements[0]?.count || 0,
        commentedAnnouncements: stats.commentedAnnouncements[0]?.count || 0,
        recentActivity: stats.recentActivity[0]?.count || 0,
        categoryBreakdown: stats.categoryBreakdown.reduce((acc, item) => {
          acc[item._id] = item.count
          return acc
        }, {})
      })
    } catch (error) {
      console.error("Get announcements summary error:", error)
      res.status(500).json({ message: "Server error" })
    }
  }
)

// =============================================================================
// PUBLIC ROUTES (accessible to all users)
// =============================================================================

// Debug endpoint to test announcements (temporary)
router.get("/debug", async (req, res) => {
  try {
    const now = new Date();
    console.log('Debug endpoint called at:', now);
    
    // Get all announcements without filter
    const allAnnouncements = await Announcement.find({});
    console.log('Total announcements in DB:', allAnnouncements.length);
    
    // Test the old filter
    const oldFilter = {
      status: "published",
      $or: [{ "targetAudience.isPublic": true }, { publishDate: { $lte: now } }],
    };
    const oldResults = await Announcement.find(oldFilter);
    console.log('Old filter results:', oldResults.length);
    
    // Test the new filter
    const newFilter = {
      $or: [
        { status: "published" },
        { 
          status: "draft", 
          publishDate: { $lte: now },
          $or: [{ "targetAudience.isPublic": true }, { publishDate: { $lte: now } }]
        }
      ]
    };
    const newResults = await Announcement.find(newFilter);
    console.log('New filter results:', newResults.length);
    
    res.json({
      debug: {
        currentTime: now,
        totalAnnouncements: allAnnouncements.length,
        oldFilterResults: oldResults.length,
        newFilterResults: newResults.length,
        allAnnouncements: allAnnouncements.map(ann => ({
          id: ann._id,
          title: ann.title,
          status: ann.status,
          publishDate: ann.publishDate,
          expiryDate: ann.expiryDate,
          targetAudience: ann.targetAudience
        }))
      }
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all announcements (public)
router.get(
  "/",
  optionalAuth,
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("category")
      .optional()
      .isIn(["general", "jobs", "news", "scholarships", "events", "achievements", "obituary"]),
    query("priority").optional().isIn(["low", "medium", "high", "urgent"]),
    query("search").optional().isString(),
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

      const filter = {
        $or: [
          { status: "published" },
          { 
            status: "draft", 
            publishDate: { $lte: new Date() }
          }
        ]
      }

      // Add filters
      if (req.query.category) {
        filter.category = req.query.category
      }

      if (req.query.priority) {
        filter.priority = req.query.priority
      }

      if (req.query.search) {
        filter.$text = { $search: req.query.search }
      }

      // Filter by expiry date (only show non-expired announcements)
      // Comment out this section if you want to show expired announcements
      filter.$and = [
        {
          $or: [
            { expiryDate: { $exists: false } },
            { expiryDate: { $gte: new Date() } }
          ]
        }
      ]

      const announcements = await Announcement.find(filter)
        .populate("author", "firstName lastName")
        .sort({ isPinned: -1, publishDate: -1 })
        .skip(skip)
        .limit(limit)

      const total = await Announcement.countDocuments(filter)

      res.json({
        announcements,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      })
    } catch (error) {
      console.error("Get announcements error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Get announcement by ID (public)
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate("author", "firstName lastName")
      .populate("engagement.likes.user", "firstName lastName")
      .populate("engagement.comments.user", "firstName lastName")
      .populate("engagement.comments.replies.user", "firstName lastName")

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" })
    }

    if (announcement.status !== "published") {
      if (!req.user || !["admin", "moderator"].includes(req.user.role)) {
        return res.status(403).json({ message: "Access denied" })
      }
    }

    // Increment view count
    announcement.engagement.views += 1
    await announcement.save()

    res.json(announcement)
  } catch (error) {
    console.error("Get announcement error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Like announcement (authenticated users)
router.post("/:id/like", authenticateToken, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" })
    }

    // Check if user already liked
    const existingLike = announcement.engagement.likes.find((like) => like.user.toString() === req.user._id.toString())

    if (existingLike) {
      // Unlike
      announcement.engagement.likes = announcement.engagement.likes.filter(
        (like) => like.user.toString() !== req.user._id.toString(),
      )
    } else {
      // Like
      announcement.engagement.likes.push({
        user: req.user._id,
      })
    }

    await announcement.save()

    res.json({
      message: existingLike ? "Announcement unliked" : "Announcement liked",
      likeCount: announcement.engagement.likes.length,
    })
  } catch (error) {
    console.error("Like announcement error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Add comment (authenticated users)
router.post(
  "/:id/comments",
  authenticateToken,
  [body("content").trim().notEmpty().withMessage("Comment content is required")],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const announcement = await Announcement.findById(req.params.id)

      if (!announcement) {
        return res.status(404).json({ message: "Announcement not found" })
      }

      const comment = {
        user: req.user._id,
        content: req.body.content,
      }

      announcement.engagement.comments.push(comment)
      await announcement.save()

      const updatedAnnouncement = await Announcement.findById(req.params.id).populate(
        "engagement.comments.user",
        "firstName lastName",
      )

      const newComment = updatedAnnouncement.engagement.comments[updatedAnnouncement.engagement.comments.length - 1]

      res.status(201).json({
        message: "Comment added successfully",
        comment: newComment,
      })
    } catch (error) {
      console.error("Add comment error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Reply to comment (authenticated users)
router.post(
  "/:id/comments/:commentId/replies",
  authenticateToken,
  [body("content").trim().notEmpty().withMessage("Reply content is required")],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const announcement = await Announcement.findById(req.params.id)

      if (!announcement) {
        return res.status(404).json({ message: "Announcement not found" })
      }

      const comment = announcement.engagement.comments.id(req.params.commentId)

      if (!comment) {
        return res.status(404).json({ message: "Comment not found" })
      }

      const reply = {
        user: req.user._id,
        content: req.body.content,
      }

      comment.replies.push(reply)
      await announcement.save()

      const updatedAnnouncement = await Announcement.findById(req.params.id).populate(
        "engagement.comments.replies.user",
        "firstName lastName",
      )

      const updatedComment = updatedAnnouncement.engagement.comments.id(req.params.commentId)
      const newReply = updatedComment.replies[updatedComment.replies.length - 1]

      res.status(201).json({
        message: "Reply added successfully",
        reply: newReply,
      })
    } catch (error) {
      console.error("Add reply error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// =============================================================================
// LEGACY ROUTES (for backward compatibility)
// =============================================================================

// Create announcement (legacy route)
router.post(
  "/",
  authenticateToken,
  requireRole(["admin", "moderator"]),
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("content").notEmpty().withMessage("Content is required"),
    body("category")
      .isIn(["general", "jobs", "news", "scholarships", "events", "achievements", "obituary"])
      .withMessage("Invalid category"),
    body("priority").optional().isIn(["low", "medium", "high", "urgent"]),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const announcement = new Announcement({
        ...req.body,
        author: req.user._id,
      })

      // Set publish date if not provided
      if (!announcement.publishDate) {
        announcement.publishDate = new Date()
      }

      await announcement.save()

      const populatedAnnouncement = await Announcement.findById(announcement._id).populate(
        "author",
        "firstName lastName",
      )

      res.status(201).json({
        message: "Announcement created successfully",
        announcement: populatedAnnouncement,
      })
    } catch (error) {
      console.error("Create announcement error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Update announcement (legacy route)
router.put(
  "/:id",
  authenticateToken,
  requireRole(["admin", "moderator"]),
  [
    body("title").optional().trim().notEmpty().withMessage("Title cannot be empty"),
    body("content").optional().notEmpty().withMessage("Content cannot be empty"),
    body("category").optional().isIn(["general", "jobs", "news", "scholarships", "events", "achievements", "obituary"]),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const announcement = await Announcement.findById(req.params.id)

      if (!announcement) {
        return res.status(404).json({ message: "Announcement not found" })
      }

      // Check if user can edit this announcement
      if (announcement.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" })
      }

      Object.keys(req.body).forEach((key) => {
        if (req.body[key] !== undefined) {
          announcement[key] = req.body[key]
        }
      })

      await announcement.save()

      const updatedAnnouncement = await Announcement.findById(announcement._id).populate("author", "firstName lastName")

      res.json({
        message: "Announcement updated successfully",
        announcement: updatedAnnouncement,
      })
    } catch (error) {
      console.error("Update announcement error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Delete announcement (legacy route)
router.delete("/:id", authenticateToken, requireRole(["admin", "moderator"]), async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" })
    }

    // Check if user can delete this announcement
    if (announcement.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" })
    }

    await Announcement.findByIdAndDelete(req.params.id)

    res.json({ message: "Announcement deleted successfully" })
  } catch (error) {
    console.error("Delete announcement error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function convertToCSV(data) {
  if (!data.length) return ""
  
  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(","),
    ...data.map(row =>
      headers.map(header => {
        let value = row[header]
        if (value === null || value === undefined) value = ""
        if (typeof value === "string" && (value.includes(",") || value.includes('"') || value.includes("\n"))) {
          value = `"${value.replace(/"/g, '""')}"`
        }
        return value
      }).join(",")
    )
  ].join("\n")
  
  return csvContent
}

module.exports = router
