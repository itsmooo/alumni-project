const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const { swaggerSpec, swaggerUi } = require("./swagger");
const { connectDB } = require("./utils/connectDB");
require("dotenv").config();

// Import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const eventRoutes = require("./routes/events");
const announcementRoutes = require("./routes/announcements");
const paymentRoutes = require("./routes/payments");
const jobRoutes = require("./routes/jobs");
// const messageRoutes = require("./routes/messages")
const dashboardRoutes = require("./routes/dashboard");
const systemRoutes = require("./routes/system");
const uploadRoutes = require("./routes/upload");
const alumniRoutes = require("./routes/alumni");
const donationRoutes = require("./routes/donations");
const notificationRoutes = require("./routes/notifications");
const transactionRoutes = require("./routes/transactions");
const communicationRoutes = require("./routes/communications");
const emailRoutes = require("./routes/emails");

// Import middleware
const errorHandler = require("./middleware/errorHandler");
const { authenticateToken } = require("./middleware/auth");

const app = express();

// Trust proxy for Vercel deployment
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(compression());
app.use(morgan("combined"));

// Rate limiting with proper configuration for Vercel
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  // Trust the X-Forwarded-For header for Vercel
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  // Custom key generator to handle Vercel proxy
  keyGenerator: (req) => {
    // Use X-Forwarded-For header if available (Vercel proxy)
    return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
  },
  // Skip rate limiting for health checks and static assets
  skip: (req) => {
    return req.path === '/api/health' || 
           req.path.startsWith('/api-docs') || 
           req.path.startsWith('/static');
  },
});
app.use(limiter);

// CORS configuration
app.use(
  cors()
  //   {
  //   origin: process.env.FRONTEND_URL || "http://localhost:3000",
  //   credentials: true,
  // }
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Swagger Documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Alumni Network API Documentation",
  })
);

// Database connection
connectDB()
  .then(() => {
    console.log('Database connection established successfully');
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
    // Don't exit the process, let it continue and retry on requests
  });

// Routes (removed ensureDatabaseConnection middleware since connectDB handles it)
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/jobs", jobRoutes);
// app.use("/api/messages", messageRoutes)
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/system", systemRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/alumni", alumniRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/communications", communicationRoutes);
app.use("/api/emails", emailRoutes);

// Health check endpoint for Vercel
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    uptime: process.uptime(),
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Alumni Network API",
    version: "1.0.0",
    status: "running",
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;

// Start server in all environments
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Vercel: ${process.env.VERCEL ? 'Yes' : 'No'}`);
});

// Socket.io setup for real-time messaging (only in development)
if (process.env.NODE_ENV !== 'production') {
  const io = require("socket.io")(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  // Socket.io connection handling
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (token) {
      // Verify JWT token here
      next();
    } else {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-room", (roomId) => {
      socket.join(roomId);
    });

    socket.on("send-message", (data) => {
      socket.to(data.roomId).emit("receive-message", data);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
}

module.exports = app;
