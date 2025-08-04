const express = require("express")
const jwt = require("jsonwebtoken")
const { body, validationResult } = require("express-validator")
const User = require("../models/User")
const { authenticateToken } = require("../middleware/auth")
const { sendEmail } = require("../services/notificationService")
const crypto = require("crypto")
const mongoose = require("mongoose")

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and account management
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
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
 *               - graduationYear
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: User's first name
 *               lastName:
 *                 type: string
 *                 description: User's last name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               phone:
 *                 type: string
 *                 description: User's phone number
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: User's password
 *               graduationYear:
 *                 type: number
 *                 description: Year of graduation
 *               degree:
 *                 type: string
 *                 description: Degree obtained
 *               major:
 *                 type: string
 *                 description: Major field of study
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error or user already exists
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
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identifier
 *               - password
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: Email or phone number
 *               password:
 *                 type: string
 *                 description: User's password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid credentials or account deactivated
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
 * /api/auth/verify-email:
 *   get:
 *     summary: Verify email via GET request (for email links)
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Email verification token
 *     responses:
 *       200:
 *         description: HTML page showing verification success
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *       400:
 *         description: HTML page showing verification failure
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *   post:
 *     summary: Verify user email
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: Email verification token
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Invalid or expired token
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
 * /api/auth/verify-phone:
 *   post:
 *     summary: Verify user phone number
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *                 description: 6-digit verification code
 *                 minLength: 6
 *                 maxLength: 6
 *     responses:
 *       200:
 *         description: Phone verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Invalid or expired code
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
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identifier
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: Email or phone number
 *     responses:
 *       200:
 *         description: Password reset instructions sent
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
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
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password using token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *                 description: Password reset token
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: New password
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Invalid or expired token
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
 * /api/auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
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
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh JWT token
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: New JWT token
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

const router = express.Router()

// Register
router.post(
  "/register",
  [
    body("firstName").trim().notEmpty().withMessage("First name is required"),
    body("lastName").trim().notEmpty().withMessage("Last name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("phone").isMobilePhone().withMessage("Valid phone number is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("graduationYear")
      .isInt({ min: 1950, max: new Date().getFullYear() + 10 })
      .withMessage("Valid graduation year is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { firstName, lastName, email, phone, password, graduationYear, degree, major } = req.body

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { phone }],
      })

      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email or phone" })
      }

      // Create new user
      const user = new User({
        firstName,
        lastName,
        email,
        phone,
        password,
        profile: {
          graduationYear,
          degree,
          major,
        },
      })

      // Generate verification tokens
      const emailToken = crypto.randomBytes(32).toString("hex")
      const phoneCode = Math.floor(100000 + Math.random() * 900000).toString()

      user.verification.emailVerificationToken = emailToken
      user.verification.phoneVerificationCode = phoneCode
      user.verification.verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

      await user.save()

      // Send verification email
      await sendEmail({
        to: email,
        subject: "Verify Your Alumni Network Account",
        html: `
        <h2>Welcome to Alumni Network!</h2>
        <p>Please verify your email by clicking the link below:</p>
        <a href="http://localhost:5000/api/auth/verify-email?token=${emailToken}">Verify Email</a>
        <p>This link expires in 24 hours.</p>
      `,
      })

      // Generate JWT token
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" })

      res.status(201).json({
        message: "User registered successfully. Please verify your email and phone.",
        token,
        user: user.toJSON(),
      })
    } catch (error) {
      console.error("Registration error:", error)
      res.status(500).json({ message: "Server error during registration" })
    }
  },
)

// Login
router.post(
  "/login",
  [
    body("identifier").notEmpty().withMessage("Email or phone is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { identifier, password } = req.body

      // Find user by email or phone
      const user = await User.findOne({
        $or: [{ email: identifier }, { phone: identifier }],
      })

      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" })
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password)
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" })
      }

      // Check if account is active
      if (!user.isActive) {
        return res.status(401).json({ message: "Account is deactivated" })
      }

      // Update last login
      user.lastLogin = new Date()
      await user.save()

      // Generate JWT token
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" })

      res.json({
        message: "Login successful",
        token,
        user: user.toJSON(),
      })
    } catch (error) {
      console.error("Login error:", error)
      res.status(500).json({ message: "Server error during login" })
    }
  },
)

