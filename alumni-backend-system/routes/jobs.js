const express = require("express")
const { body, query, validationResult } = require("express-validator")
const Job = require("../models/Job")
const { authenticateToken, requireRole, optionalAuth } = require("../middleware/auth")

/**
 * @swagger
 * tags:
 *   name: Jobs
 *   description: Job board and application management
 */

const router = express.Router()

// ==================== ADMIN ROUTES ====================
// NOTE: Admin routes must be defined BEFORE the /:id route to avoid conflicts

// Get all jobs (Admin/Moderator)
router.get(
  "/admin",
  authenticateToken,
  requireRole(["admin", "moderator"]),
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("type").optional().isIn(["full-time", "part-time", "contract", "internship", "volunteer"]),
    query("category")
      .optional()
      .isIn(["technology", "healthcare", "finance", "education", "marketing", "sales", "operations", "other"]),
    query("experienceLevel").optional().isIn(["entry", "mid", "senior", "executive"]),
    query("status").optional().isIn(["active", "filled", "expired", "cancelled"]),
    query("featured").optional().isBoolean(),
    query("search").optional().isString(),
    query("sortBy").optional().isIn(["createdAt", "title", "company", "views", "applicationCount", "expiresAt"]),
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
      if (req.query.type) {
        filter.type = req.query.type
      }

      if (req.query.category) {
        filter.category = req.query.category
      }

      if (req.query.experienceLevel) {
        filter.experienceLevel = req.query.experienceLevel
      }

      if (req.query.status) {
        filter.status = req.query.status
      }

      if (req.query.featured !== undefined) {
        filter.featured = req.query.featured === "true"
      }

      if (req.query.search) {
        filter.$or = [
          { title: { $regex: req.query.search, $options: "i" } },
          { "company.name": { $regex: req.query.search, $options: "i" } },
          { description: { $regex: req.query.search, $options: "i" } },
        ]
      }

      // Date range filter
      if (req.query.dateFrom || req.query.dateTo) {
        filter.createdAt = {}
        if (req.query.dateFrom) {
          filter.createdAt.$gte = new Date(req.query.dateFrom)
        }
        if (req.query.dateTo) {
          filter.createdAt.$lte = new Date(req.query.dateTo)
        }
      }

      // Build sort object
      let sort = { createdAt: -1 } // default sort
      if (req.query.sortBy) {
        const sortOrder = req.query.sortOrder === "asc" ? 1 : -1

        if (req.query.sortBy === "applicationCount") {
          // For applicationCount, we need to use aggregation
          const pipeline = [
            { $match: filter },
            {
              $addFields: {
                applicationCount: { $size: "$applications" },
              },
            },
            { $sort: { applicationCount: sortOrder } },
            { $skip: skip },
            { $limit: limit },
            {
              $lookup: {
                from: "users",
                localField: "postedBy",
                foreignField: "_id",
                as: "postedBy",
                pipeline: [{ $project: { firstName: 1, lastName: 1, email: 1 } }],
              },
            },
            {
              $unwind: "$postedBy",
            },
          ]

          const jobs = await Job.aggregate(pipeline)
          const total = await Job.countDocuments(filter)

          // Get summary statistics
          const statusCounts = await Job.aggregate([
            { $match: filter },
            { $group: { _id: "$status", count: { $sum: 1 } } },
          ])

          const typeCounts = await Job.aggregate([
            { $match: filter },
            { $group: { _id: "$type", count: { $sum: 1 } } },
          ])

          return res.json({
            jobs,
            pagination: {
              page,
              limit,
              total,
              pages: Math.ceil(total / limit),
            },
            summary: {
              statusBreakdown: statusCounts.reduce((acc, item) => {
                acc[item._id] = item.count
                return acc
              }, {}),
              typeBreakdown: typeCounts.reduce((acc, item) => {
                acc[item._id] = item.count
                return acc
              }, {}),
            },
          })
        } else {
          sort = { [req.query.sortBy]: sortOrder }
        }
      }

      const jobs = await Job.find(filter)
        .populate("postedBy", "firstName lastName email")
        .sort(sort)
        .skip(skip)
        .limit(limit)

      const total = await Job.countDocuments(filter)

      // Get summary statistics
      const statusCounts = await Job.aggregate([
        { $match: filter },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ])

      const typeCounts = await Job.aggregate([
        { $match: filter },
        { $group: { _id: "$type", count: { $sum: 1 } } },
      ])

      res.json({
        jobs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
        summary: {
          statusBreakdown: statusCounts.reduce((acc, item) => {
            acc[item._id] = item.count
            return acc
          }, {}),
          typeBreakdown: typeCounts.reduce((acc, item) => {
            acc[item._id] = item.count
            return acc
          }, {}),
        },
      })
    } catch (error) {
      console.error("Get admin jobs error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Create job (Admin)
router.post(
  "/admin",
  authenticateToken,
  requireRole(["admin"]),
  [
    body("title").trim().notEmpty().withMessage("Job title is required"),
    body("company.name").trim().notEmpty().withMessage("Company name is required"),
    body("company.logo").optional().isURL().withMessage("Company logo must be a valid URL"),
    body("company.website").optional().isURL().withMessage("Company website must be a valid URL"),
    body("company.description").optional().isString(),
    body("company.location.city").optional().isString(),
    body("company.location.country").optional().isString(),
    body("company.location.isRemote").optional().isBoolean(),
    body("description").notEmpty().withMessage("Job description is required"),
    body("requirements").optional().isArray(),
    body("responsibilities").optional().isArray(),
    body("benefits").optional().isArray(),
    body("type")
      .isIn(["full-time", "part-time", "contract", "internship", "volunteer"])
      .withMessage("Invalid job type"),
    body("category")
      .isIn(["technology", "healthcare", "finance", "education", "marketing", "sales", "operations", "other"])
      .withMessage("Invalid category"),
    body("experienceLevel").isIn(["entry", "mid", "senior", "executive"]).withMessage("Invalid experience level"),
    body("salary.min").optional().isNumeric().withMessage("Minimum salary must be a number"),
    body("salary.max").optional().isNumeric().withMessage("Maximum salary must be a number"),
    body("salary.currency").optional().isString(),
    body("salary.period").optional().isIn(["hourly", "monthly", "yearly"]),
    body("salary.isNegotiable").optional().isBoolean(),
    body("postedBy").isMongoId().withMessage("Posted by must be a valid user ID"),
    body("contactInfo.email").optional().isEmail().withMessage("Contact email must be valid"),
    body("contactInfo.phone").optional().isString(),
    body("contactInfo.contactPerson").optional().isString(),
    body("applicationDeadline").optional().isISO8601().withMessage("Application deadline must be a valid date"),
    body("applicationMethod")
      .isIn(["email", "website", "phone", "in_person"])
      .withMessage("Invalid application method"),
    body("applicationUrl").optional().isURL().withMessage("Application URL must be valid"),
    body("skills").optional().isArray(),
    body("tags").optional().isArray(),
    body("status").optional().isIn(["active", "filled", "expired", "cancelled"]),
    body("featured").optional().isBoolean(),
    body("expiresAt").optional().isISO8601().withMessage("Expires at must be a valid date"),
    body("questionnaire").optional().isArray().withMessage("Questionnaire must be an array of questions"),
    body("questionnaire.*").optional().isString().withMessage("Each questionnaire item must be a string"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      // Validate salary range
      if (req.body.salary && req.body.salary.min && req.body.salary.max) {
        if (req.body.salary.min > req.body.salary.max) {
          return res.status(400).json({ message: "Minimum salary cannot be greater than maximum salary" })
        }
      }

      // Validate application deadline
      if (req.body.applicationDeadline && new Date(req.body.applicationDeadline) <= new Date()) {
        return res.status(400).json({ message: "Application deadline must be in the future" })
      }

      // Validate expiration date
      if (req.body.expiresAt && new Date(req.body.expiresAt) <= new Date()) {
        return res.status(400).json({ message: "Expiration date must be in the future" })
      }

      const job = new Job(req.body)

      // Set default expiry date if not provided (30 days)
      if (!job.expiresAt) {
        job.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }

      await job.save()

      const populatedJob = await Job.findById(job._id).populate("postedBy", "firstName lastName email")

      res.status(201).json({
        message: "Job created successfully",
        job: populatedJob,
      })
    } catch (error) {
      console.error("Create admin job error:", error)
      if (error.name === "ValidationError") {
        return res.status(400).json({ message: error.message })
      }
      if (error.code === 11000) {
        return res.status(400).json({ message: "Duplicate job entry" })
      }
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Get single job (Admin)
router.get(
  "/admin/:id",
  authenticateToken,
  requireRole(["admin", "moderator"]),
  async (req, res) => {
    try {
      const job = await Job.findById(req.params.id)
        .populate("postedBy", "firstName lastName email profile")
        .populate("applications.applicant", "firstName lastName email profile")

      if (!job) {
        return res.status(404).json({ message: "Job not found" })
      }

      // Admin statistics for this job
      const stats = {
        totalApplications: job.applications.length,
        applicationsByStatus: job.applications.reduce((acc, app) => {
          acc[app.status] = (acc[app.status] || 0) + 1
          return acc
        }, {}),
        averageApplicationsPerDay: job.applications.length / Math.max(1, Math.ceil((new Date() - job.createdAt) / (1000 * 60 * 60 * 24))),
        daysActive: Math.ceil((new Date() - job.createdAt) / (1000 * 60 * 60 * 24)),
        daysUntilExpiry: job.expiresAt ? Math.ceil((job.expiresAt - new Date()) / (1000 * 60 * 60 * 24)) : null,
        viewsPerDay: job.views / Math.max(1, Math.ceil((new Date() - job.createdAt) / (1000 * 60 * 60 * 24))),
      }

      res.json({
        job,
        adminStats: stats,
      })
    } catch (error) {
      console.error("Get admin job error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Update job (Admin)
router.put(
  "/admin/:id",
  authenticateToken,
  requireRole(["admin"]),
  [
    body("title").optional().trim().notEmpty().withMessage("Job title cannot be empty"),
    body("company.name").optional().trim().notEmpty().withMessage("Company name cannot be empty"),
    body("company.logo").optional().isURL().withMessage("Company logo must be a valid URL"),
    body("company.website").optional().isURL().withMessage("Company website must be a valid URL"),
    body("description").optional().notEmpty().withMessage("Job description cannot be empty"),
    body("type")
      .optional()
      .isIn(["full-time", "part-time", "contract", "internship", "volunteer"])
      .withMessage("Invalid job type"),
    body("category")
      .optional()
      .isIn(["technology", "healthcare", "finance", "education", "marketing", "sales", "operations", "other"])
      .withMessage("Invalid category"),
    body("experienceLevel")
      .optional()
      .isIn(["entry", "mid", "senior", "executive"])
      .withMessage("Invalid experience level"),
    body("status").optional().isIn(["active", "filled", "expired", "cancelled"]),
    body("featured").optional().isBoolean(),
    body("applicationDeadline").optional().isISO8601().withMessage("Application deadline must be a valid date"),
    body("expiresAt").optional().isISO8601().withMessage("Expires at must be a valid date"),
    body("questionnaire").optional().isArray().withMessage("Questionnaire must be an array of questions"),
    body("questionnaire.*").optional().isString().withMessage("Each questionnaire item must be a string"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const job = await Job.findById(req.params.id)

      if (!job) {
        return res.status(404).json({ message: "Job not found" })
      }

      // Validate salary range if provided
      if (req.body.salary) {
        const newSalary = { ...job.salary.toObject(), ...req.body.salary }
        if (newSalary.min && newSalary.max && newSalary.min > newSalary.max) {
          return res.status(400).json({ message: "Minimum salary cannot be greater than maximum salary" })
        }
      }

      // Validate application deadline
      if (req.body.applicationDeadline && new Date(req.body.applicationDeadline) <= new Date()) {
        return res.status(400).json({ message: "Application deadline must be in the future" })
      }

      // Validate expiration date
      if (req.body.expiresAt && new Date(req.body.expiresAt) <= new Date()) {
        return res.status(400).json({ message: "Expiration date must be in the future" })
      }

      // Update job fields
      Object.keys(req.body).forEach((key) => {
        if (req.body[key] !== undefined) {
          if (key === "company" && typeof req.body[key] === "object") {
            job.company = { ...job.company.toObject(), ...req.body[key] }
          } else if (key === "salary" && typeof req.body[key] === "object") {
            job.salary = { ...job.salary.toObject(), ...req.body[key] }
          } else if (key === "contactInfo" && typeof req.body[key] === "object") {
            job.contactInfo = { ...job.contactInfo.toObject(), ...req.body[key] }
          } else if (key === "questionnaire") {
            job.questionnaire = req.body.questionnaire;
          } else {
            job[key] = req.body[key]
          }
        }
      })

      await job.save()

      const updatedJob = await Job.findById(job._id).populate("postedBy", "firstName lastName email")

      res.json({
        message: "Job updated successfully",
        job: updatedJob,
      })
    } catch (error) {
      console.error("Update admin job error:", error)
      if (error.name === "ValidationError") {
        return res.status(400).json({ message: error.message })
      }
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Delete job (Admin)
router.delete(
  "/admin/:id",
  authenticateToken,
  requireRole(["admin"]),
  async (req, res) => {
    try {
      const job = await Job.findById(req.params.id)

      if (!job) {
        return res.status(404).json({ message: "Job not found" })
      }

      await Job.findByIdAndDelete(req.params.id)

      res.json({ message: "Job deleted successfully" })
    } catch (error) {
      console.error("Delete admin job error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Bulk operations (Admin)
router.post(
  "/admin/bulk",
  authenticateToken,
  requireRole(["admin"]),
  [
    body("action").isIn(["delete", "activate", "deactivate", "feature", "unfeature", "expire"]).withMessage("Invalid bulk action"),
    body("jobIds").isArray({ min: 1 }).withMessage("Job IDs array is required"),
    body("jobIds.*").isMongoId().withMessage("Invalid job ID format"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { action, jobIds } = req.body

      let updateOperation = {}
      let message = ""

      switch (action) {
        case "delete":
          await Job.deleteMany({ _id: { $in: jobIds } })
          message = `${jobIds.length} jobs deleted successfully`
          break
        case "activate":
          updateOperation = { status: "active" }
          message = `${jobIds.length} jobs activated successfully`
          break
        case "deactivate":
          updateOperation = { status: "cancelled" }
          message = `${jobIds.length} jobs deactivated successfully`
          break
        case "feature":
          updateOperation = { featured: true }
          message = `${jobIds.length} jobs featured successfully`
          break
        case "unfeature":
          updateOperation = { featured: false }
          message = `${jobIds.length} jobs unfeatured successfully`
          break
        case "expire":
          updateOperation = { status: "expired", expiresAt: new Date() }
          message = `${jobIds.length} jobs expired successfully`
          break
      }

      if (action !== "delete") {
        await Job.updateMany({ _id: { $in: jobIds } }, updateOperation)
      }

      res.json({ message })
    } catch (error) {
      console.error("Bulk jobs operation error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Export jobs data (Admin)
router.get(
  "/admin/export",
  authenticateToken,
  requireRole(["admin"]),
  [
    query("format").optional().isIn(["csv", "json"]).withMessage("Format must be csv or json"),
    query("status").optional().isIn(["active", "filled", "expired", "cancelled"]),
    query("type").optional().isIn(["full-time", "part-time", "contract", "internship", "volunteer"]),
    query("category")
      .optional()
      .isIn(["technology", "healthcare", "finance", "education", "marketing", "sales", "operations", "other"]),
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

      // Apply filters
      if (req.query.status) filter.status = req.query.status
      if (req.query.type) filter.type = req.query.type
      if (req.query.category) filter.category = req.query.category

      if (req.query.dateFrom || req.query.dateTo) {
        filter.createdAt = {}
        if (req.query.dateFrom) filter.createdAt.$gte = new Date(req.query.dateFrom)
        if (req.query.dateTo) filter.createdAt.$lte = new Date(req.query.dateTo)
      }

      const jobs = await Job.find(filter)
        .populate("postedBy", "firstName lastName email")
        .sort({ createdAt: -1 })

      if (format === "csv") {
        const csvData = jobs.map((job) => ({
          ID: job._id,
          Title: job.title,
          Company: job.company.name,
          Type: job.type,
          Category: job.category,
          ExperienceLevel: job.experienceLevel,
          Status: job.status,
          Featured: job.featured,
          Applications: job.applications.length,
          Views: job.views,
          PostedBy: `${job.postedBy.firstName} ${job.postedBy.lastName}`,
          PostedByEmail: job.postedBy.email,
          CreatedAt: job.createdAt.toISOString(),
          ExpiresAt: job.expiresAt ? job.expiresAt.toISOString() : "",
          Location: job.company.location ? `${job.company.location.city || ""}, ${job.company.location.country || ""}` : "",
          Remote: job.company.location ? job.company.location.isRemote : false,
          SalaryMin: job.salary ? job.salary.min || "" : "",
          SalaryMax: job.salary ? job.salary.max || "" : "",
          SalaryCurrency: job.salary ? job.salary.currency || "" : "",
          SalaryPeriod: job.salary ? job.salary.period || "" : "",
        }))

        const csvHeaders = Object.keys(csvData[0] || {}).join(",")
        const csvRows = csvData.map((row) =>
          Object.values(row)
            .map((value) => `"${String(value).replace(/"/g, '""')}"`)
            .join(","),
        )
        const csvContent = [csvHeaders, ...csvRows].join("\n")

        res.setHeader("Content-Type", "text/csv")
        res.setHeader("Content-Disposition", `attachment; filename="jobs_export_${new Date().toISOString().split("T")[0]}.csv"`)
        res.send(csvContent)
      } else {
        res.setHeader("Content-Type", "application/json")
        res.setHeader("Content-Disposition", `attachment; filename="jobs_export_${new Date().toISOString().split("T")[0]}.json"`)
        res.json({
          exportDate: new Date().toISOString(),
          totalJobs: jobs.length,
          filters: req.query,
          jobs,
        })
      }
    } catch (error) {
      console.error("Export jobs error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Get job statistics (Admin)
router.get(
  "/admin/statistics",
  authenticateToken,
  requireRole(["admin", "moderator"]),
  async (req, res) => {
    try {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

      // Main KPIs
      const totalJobs = await Job.countDocuments()
      const activeJobs = await Job.countDocuments({ status: "active" })
      const jobsThisMonth = await Job.countDocuments({ createdAt: { $gte: startOfMonth } })
      const jobsLastMonth = await Job.countDocuments({
        createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
      })

      // Calculate percentage changes
      const jobsGrowth = jobsLastMonth > 0 ? ((jobsThisMonth - jobsLastMonth) / jobsLastMonth) * 100 : 0

      // Total applications across all jobs
      const applicationStats = await Job.aggregate([
        {
          $project: {
            applicationCount: { $size: "$applications" },
          },
        },
        {
          $group: {
            _id: null,
            totalApplications: { $sum: "$applicationCount" },
            averageApplicationsPerJob: { $avg: "$applicationCount" },
          },
        },
      ])

      const totalApplications = applicationStats[0]?.totalApplications || 0
      const averageApplicationsPerJob = applicationStats[0]?.averageApplicationsPerJob || 0

      // Jobs by status
      const jobsByStatus = await Job.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ])

      // Jobs by type
      const jobsByType = await Job.aggregate([
        { $group: { _id: "$type", count: { $sum: 1 } } },
      ])

      // Jobs by category
      const jobsByCategory = await Job.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
      ])

      // Monthly trends for last 12 months
      const monthlyTrends = await Job.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 11, 1) },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            jobsCreated: { $sum: 1 },
            applicationsReceived: { $sum: { $size: "$applications" } },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ])

      // Top performing jobs by applications
      const topJobsByApplications = await Job.aggregate([
        {
          $addFields: {
            applicationCount: { $size: "$applications" },
          },
        },
        { $sort: { applicationCount: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "users",
            localField: "postedBy",
            foreignField: "_id",
            as: "postedBy",
            pipeline: [{ $project: { firstName: 1, lastName: 1 } }],
          },
        },
        { $unwind: "$postedBy" },
        {
          $project: {
            title: 1,
            "company.name": 1,
            type: 1,
            applicationCount: 1,
            views: 1,
            postedBy: 1,
            createdAt: 1,
          },
        },
      ])

      // Average metrics
      const averageMetrics = await Job.aggregate([
        {
          $group: {
            _id: null,
            averageViews: { $avg: "$views" },
            averageApplications: { $avg: { $size: "$applications" } },
            totalViews: { $sum: "$views" },
          },
        },
      ])

      // Featured jobs stats
      const featuredJobsCount = await Job.countDocuments({ featured: true })

      // Expired jobs that need attention
      const expiredJobs = await Job.countDocuments({
        status: "active",
        expiresAt: { $lte: now },
      })

      // Jobs expiring soon (next 7 days)
      const jobsExpiringSoon = await Job.countDocuments({
        status: "active",
        expiresAt: { $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), $gt: now },
      })

      res.json({
        mainKpis: {
          totalJobs: {
            value: totalJobs,
            change: jobsGrowth,
            changeType: jobsGrowth >= 0 ? "increase" : "decrease",
          },
          activeJobs: {
            value: activeJobs,
            percentage: totalJobs > 0 ? ((activeJobs / totalJobs) * 100).toFixed(1) : 0,
          },
          jobsThisMonth: {
            value: jobsThisMonth,
            change: jobsGrowth,
            changeType: jobsGrowth >= 0 ? "increase" : "decrease",
          },
          totalApplications: {
            value: totalApplications,
            averagePerJob: Math.round(averageApplicationsPerJob * 100) / 100,
          },
          featuredJobs: {
            value: featuredJobsCount,
            percentage: totalJobs > 0 ? ((featuredJobsCount / totalJobs) * 100).toFixed(1) : 0,
          },
        },
        breakdown: {
          byStatus: jobsByStatus.reduce((acc, item) => {
            acc[item._id] = item.count
            return acc
          }, {}),
          byType: jobsByType.reduce((acc, item) => {
            acc[item._id] = item.count
            return acc
          }, {}),
          byCategory: jobsByCategory.reduce((acc, item) => {
            acc[item._id] = item.count
            return acc
          }, {}),
        },
        trends: {
          monthly: monthlyTrends.map((item) => ({
            month: `${item._id.year}-${String(item._id.month).padStart(2, "0")}`,
            jobsCreated: item.jobsCreated,
            applicationsReceived: item.applicationsReceived,
          })),
        },
        topPerformers: {
          jobsByApplications: topJobsByApplications,
        },
        averageMetrics: {
          viewsPerJob: Math.round((averageMetrics[0]?.averageViews || 0) * 100) / 100,
          applicationsPerJob: Math.round((averageMetrics[0]?.averageApplications || 0) * 100) / 100,
          totalViews: averageMetrics[0]?.totalViews || 0,
        },
        alerts: {
          expiredJobs,
          jobsExpiringSoon,
        },
      })
    } catch (error) {
      console.error("Get job statistics error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Job summary statistics (Alumni/Admin)
router.get(
  "/summary",
  authenticateToken,
  requireRole(["alumni", "admin"]),
  async (req, res) => {
    try {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

      // Main metrics
      const totalJobs = await Job.countDocuments()
      const activeJobs = await Job.countDocuments({ status: "active" })
      const jobsThisMonth = await Job.countDocuments({ createdAt: { $gte: startOfMonth } })
      const jobsLastMonth = await Job.countDocuments({
        createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
      })

      // Calculate growth
      const jobsGrowth = jobsLastMonth > 0 ? ((jobsThisMonth - jobsLastMonth) / jobsLastMonth) * 100 : 0

      // Total applications
      const applicationStats = await Job.aggregate([
        {
          $project: {
            applicationCount: { $size: "$applications" },
          },
        },
        {
          $group: {
            _id: null,
            totalApplications: { $sum: "$applicationCount" },
          },
        },
      ])

      const totalApplications = applicationStats[0]?.totalApplications || 0

      // Featured jobs
      const featuredJobs = await Job.countDocuments({ featured: true })

      res.json({
        totalJobs: {
          value: totalJobs,
          change: Math.round(jobsGrowth * 100) / 100,
          changeType: jobsGrowth >= 0 ? "increase" : "decrease",
        },
        activeJobs: {
          value: activeJobs,
          percentage: totalJobs > 0 ? Math.round(((activeJobs / totalJobs) * 100) * 100) / 100 : 0,
        },
        jobsThisMonth: {
          value: jobsThisMonth,
          change: Math.round(jobsGrowth * 100) / 100,
          changeType: jobsGrowth >= 0 ? "increase" : "decrease",
        },
        totalApplications: {
          value: totalApplications,
        },
        featuredJobs: {
          value: featuredJobs,
        },
      })
    } catch (error) {
      console.error("Get job summary error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// ==================== PUBLIC ROUTES ====================

// Get all jobs
router.get(
  "/",
  optionalAuth,
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("type").optional().isIn(["full-time", "part-time", "contract", "internship", "volunteer"]),
    query("category")
      .optional()
      .isIn(["technology", "healthcare", "finance", "education", "marketing", "sales", "operations", "other"]),
    query("experienceLevel").optional().isIn(["entry", "mid", "senior", "executive"]),
    query("location").optional().isString(),
    query("remote").optional().isBoolean(),
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

      const filter = { status: "active" }

      // Add filters
      if (req.query.type) {
        filter.type = req.query.type
      }

      if (req.query.category) {
        filter.category = req.query.category
      }

      if (req.query.experienceLevel) {
        filter.experienceLevel = req.query.experienceLevel
      }

      if (req.query.location) {
        filter.$or = [
          { "company.location.city": new RegExp(req.query.location, "i") },
          { "company.location.country": new RegExp(req.query.location, "i") },
        ]
      }

      if (req.query.remote === "true") {
        filter["company.location.isRemote"] = true
      }

      if (req.query.search) {
        filter.$text = { $search: req.query.search }
      }

      // Filter out expired jobs
      filter.$or = [{ expiresAt: { $exists: false } }, { expiresAt: { $gte: new Date() } }]

      const jobs = await Job.find(filter)
        .populate("postedBy", "firstName lastName")
        .sort({ featured: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)

      const total = await Job.countDocuments(filter)

      res.json({
        jobs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      })
    } catch (error) {
      console.error("Get jobs error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Apply for a job (with questionnaire)
/**
 * @swagger
 * /api/jobs/{jobId}/apply:
 *   post:
 *     summary: Apply for a job (with questionnaire answers)
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     question:
 *                       type: string
 *                     answer:
 *                       type: string
 *                 description: List of question/answer pairs
 *           example:
 *             answers:
 *               - question: "Why do you want this job?"
 *                 answer: "I am passionate about software engineering."
 *               - question: "What excites you about working with us?"
 *                 answer: "Your company culture and innovative projects."
 *               - question: "Describe a project or experience relevant to this role."
 *                 answer: "I built a scalable web app for 10,000 users."
 *               - question: "What is your strongest skill related to this position?"
 *                 answer: "Problem-solving and backend development."
 *               - question: "How would you handle a tight project deadline?"
 *                 answer: "I would prioritize tasks and communicate clearly with the team."
 *               - question: "Describe a challenge you overcame in your previous work."
 *                 answer: "I resolved a major production bug under pressure."
 *               - question: "When can you start?"
 *                 answer: "Immediately."
 *               - question: "Are you willing to relocate or work remotely?"
 *                 answer: "Yes, I am open to both."
 *               - question: "What are your salary expectations?"
 *                 answer: "$5000/month."
 *               - question: "Is there anything else you’d like us to know?"
 *                 answer: "I am eager to contribute and grow with your team."
 *     responses:
 *       200:
 *         description: Application submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Application submitted successfully
 *       400:
 *         description: Already applied or invalid request
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
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Job not found
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
 *               $ref: '#/components/schemas/Error'
 */
router.post('/:jobId/apply', authenticateToken, requireRole(["alumni"]), async (req, res) => {
  try {
    const { answers } = req.body;
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    // Prevent duplicate applications
    if (job.applications.some(app => app.applicant && app.applicant.equals(req.user._id))) {
      return res.status(400).json({ message: "Already applied" });
    }

    job.applications.push({
      applicant: req.user._id,
      answers: answers || [],
      status: "applied",
      appliedAt: new Date()
    });

    await job.save();
    res.json({ message: "Application submitted successfully" });
  } catch (error) {
    console.error("Job application error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get job by ID
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate("postedBy", "firstName lastName email")
      .populate("applications.applicant", "firstName lastName email")

    if (!job) {
      return res.status(404).json({ message: "Job not found" })
    }

    if (job.status !== "active") {
      return res.status(404).json({ message: "Job not available" })
    }

    // Increment view count
    job.views += 1
    await job.save()

    // Hide applications from non-owners
    if (!req.user || (job.postedBy._id.toString() !== req.user._id.toString() && req.user.role !== "admin")) {
      job.applications = undefined
    }

    res.json(job)
  } catch (error) {
    console.error("Get job error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create job
router.post(
  "/",
  authenticateToken,
  [
    body("title").trim().notEmpty().withMessage("Job title is required"),
    body("company.name").trim().notEmpty().withMessage("Company name is required"),
    body("description").notEmpty().withMessage("Job description is required"),
    body("type")
      .isIn(["full-time", "part-time", "contract", "internship", "volunteer"])
      .withMessage("Invalid job type"),
    body("category")
      .isIn(["technology", "healthcare", "finance", "education", "marketing", "sales", "operations", "other"])
      .withMessage("Invalid category"),
    body("experienceLevel").isIn(["entry", "mid", "senior", "executive"]).withMessage("Invalid experience level"),
    body("applicationMethod")
      .isIn(["email", "website", "phone", "in_person"])
      .withMessage("Invalid application method"),
    body("questionnaire").optional().isArray().withMessage("Questionnaire must be an array of questions"),
    body("questionnaire.*").optional().isString().withMessage("Each questionnaire item must be a string"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const job = new Job({
        ...req.body,
        postedBy: req.user._id,
      })

      // Set expiry date if not provided (default 30 days)
      if (!job.expiresAt) {
        job.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }

      await job.save()

      const populatedJob = await Job.findById(job._id).populate("postedBy", "firstName lastName")

      res.status(201).json({
        message: "Job posted successfully",
        job: populatedJob,
      })
    } catch (error) {
      console.error("Create job error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Update job
router.put(
  "/:id",
  authenticateToken,
  [
    body("title").optional().trim().notEmpty().withMessage("Job title cannot be empty"),
    body("company.name").optional().trim().notEmpty().withMessage("Company name cannot be empty"),
    body("description").optional().notEmpty().withMessage("Job description cannot be empty"),
    body("questionnaire").optional().isArray().withMessage("Questionnaire must be an array of questions"),
    body("questionnaire.*").optional().isString().withMessage("Each questionnaire item must be a string"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const job = await Job.findById(req.params.id)

      if (!job) {
        return res.status(404).json({ message: "Job not found" })
      }

      // Check if user can edit this job
      if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" })
      }

      // Update fields
      Object.keys(req.body).forEach((key) => {
        if (key === "company") {
          Object.keys(req.body.company).forEach((companyKey) => {
            if (req.body.company[companyKey] !== undefined) {
              job.company[companyKey] = req.body.company[companyKey]
            }
          })
        } else if (key === "questionnaire") {
          job.questionnaire = req.body.questionnaire;
        } else if (req.body[key] !== undefined) {
          job[key] = req.body[key]
        }
      })

      await job.save()

      const updatedJob = await Job.findById(job._id).populate("postedBy", "firstName lastName")

      res.json({
        message: "Job updated successfully",
        job: updatedJob,
      })
    } catch (error) {
      console.error("Update job error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Delete job
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)

    if (!job) {
      return res.status(404).json({ message: "Job not found" })
    }

    // Check if user can delete this job
    if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" })
    }

    await Job.findByIdAndDelete(req.params.id)

    res.json({ message: "Job deleted successfully" })
  } catch (error) {
    console.error("Delete job error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get job applications (for job poster)
router.get("/:id/applications", authenticateToken, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      "applications.applicant",
      "firstName lastName email phone profile",
    )

    if (!job) {
      return res.status(404).json({ message: "Job not found" })
    }

    // Check if user can view applications
    if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" })
    }

    res.json({
      applications: job.applications,
      totalCount: job.applications.length,
    })
  } catch (error) {
    console.error("Get job applications error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update application status
router.put(
  "/:id/applications/:applicationId",
  authenticateToken,
  [
    body("status")
      .isIn(["applied", "reviewed", "shortlisted", "interviewed", "offered", "rejected"])
      .withMessage("Invalid status"),
    body("notes").optional().isString().withMessage("Notes must be a string"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const job = await Job.findById(req.params.id)

      if (!job) {
        return res.status(404).json({ message: "Job not found" })
      }

      // Check if user can update applications
      if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" })
      }

      const application = job.applications.id(req.params.applicationId)

      if (!application) {
        return res.status(404).json({ message: "Application not found" })
      }

      application.status = req.body.status
      if (req.body.notes) {
        application.notes = req.body.notes
      }

      await job.save()

      res.json({
        message: "Application status updated successfully",
        application,
      })
    } catch (error) {
      console.error("Update application status error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Get user's job applications
router.get("/my/applications", authenticateToken, async (req, res) => {
  try {
    const jobs = await Job.find({
      "applications.applicant": req.user._id,
    })
      .populate("postedBy", "firstName lastName")
      .select("title company type applications")

    const applications = jobs.map((job) => {
      const userApplication = job.applications.find((app) => app.applicant.toString() === req.user._id.toString())

      return {
        job: {
          _id: job._id,
          title: job.title,
          company: job.company,
          type: job.type,
          postedBy: job.postedBy,
        },
        application: userApplication,
      }
    })

    res.json(applications)
  } catch (error) {
    console.error("Get user applications error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
