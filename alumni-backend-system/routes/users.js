const express = require("express")
const { body, query, validationResult } = require("express-validator")
const User = require("../models/User")
const Event = require("../models/Event")
const Announcement = require("../models/Announcement")
const Payment = require("../models/Payment")
const Job = require("../models/Job")
const { authenticateToken, requireRole, optionalAuth } = require("../middleware/auth")
const upload = require("../middleware/upload")

const router = express.Router()

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and profile operations
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (alumni directory)
 *     tags: [Users]
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
 *         description: Number of users per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for users
 *       - in: query
 *         name: graduationYear
 *         schema:
 *           type: integer
 *         description: Filter by graduation year
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location
 *       - in: query
 *         name: profession
 *         schema:
 *           type: string
 *         description: Filter by profession
 *     responses:
 *       200:
 *         description: List of users with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
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
 */

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
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
 * /api/users/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               profile:
 *                 type: object
 *                 properties:
 *                   profession:
 *                     type: string
 *                   company:
 *                     type: string
 *                   bio:
 *                     type: string
 *                   location:
 *                     type: object
 *                     properties:
 *                       city:
 *                         type: string
 *                       country:
 *                         type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
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
 *       404:
 *         description: User not found
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
 * /api/users/summary:
 *   get:
 *     summary: Get user statistics summary
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics summary
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalUsers:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: integer
 *                     changeFromLastMonth:
 *                       type: number
 *                 activeUsers:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: integer
 *                     changeFromLastMonth:
 *                       type: number
 *                 admins:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: integer
 *                     changeFromLastMonth:
 *                       type: number
 *                 newThisMonth:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: integer
 *                     changeFromLastMonth:
 *                       type: number
 *       401:
 *         description: Unauthorized
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
 * /api/users/privacy:
 *   put:
 *     summary: Update privacy settings
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               emailNotifications:
 *                 type: boolean
 *               pushNotifications:
 *                 type: boolean
 *               privacy:
 *                 type: object
 *                 properties:
 *                   showEmail:
 *                     type: boolean
 *                   showPhone:
 *                     type: boolean
 *                   showLocation:
 *                     type: boolean
 *     responses:
 *       200:
 *         description: Privacy settings updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 preferences:
 *                   type: object
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
 *       404:
 *         description: User not found
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
 * /api/users/password:
 *   put:
 *     summary: Change password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: Current password
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *                 description: New password
 *     responses:
 *       200:
 *         description: Password updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Validation error or incorrect current password
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
 *         description: User not found
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
 * /api/users/account:
 *   delete:
 *     summary: Delete user account
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 description: User password for confirmation
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Validation error or incorrect password
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
 *         description: User not found
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
 * /api/users/filters/graduation-years:
 *   get:
 *     summary: Get available graduation years for filtering
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of graduation years
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: number
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/users/filters/locations:
 *   get:
 *     summary: Get available locations for filtering
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of locations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