// Verify email via GET request (for email links)
router.get("/verify-email", async (req, res) => {
  try {
    const { token } = req.query

    if (!token) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Email Verification</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .error { color: #dc3545; }
          </style>
        </head>
        <body>
          <h1 class="error">Verification Failed</h1>
          <p>No verification token provided.</p>
        </body>
        </html>
      `)
    }

    const user = await User.findOne({
      "verification.emailVerificationToken": token,
      "verification.verificationExpires": { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Email Verification</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .error { color: #dc3545; }
          </style>
        </head>
        <body>
          <h1 class="error">Verification Failed</h1>
          <p>Invalid or expired verification token.</p>
          <p>Please request a new verification email.</p>
        </body>
        </html>
      `)
    }

    user.verification.isEmailVerified = true
    user.verification.emailVerificationToken = undefined
    await user.save()

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Email Verification</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          .success { color: #28a745; }
          .card { max-width: 500px; margin: 0 auto; padding: 30px; border: 1px solid #ddd; border-radius: 10px; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1 class="success">✅ Email Verified Successfully!</h1>
          <p>Welcome to Alumni Network, ${user.firstName}!</p>
          <p>Your email has been verified successfully. You can now access all features of your account.</p>
          <hr>
          <p><strong>Next Steps:</strong></p>
          <ul style="text-align: left;">
            <li>Complete your profile</li>
            <li>Connect with fellow alumni</li>
            <li>Explore upcoming events</li>
          </ul>
          <p style="margin-top: 30px;">
            <a href="http://localhost:5000/api-docs" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              Explore API Documentation
            </a>
          </p>
        </div>
      </body>
      </html>
    `)
  } catch (error) {
    console.error("Email verification error:", error)
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Email Verification</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          .error { color: #dc3545; }
        </style>
      </head>
      <body>
        <h1 class="error">Server Error</h1>
        <p>Something went wrong during email verification.</p>
      </body>
      </html>
    `)
  }
})

// Verify email via POST request (existing endpoint)
router.post(
  "/verify-email",
  [body("token").notEmpty().withMessage("Verification token is required")],
  async (req, res) => {
    try {
      const { token } = req.body

      const user = await User.findOne({
        "verification.emailVerificationToken": token,
        "verification.verificationExpires": { $gt: Date.now() },
      })

      if (!user) {
        return res.status(400).json({ message: "Invalid or expired verification token" })
      }

      user.verification.isEmailVerified = true
      user.verification.emailVerificationToken = undefined
      await user.save()

      res.json({ message: "Email verified successfully" })
    } catch (error) {
      console.error("Email verification error:", error)
      res.status(500).json({ message: "Server error during email verification" })
    }
  },
)

// Verify phone
router.post(
  "/verify-phone",
  [body("code").isLength({ min: 6, max: 6 }).withMessage("Valid 6-digit code is required")],
  authenticateToken,
  async (req, res) => {
    try {
      const { code } = req.body
      const user = req.user

      if (user.verification.phoneVerificationCode !== code) {
        return res.status(400).json({ message: "Invalid verification code" })
      }

      if (user.verification.verificationExpires < Date.now()) {
        return res.status(400).json({ message: "Verification code expired" })
      }

      user.verification.isPhoneVerified = true
      user.verification.phoneVerificationCode = undefined
      await user.save()

      res.json({ message: "Phone verified successfully" })
    } catch (error) {
      console.error("Phone verification error:", error)
      res.status(500).json({ message: "Server error during phone verification" })
    }
  },
)

