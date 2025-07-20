const express = require("express")
const { query, validationResult } = require("express-validator")
const User = require("../models/User")
const { authenticateToken, optionalAuth } = require("../middleware/auth")

const router = express.Router()

/**
 * @swagger
 * tags:
 *   name: Alumni Directory
 *   description: Alumni directory and profile viewing
 */

/**
 * @swagger
 * /api/alumni:
 *   get:
 *     summary: List all alumni (alumni directory)
 *     tags: [Alumni Directory]
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
 *         description: Number of alumni per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for alumni name, profession, or company
 *       - in: query
 *         name: graduationYear
 *         schema:
 *           type: integer
 *         description: Filter by graduation year
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location (city or country)
 *       - in: query
 *         name: profession
 *         schema:
 *           type: string
 *         description: Filter by profession
 *       - in: query
 *         name: company
 *         schema:
 *           type: string
 *         description: Filter by company
 *     responses:
 *       200:
 *         description: List of alumni with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 alumni:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       firstName:
 *                         type: string
 *                       lastName:
 *                         type: string
 *                       email:
 *                         type: string
 *                       profile:
 *                         type: object
 *                         properties:
 *                           profession:
 *                             type: string
 *                           company:
 *                             type: string
 *                           bio:
 *                             type: string
 *                           location:
 *                             type: object
 *                             properties:
 *                               city:
 *                                 type: string
 *                               country:
 *                                 type: string
 *                           profilePhoto:
 *                             type: string
 *                       graduationYear:
 *                         type: number
 *                       createdAt:
 *                         type: string
 *                         format: date-time
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
 *       400:
 *         description: Validation error
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
  [
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
    query("graduationYear").optional().isInt({ min: 1900, max: new Date().getFullYear() }).withMessage("Invalid graduation year"),
  ],
  optionalAuth,
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Validation error", errors: errors.array() })
      }

      const page = parseInt(req.query.page) || 1
      const limit = parseInt(req.query.limit) || 20
      const skip = (page - 1) * limit

      // Build filter query
      const filter = { role: "alumni", isActive: true }
      
      if (req.query.search) {
        const searchRegex = new RegExp(req.query.search, "i")
        filter.$or = [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { "profile.profession": searchRegex },
          { "profile.company": searchRegex },
        ]
      }

      if (req.query.graduationYear) {
        filter.graduationYear = parseInt(req.query.graduationYear)
      }

      if (req.query.location) {
        const locationRegex = new RegExp(req.query.location, "i")
        filter.$or = filter.$or || []
        filter.$or.push(
          { "profile.location.city": locationRegex },
          { "profile.location.country": locationRegex }
        )
      }

      if (req.query.profession) {
        filter["profile.profession"] = new RegExp(req.query.profession, "i")
      }

      if (req.query.company) {
        filter["profile.company"] = new RegExp(req.query.company, "i")
      }

      // Get total count
      const totalItems = await User.countDocuments(filter)
      const totalPages = Math.ceil(totalItems / limit)

      // Get alumni with pagination
      const alumni = await User.find(filter)
        .select("firstName lastName email profile graduationYear createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()

      res.json({
        alumni,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      })
    } catch (error) {
      console.error("Alumni directory error:", error)
      res.status(500).json({ message: "Internal server error" })
    }
  }
)

/**
 * @swagger
 * /api/alumni/{id}:
 *   get:
 *     summary: View alumni profile by ID
 *     tags: [Alumni Directory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Alumni ID
 *     responses:
 *       200:
 *         description: Alumni profile details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 alumni:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     email:
 *                       type: string
 *                     profile:
 *                       type: object
 *                       properties:
 *                         profession:
 *                           type: string
 *                         company:
 *                           type: string
 *                         bio:
 *                           type: string
 *                         location:
 *                           type: object
 *                           properties:
 *                             city:
 *                               type: string
 *                             country:
 *                               type: string
 *                         profilePhoto:
 *                           type: string
 *                         socialLinks:
 *                           type: object
 *                           properties:
 *                             linkedin:
 *                               type: string
 *                             twitter:
 *                               type: string
 *                             website:
 *                               type: string
 *                     graduationYear:
 *                       type: number
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: Alumni not found
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
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const alumni = await User.findOne({
      _id: req.params.id,
      role: "alumni",
      isActive: true,
    })
      .select("firstName lastName email profile graduationYear createdAt")
      .lean()

    if (!alumni) {
      return res.status(404).json({ message: "Alumni not found" })
    }

    res.json({ alumni })
  } catch (error) {
    console.error("Get alumni profile error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})

module.exports = router 