// Get user statistics summary
router.get("/summary", authenticateToken, requireRole(["alumni", "admin"]), async (req, res) => {
  try {
    const now = new Date()
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    // Calculate current statistics
    const totalUsers = await User.countDocuments({})
    const activeUsers = await User.countDocuments({ isActive: true })
    const admins = await User.countDocuments({ role: 'admin' })
    const newThisMonth = await User.countDocuments({
      createdAt: { $gte: startOfThisMonth }
    })

    // Calculate last month statistics for comparison
    const totalUsersLastMonth = await User.countDocuments({
      createdAt: { $lt: startOfThisMonth }
    })
    const activeUsersLastMonth = await User.countDocuments({
      isActive: true,
      createdAt: { $lt: startOfThisMonth }
    })
    const adminsLastMonth = await User.countDocuments({
      role: 'admin',
      createdAt: { $lt: startOfThisMonth }
    })
    const newLastMonth = await User.countDocuments({
      createdAt: {
        $gte: startOfLastMonth,
        $lte: endOfLastMonth
      }
    })

    // Calculate percentage changes
    const calculatePercentageChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0
      return Number(((current - previous) / previous * 100).toFixed(1))
    }

    const totalUsersChange = calculatePercentageChange(totalUsers, totalUsersLastMonth)
    const activeUsersChange = calculatePercentageChange(activeUsers, activeUsersLastMonth)
    const adminsChange = calculatePercentageChange(admins, adminsLastMonth)
    const newThisMonthChange = calculatePercentageChange(newThisMonth, newLastMonth)

    res.json({
      totalUsers: {
        count: totalUsers,
        changeFromLastMonth: totalUsersChange
      },
      activeUsers: {
        count: activeUsers,
        changeFromLastMonth: activeUsersChange
      },
      admins: {
        count: admins,
        changeFromLastMonth: adminsChange
      },
      newThisMonth: {
        count: newThisMonth,
        changeFromLastMonth: newThisMonthChange
      }
    })
  } catch (error) {
    console.error("Get user summary error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get all users (alumni directory)
router.get(
  "/",
  optionalAuth,
  [
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
    query("search").optional().isString().withMessage("Search must be a string"),
    query("graduationYear").optional().isInt().withMessage("Graduation year must be an integer"),
    query("location").optional().isString().withMessage("Location must be a string"),
    query("profession").optional().isString().withMessage("Profession must be a string"),
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

      // Build search query
      const searchQuery = { isActive: true }

      if (req.query.search) {
        searchQuery.$text = { $search: req.query.search }
      }

      if (req.query.graduationYear) {
        searchQuery["profile.graduationYear"] = Number.parseInt(req.query.graduationYear)
      }

      if (req.query.location) {
        searchQuery["profile.location.city"] = new RegExp(req.query.location, "i")
      }

      if (req.query.profession) {
        searchQuery["profile.profession"] = new RegExp(req.query.profession, "i")
      }

      // Get users
      const users = await User.find(searchQuery)
        .select("firstName lastName email phone profile createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)

      // Filter based on privacy settings
      const filteredUsers = users.map((user) => {
        const userObj = user.toObject()

        // Hide sensitive info based on privacy settings
        if (!user.preferences?.privacy?.showEmail) {
          delete userObj.email
        }
        if (!user.preferences?.privacy?.showPhone) {
          delete userObj.phone
        }
        if (!user.preferences?.privacy?.showLocation) {
          if (userObj.profile?.location) {
            delete userObj.profile.location
          }
        }

        return userObj
      })

      const total = await User.countDocuments(searchQuery)

      res.json({
        users: filteredUsers,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      })
    } catch (error) {
      console.error("Get users error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// ============== ADMIN USER MANAGEMENT ROUTES ==============
// These routes are for admin-only user management operations
// IMPORTANT: These must come BEFORE the /:id route to avoid conflicts

/**
 * @swagger
 * /api/users/admin:
 *   get:
 *     summary: Get all users (Admin view with detailed information)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */

// Enhanced admin user management - Get all users with advanced filtering
router.get(
  "/admin",
  authenticateToken,
  requireRole(["admin"]),
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("role").optional().isIn(["alumni", "admin", "moderator"]),
    query("status").optional().isIn(["active", "inactive"]),
    query("search").optional().isString(),
    query("graduationYear").optional().isInt(),
    query("sortBy").optional().isIn(["name", "email", "role", "createdAt", "lastLogin"]),
    query("sortOrder").optional().isIn(["asc", "desc"]),
    query("verified").optional().isBoolean(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const page = Number.parseInt(req.query.page) || 1
      const limit = Number.parseInt(req.query.limit) || 50
      const skip = (page - 1) * limit
      const sortBy = req.query.sortBy || "createdAt"
      const sortOrder = req.query.sortOrder || "desc"

      const filter = {}

      // Apply filters
      if (req.query.role) {
        filter.role = req.query.role
      }

      if (req.query.status === "active") {
        filter.isActive = true
      } else if (req.query.status === "inactive") {
        filter.isActive = false
      }

      if (req.query.graduationYear) {
        filter["profile.graduationYear"] = Number.parseInt(req.query.graduationYear)
      }

      if (req.query.verified === "true") {
        filter["verification.isEmailVerified"] = true
        filter["verification.isPhoneVerified"] = true
      } else if (req.query.verified === "false") {
        filter.$or = [
          { "verification.isEmailVerified": false },
          { "verification.isPhoneVerified": false }
        ]
      }

      // Text search
      if (req.query.search) {
        const searchRegex = new RegExp(req.query.search, 'i')
        filter.$or = [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { email: searchRegex },
          { phone: searchRegex }
        ]
      }

      // Build sort object
      const sort = {}
      if (sortBy === "name") {
        sort.firstName = sortOrder === "asc" ? 1 : -1
      } else {
        sort[sortBy] = sortOrder === "asc" ? 1 : -1
      }

      const users = await User.find(filter)
        .select("firstName lastName email phone role isActive profile verification lastLogin createdAt updatedAt")
        .sort(sort)
        .skip(skip)
        .limit(limit)

      const total = await User.countDocuments(filter)

      res.json({
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
        filters: {
          role: req.query.role,
          status: req.query.status,
          search: req.query.search,
          graduationYear: req.query.graduationYear,
          verified: req.query.verified,
          sortBy,
          sortOrder
        }
      })
    } catch (error) {
      console.error("Get users error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Get user by ID
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("firstName lastName email phone profile createdAt")

    if (!user || !user.isActive) {
      return res.status(404).json({ message: "User not found" })
    }

    const userObj = user.toObject()

    // Filter based on privacy settings
    if (!user.preferences?.privacy?.showEmail) {
      delete userObj.email
    }
    if (!user.preferences?.privacy?.showPhone) {
      delete userObj.phone
    }
    if (!user.preferences?.privacy?.showLocation) {
      if (userObj.profile?.location) {
        delete userObj.profile.location
      }
    }

    res.json(userObj)
  } catch (error) {
    console.error("Get user error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update user profile
router.put(
  "/profile",
  authenticateToken,
  requireRole(["alumni"]),
  [
    body("firstName").optional().trim().notEmpty().withMessage("First name cannot be empty"),
    body("lastName").optional().trim().notEmpty().withMessage("Last name cannot be empty"),
    body("profile.profession").optional().isString().withMessage("Profession must be a string"),
    body("profile.company").optional().isString().withMessage("Company must be a string"),
    body("profile.bio").optional().isString().withMessage("Bio must be a string"),
    body("profile.location.city").optional().isString().withMessage("City must be a string"),
    body("profile.location.country").optional().isString().withMessage("Country must be a string"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const updates = req.body
      const user = await User.findById(req.user._id)

      if (!user) {
        return res.status(404).json({ message: "User not found" })
      }

      // Update user fields
      Object.keys(updates).forEach((key) => {
        if (key === "profile") {
          Object.keys(updates.profile).forEach((profileKey) => {
            if (updates.profile[profileKey] !== undefined) {
              user.profile[profileKey] = updates.profile[profileKey]
            }
          })
        } else if (updates[key] !== undefined) {
          user[key] = updates[key]
        }
      })

      // If profilePicture is provided, set both user.photo and user.profile.profilePicture
      if (updates.profilePicture) {
        user.photo = updates.profilePicture;
        user.profile.profilePicture = updates.profilePicture;
      }

      await user.save()

      res.json({
        message: "Profile updated successfully",
        user: user.toJSON(),
      })
    } catch (error) {
      console.error("Update profile error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

/**
 * @swagger
 * /api/users/me/photo:
 *   post:
 *     summary: Upload profile photo
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Profile photo file (JPG, PNG, max 5MB)
 *     responses:
 *       200:
 *         description: Profile photo uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 profilePhoto:
 *                   type: string
 *                   description: URL of uploaded profile photo
 *       400:
 *         description: No file uploaded or invalid file
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
// Upload profile photo
router.post(
  "/me/photo",
  authenticateToken,
  requireRole(["alumni"]),
  upload.single("photo"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No photo uploaded" })
      }

      // Validate file type
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"]
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ message: "Invalid file type. Only JPG and PNG files are allowed" })
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (req.file.size > maxSize) {
        return res.status(400).json({ message: "File size too large. Maximum size is 5MB" })
      }

      // Upload to Cloudinary
      const cloudinary = require("cloudinary").v2
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      })

      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: "image",
            folder: "alumni-profiles",
            public_id: `profile_${req.user._id}_${Date.now()}`,
            transformation: [
              { width: 400, height: 400, crop: "fill", gravity: "face" },
              { quality: "auto" },
            ],
          },
          (error, result) => {
            if (error) reject(error)
            else resolve(result)
          }
        ).end(req.file.buffer)
      })

      // Update user profile with photo URL
      const user = await User.findById(req.user._id)
      if (!user) {
        return res.status(404).json({ message: "User not found" })
      }

      user.profile.profilePhoto = result.secure_url
      await user.save()

      res.json({
        message: "Profile photo uploaded successfully",
        profilePhoto: result.secure_url,
      })
    } catch (error) {
      console.error("Upload profile photo error:", error)
      res.status(500).json({ message: "Failed to upload profile photo" })
    }
  }
)

// Update privacy settings
router.put(
  "/privacy",
  authenticateToken,
  requireRole(["alumni"]),
  [
    body("emailNotifications").optional().isBoolean(),
    
    body("pushNotifications").optional().isBoolean(),
    body("privacy.showEmail").optional().isBoolean(),
    body("privacy.showPhone").optional().isBoolean(),
    body("privacy.showLocation").optional().isBoolean(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const user = await User.findById(req.user._id)
      if (!user) {
        return res.status(404).json({ message: "User not found" })
      }

      // Update preferences
      const { emailNotifications, pushNotifications, privacy } = req.body

      if (emailNotifications !== undefined) {
        user.preferences.emailNotifications = emailNotifications
      }

      if (pushNotifications !== undefined) {
        user.preferences.pushNotifications = pushNotifications
      }
      if (privacy) {
        Object.keys(privacy).forEach((key) => {
          if (privacy[key] !== undefined) {
            user.preferences.privacy[key] = privacy[key]
          }
        })
      }

      await user.save()

      res.json({
        message: "Privacy settings updated successfully",
        preferences: user.preferences,
      })
    } catch (error) {
      console.error("Update privacy error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Change password
router.put(
  "/password",
  authenticateToken,
  requireRole(["alumni"]),
  [
    body("currentPassword").notEmpty().withMessage("Current password is required"),
    body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { currentPassword, newPassword } = req.body
      const user = await User.findById(req.user._id)

      if (!user) {
        return res.status(404).json({ message: "User not found" })
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword)
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ message: "Current password is incorrect" })
      }

      // Update password
      user.password = newPassword
      await user.save()

      res.json({ message: "Password updated successfully" })
    } catch (error) {
      console.error("Change password error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Delete account
router.delete(
  "/account",
  authenticateToken,
  requireRole(["alumni"]),
  [body("password").notEmpty().withMessage("Password is required for account deletion")],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { password } = req.body
      const user = await User.findById(req.user._id)

      if (!user) {
        return res.status(404).json({ message: "User not found" })
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password)
      if (!isPasswordValid) {
        return res.status(400).json({ message: "Incorrect password" })
      }

      // Soft delete - deactivate account
      user.isActive = false
      user.email = `deleted_${Date.now()}_${user.email}`
      user.phone = `deleted_${Date.now()}_${user.phone}`
      await user.save()

      res.json({ message: "Account deleted successfully" })
    } catch (error) {
      console.error("Delete account error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Get graduation years for filtering
router.get("/filters/graduation-years", async (req, res) => {
  try {
    const years = await User.distinct("profile.graduationYear", { isActive: true })
    res.json(years.sort((a, b) => b - a))
  } catch (error) {
    console.error("Get graduation years error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get locations for filtering
router.get("/filters/locations", async (req, res) => {
  try {
    const locations = await User.distinct("profile.location.city", {
      isActive: true,
      "profile.location.city": { $exists: true, $ne: null },
    })
    res.json(locations.sort())
  } catch (error) {
    console.error("Get locations error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

/**
 * @swagger
 * /api/users/admin:
 *   post:
 *     summary: Create new user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - phone
 *               - password
 *               - role
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 6
 *               role:
 *                 type: string
 *                 enum: [alumni, admin, moderator]
 *               profile:
 *                 type: object
 *                 properties:
 *                   graduationYear:
 *                     type: integer
 *                     minimum: 1950
 *                   degree:
 *                     type: string
 *                   major:
 *                     type: string
 *                   profession:
 *                     type: string
 *                   company:
 *                     type: string
 *                   bio:
 *                     type: string
 *                   location:
 *                     type: object
 *                     properties:
 *                       city:
 *                         type: string
 *                       country:
 *                         type: string
 *                   socialLinks:
 *                     type: object
 *                     properties:
 *                       linkedin:
 *                         type: string
 *                       twitter:
 *                         type: string
 *                       facebook:
 *                         type: string
 *                       website:
 *                         type: string
 *                   skills:
 *                     type: array
 *                     items:
 *                       type: string
 *                   interests:
 *                     type: array
 *                     items:
 *                       type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     email:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     role:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *                     profile:
 *                       type: object
 *                     preferences:
 *                       type: object
 *                     verification:
 *                       type: object
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Validation error or user already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Server error
 */

// Admin create user
router.post("/admin", authenticateToken, requireRole(["admin"]), [
  body("firstName").trim().notEmpty().withMessage("First name is required"),
  body("lastName").trim().notEmpty().withMessage("Last name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("phone").isMobilePhone().withMessage("Valid phone number is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("role").isIn(["alumni", "admin", "moderator"]).withMessage("Invalid role"),
  
  // Profile validations (optional but with proper validation when provided)
  body("profile.graduationYear").optional().isInt({ min: 1950, max: new Date().getFullYear() + 10 }).withMessage("Valid graduation year required"),
  body("profile.degree").optional().isString().withMessage("Degree must be a string"),
  body("profile.major").optional().isString().withMessage("Major must be a string"),
  body("profile.profession").optional().isString().withMessage("Profession must be a string"),
  body("profile.company").optional().isString().withMessage("Company must be a string"),
  body("profile.bio").optional().isString().withMessage("Bio must be a string"),
  body("profile.location.city").optional().isString().withMessage("City must be a string"),
  body("profile.location.country").optional().isString().withMessage("Country must be a string"),
  body("profile.socialLinks.linkedin").optional().isString().withMessage("LinkedIn URL must be a string"),
  body("profile.socialLinks.twitter").optional().isString().withMessage("Twitter URL must be a string"),
  body("profile.socialLinks.facebook").optional().isString().withMessage("Facebook URL must be a string"),
  body("profile.socialLinks.website").optional().isString().withMessage("Website URL must be a string"),
  body("profile.skills").optional().isArray().withMessage("Skills must be an array"),
  body("profile.skills.*").optional().isString().withMessage("Each skill must be a string"),
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { firstName, lastName, email, phone, password, role, profile } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    })

    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email or phone" })
    }

    // Prepare profile data with defaults
    const profileData = {
      graduationYear: profile?.graduationYear || undefined, // Let MongoDB handle undefined for optional fields
      degree: profile?.degree || "",
      major: profile?.major || "",
      profession: profile?.profession || "",
      company: profile?.company || "",
      bio: profile?.bio || "",
      location: {
        city: profile?.location?.city || "",
        country: profile?.location?.country || ""
      },
      socialLinks: {
        linkedin: profile?.socialLinks?.linkedin || "",
        twitter: profile?.socialLinks?.twitter || "",
        facebook: profile?.socialLinks?.facebook || "",
        website: profile?.socialLinks?.website || ""
      },
      skills: profile?.skills || [],
      interests: profile?.interests || []
    }

    // Create new user
    const user = new User({
      firstName,
      lastName,
      email,
      phone,
      password,
      role,
      profile: profileData,
      verification: {
        isEmailVerified: true, // Admin created users are pre-verified
        isPhoneVerified: true,
      },
      preferences: {
        emailNotifications: true,

        pushNotifications: true,
        privacy: {
          showEmail: true,
          showPhone: true,
          showLocation: true
        }
      }
    })

    await user.save()

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        profile: user.profile,
        preferences: user.preferences,
        verification: user.verification,
        createdAt: user.createdAt
      }
    })
  } catch (error) {
    console.error("Admin create user error:", error)
    
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
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0]
      return res.status(400).json({ 
        message: `User with this ${field} already exists` 
      })
    }
    
    res.status(500).json({ message: "Server error" })
  }
})

/**
 * @swagger
 * /api/users/admin/{id}:
 *   get:
 *     summary: Get detailed user information (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Detailed user information
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Server error
 */

// Get detailed user by ID (Admin only)
router.get("/admin/:id", authenticateToken, requireRole(["admin"]), async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password") // Exclude password but include all other fields
      .populate("profile")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Get additional admin-relevant information
    const userEvents = await Event.countDocuments({ 
      $or: [
        { organizer: user._id },
        { "attendees.user": user._id }
      ]
    })

    const userPayments = await Payment.countDocuments({ user: user._id })
    const userAnnouncements = await Announcement.countDocuments({ author: user._id })
    const userJobs = await Job.countDocuments({ postedBy: user._id })

    res.json({
      user: {
        ...user.toObject(),
        adminStats: {
          eventsCount: userEvents,
          paymentsCount: userPayments,
          announcementsCount: userAnnouncements,
          jobsCount: userJobs
        }
      }
    })
  } catch (error) {
    console.error("Get user by ID error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

/**
 * @swagger
 * /api/users/admin/{id}:
 *   put:
 *     summary: Update user information (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [alumni, admin, moderator]
 *               isActive:
 *                 type: boolean
 *               profile:
 *                 type: object
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Server error
 */

// Admin edit user
router.put("/admin/:id", authenticateToken, requireRole(["admin"]), [
  body("firstName").optional().trim().notEmpty().withMessage("First name cannot be empty"),
  body("lastName").optional().trim().notEmpty().withMessage("Last name cannot be empty"),
  body("email").optional().isEmail().withMessage("Valid email is required"),
  body("phone").optional().isMobilePhone().withMessage("Valid phone number is required"),
  body("role").optional().isIn(["alumni", "admin", "moderator"]).withMessage("Invalid role"),
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Check if email/phone already exists (excluding current user)
    if (req.body.email || req.body.phone) {
      const existingUser = await User.findOne({
        _id: { $ne: req.params.id },
        $or: [
          ...(req.body.email ? [{ email: req.body.email }] : []),
          ...(req.body.phone ? [{ phone: req.body.phone }] : [])
        ],
      })

      if (existingUser) {
        return res.status(400).json({ message: "Email or phone already exists" })
      }
    }

    // Update user fields
    const updates = req.body
    Object.keys(updates).forEach((key) => {
      if (key === "profile" && updates.profile) {
        Object.keys(updates.profile).forEach((profileKey) => {
          if (updates.profile[profileKey] !== undefined) {
            user.profile[profileKey] = updates.profile[profileKey]
          }
        })
      } else if (updates[key] !== undefined) {
        user[key] = updates[key]
      }
    })

    await user.save()

    res.json({
      message: "User updated successfully",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        profile: user.profile,
        updatedAt: user.updatedAt
      }
    })
  } catch (error) {
    console.error("Admin edit user error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

/**
 * @swagger
 * /api/users/admin/{id}:
 *   delete:
 *     summary: Delete user permanently (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       400:
 *         description: Cannot delete own account
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Server error
 */

// Admin delete user (hard delete)
router.delete("/admin/:id", authenticateToken, requireRole(["admin"]), async (req, res) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot delete your own account" })
    }

    // Hard delete - completely remove from database
    await User.findByIdAndDelete(req.params.id)

    res.json({
      message: "User deleted successfully",
      deletedUser: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    })
  } catch (error) {
    console.error("Admin delete user error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

/**
 * @swagger
 * /api/users/admin/{id}/role:
 *   put:
 *     summary: Update user role (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [alumni, admin, moderator]
 *     responses:
 *       200:
 *         description: User role updated successfully
 *       400:
 *         description: Invalid role
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Server error
 */

// Update user role
router.put("/admin/:id/role", authenticateToken, requireRole(["admin"]), async (req, res) => {
  try {
    const { role } = req.body

    if (!["alumni", "admin", "moderator"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" })
    }

    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    user.role = role
    await user.save()

    res.json({
      message: "User role updated successfully",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Update user role error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

/**
 * @swagger
 * /api/users/admin/{id}/status:
 *   put:
 *     summary: Activate/deactivate user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isActive
 *             properties:
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User status updated successfully
 *       400:
 *         description: Invalid status value
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Server error
 */

// Deactivate/activate user
router.put("/admin/:id/status", authenticateToken, requireRole(["admin"]), async (req, res) => {
  try {
    const { isActive } = req.body

    if (typeof isActive !== "boolean") {
      return res.status(400).json({ message: "isActive must be a boolean" })
    }

    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    user.isActive = isActive
    await user.save()

    res.json({
      message: `User ${isActive ? "activated" : "deactivated"} successfully`,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isActive: user.isActive,
      },
    })
  } catch (error) {
    console.error("Update user status error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

/**
 * @swagger
 * /api/users/admin/bulk:
 *   post:
 *     summary: Bulk operations on users (Admin only)
 *     tags: [Users]
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
 *               - userIds
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [activate, deactivate, delete, changeRole]
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               newRole:
 *                 type: string
 *                 enum: [alumni, admin, moderator]
 *                 description: Required when action is changeRole
 *     responses:
 *       200:
 *         description: Bulk operation completed successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Server error
 */

// Bulk operations on users
router.post("/admin/bulk", authenticateToken, requireRole(["admin"]), [
  body("action").isIn(["activate", "deactivate", "delete", "changeRole"]).withMessage("Invalid action"),
  body("userIds").isArray({ min: 1 }).withMessage("User IDs array is required"),
  body("userIds.*").isMongoId().withMessage("Invalid user ID format"),
  body("newRole").optional().isIn(["alumni", "admin", "moderator"]).withMessage("Invalid role")
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { action, userIds, newRole } = req.body

    // Prevent admin from performing bulk operations on themselves
    if (userIds.includes(req.user._id.toString())) {
      return res.status(400).json({ message: "Cannot perform bulk operations on your own account" })
    }

    let result = {}

    switch (action) {
      case "activate":
        result = await User.updateMany(
          { _id: { $in: userIds } },
          { isActive: true }
        )
        break

      case "deactivate":
        result = await User.updateMany(
          { _id: { $in: userIds } },
          { isActive: false }
        )
        break

      case "delete":
        result = await User.deleteMany({ _id: { $in: userIds } })
        break

      case "changeRole":
        if (!newRole) {
          return res.status(400).json({ message: "New role is required for changeRole action" })
        }
        result = await User.updateMany(
          { _id: { $in: userIds } },
          { role: newRole }
        )
        break
    }

    res.json({
      message: `Bulk ${action} operation completed successfully`,
      modifiedCount: result.modifiedCount || result.deletedCount,
      requestedCount: userIds.length
    })
  } catch (error) {
    console.error("Bulk operation error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

/**
 * @swagger
 * /api/users/admin/export:
 *   get:
 *     summary: Export users data (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [csv, json]
 *           default: csv
 *         description: Export format
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [alumni, admin, moderator]
 *         description: Filter by role
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Users data exported successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Server error
 */

// Export users data
router.get("/admin/export", authenticateToken, requireRole(["admin"]), async (req, res) => {
  try {
    const { format = "csv", role, status } = req.query

    const filter = {}
    if (role) filter.role = role
    if (status === "active") filter.isActive = true
    else if (status === "inactive") filter.isActive = false

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })

    if (format === "json") {
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Content-Disposition', `attachment; filename="users-export-${Date.now()}.json"`)
      return res.json(users)
    }

    // CSV export
    const csvData = convertToCSV(users.map(user => ({
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      graduationYear: user.profile?.graduationYear || '',
      degree: user.profile?.degree || '',
      major: user.profile?.major || '',
      profession: user.profile?.profession || '',
      company: user.profile?.company || '',
      location: user.profile?.location ? `${user.profile.location.city}, ${user.profile.location.country}` : '',
      createdAt: user.createdAt,
      lastLogin: user.lastLogin || 'Never'
    })))

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="users-export-${Date.now()}.csv"`)
    res.send(csvData)
  } catch (error) {
    console.error("Export users error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

/**
 * @swagger
 * /api/users/admin/statistics:
 *   get:
 *     summary: Get user statistics (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Server error
 */

// Get user statistics
router.get("/admin/statistics", authenticateToken, requireRole(["admin"]), async (req, res) => {
  try {
    const now = new Date()
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    // Helper function to calculate percentage change
    const calculatePercentageChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0
      return Math.round(((current - previous) / previous) * 100)
    }

    // Total users
    const totalUsers = await User.countDocuments({ isActive: true })
    const totalUsersLastMonth = await User.countDocuments({
      isActive: true,
      createdAt: { $lt: currentMonth }
    })
    const newUsersThisMonth = totalUsers - totalUsersLastMonth

    const newUsersLastMonth = await User.countDocuments({
      isActive: true,
      createdAt: { $gte: lastMonth, $lt: currentMonth }
    })

    // Users by role
    const usersByRole = await User.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$role", count: { $sum: 1 } } }
    ])

    // Users by graduation year
    const usersByGradYear = await User.aggregate([
      { $match: { isActive: true, "profile.graduationYear": { $exists: true } } },
      { $group: { _id: "$profile.graduationYear", count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
      { $limit: 10 }
    ])

    // Active vs inactive users
    const activeUsers = await User.countDocuments({ isActive: true })
    const inactiveUsers = await User.countDocuments({ isActive: false })

    // Recently registered users
    const recentUsers = await User.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("firstName lastName email role createdAt")

    // User engagement stats
    const usersWithRecentLogin = await User.countDocuments({
      isActive: true,
      lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    })

    res.json({
      totalUsers: {
        value: totalUsers,
        change: calculatePercentageChange(newUsersThisMonth, newUsersLastMonth),
        label: "Total Active Users"
      },
      newUsersThisMonth: {
        value: newUsersThisMonth,
        change: calculatePercentageChange(newUsersThisMonth, newUsersLastMonth),
        label: "New Users This Month"
      },
      usersByRole: usersByRole.reduce((acc, item) => {
        acc[item._id] = item.count
        return acc
      }, {}),
      usersByGradYear: usersByGradYear,
      activeVsInactive: {
        active: activeUsers,
        inactive: inactiveUsers,
        total: activeUsers + inactiveUsers
      },
      engagement: {
        usersWithRecentLogin,
        percentage: Math.round((usersWithRecentLogin / totalUsers) * 100)
      },
      recentUsers
    })
  } catch (error) {
    console.error("User statistics error:", error)
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

// ============== END ADMIN USER MANAGEMENT ROUTES ==============

// ============== ALUMNI USER PROFILE ROUTES ==============
// These routes are for alumni to manage their own profiles

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (alumni directory)
 *     tags: [Users]
 */

module.exports = router