// Forgot password
router.post(
  "/forgot-password",
  [body("identifier").notEmpty().withMessage("Email or phone is required")],
  async (req, res) => {
    try {
      const { identifier } = req.body

      const user = await User.findOne({
        $or: [{ email: identifier }, { phone: identifier }],
      })

      if (!user) {
        return res.status(404).json({ message: "User not found" })
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString("hex")
      user.resetPassword.token = resetToken
      user.resetPassword.expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
      await user.save()

      // Send reset link via email
      const resetUrl = `http://localhost:5000/api/auth/reset-password-page?token=${resetToken}`

      await sendEmail({
        to: user.email,
        subject: "Password Reset Request",
        html: `
        <h2>Password Reset</h2>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
      })

              res.json({ message: "Password reset instructions sent to your email" })
    } catch (error) {
      console.error("Forgot password error:", error)
      res.status(500).json({ message: "Server error during password reset request" })
    }
  },
)

/**
 * @swagger
 * /api/auth/reset-password-page:
 *   get:
 *     summary: Password reset page (for email links)
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Password reset token
 *     responses:
 *       200:
 *         description: HTML form for password reset
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *       400:
 *         description: HTML page showing reset failure
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 */
// Password reset page (GET endpoint for email links)
router.get("/reset-password-page", async (req, res) => {
  try {
    const { token } = req.query

    if (!token) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Password Reset</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .error { color: #dc3545; }
          </style>
        </head>
        <body>
          <h1 class="error">Reset Failed</h1>
          <p>No reset token provided.</p>
        </body>
        </html>
      `)
    }

    // Verify token exists and hasn't expired
    const user = await User.findOne({
      "resetPassword.token": token,
      "resetPassword.expires": { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Password Reset</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .error { color: #dc3545; }
          </style>
        </head>
        <body>
          <h1 class="error">Reset Failed</h1>
          <p>Invalid or expired reset token.</p>
          <p>Please request a new password reset.</p>
        </body>
        </html>
      `)
    }

    // Display password reset form
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Reset Password</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 50px; }
          .container { max-width: 400px; margin: 0 auto; }
          .form-group { margin-bottom: 15px; }
          label { display: block; margin-bottom: 5px; font-weight: bold; }
          input[type="password"] { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
          button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; width: 100%; }
          button:hover { background: #0056b3; }
          .success { color: #28a745; }
          .error { color: #dc3545; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Reset Your Password</h1>
          <p>Hello ${user.firstName}, please enter your new password below:</p>
          
          <form id="resetForm">
            <div class="form-group">
              <label for="password">New Password:</label>
              <input type="password" id="password" name="password" required minlength="6">
            </div>
            <div class="form-group">
              <label for="confirmPassword">Confirm Password:</label>
              <input type="password" id="confirmPassword" name="confirmPassword" required minlength="6">
            </div>
            <button type="submit">Reset Password</button>
          </form>
          
          <div id="message"></div>
        </div>

        <script>
          document.getElementById('resetForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const messageDiv = document.getElementById('message');
            
            if (password !== confirmPassword) {
              messageDiv.innerHTML = '<p class="error">Passwords do not match!</p>';
              return;
            }
            
            if (password.length < 6) {
              messageDiv.innerHTML = '<p class="error">Password must be at least 6 characters!</p>';
              return;
            }
            
            try {
              const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  token: '${token}',
                  password: password
                })
              });
              
              const data = await response.json();
              
              if (response.ok) {
                messageDiv.innerHTML = '<p class="success">✅ ' + data.message + '</p>';
                document.getElementById('resetForm').style.display = 'none';
              } else {
                messageDiv.innerHTML = '<p class="error">❌ ' + data.message + '</p>';
              }
            } catch (error) {
              messageDiv.innerHTML = '<p class="error">❌ Network error. Please try again.</p>';
            }
          });
        </script>
      </body>
      </html>
    `)
  } catch (error) {
    console.error("Password reset page error:", error)
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Password Reset</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          .error { color: #dc3545; }
        </style>
      </head>
      <body>
        <h1 class="error">Server Error</h1>
        <p>Something went wrong. Please try again later.</p>
      </body>
      </html>
    `)
  }
})

// Reset password
router.post(
  "/reset-password",
  [
    body("token").notEmpty().withMessage("Reset token is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  async (req, res) => {
    try {
      const { token, password } = req.body

      const user = await User.findOne({
        "resetPassword.token": token,
        "resetPassword.expires": { $gt: Date.now() },
      })

      if (!user) {
        return res.status(400).json({ message: "Invalid or expired reset token" })
      }

      user.password = password
      user.resetPassword.token = undefined
      user.resetPassword.expires = undefined
      await user.save()

      res.json({ message: "Password reset successfully" })
    } catch (error) {
      console.error("Reset password error:", error)
      res.status(500).json({ message: "Server error during password reset" })
    }
  },
)

// Get current user
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password")
    res.json(user)
  } catch (error) {
    console.error("Get user error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Refresh token
router.post("/refresh", authenticateToken, async (req, res) => {
  try {
    const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, { expiresIn: "7d" })

    res.json({ token })
  } catch (error) {
    console.error("Token refresh error:", error)
    res.status(500).json({ message: "Server error during token refresh" })
  }
})

// Test endpoint to check environment variables
router.get("/test-env", (req, res) => {
  res.json({
    hasMongoUri: !!process.env.MONGODB_URI,
    hasJwtSecret: !!process.env.JWT_SECRET,
    nodeEnv: process.env.NODE_ENV,
    mongoUriLength: process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 0
  });
});

module.exports = router
