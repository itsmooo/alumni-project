const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const { swaggerSpec, swaggerUi } = require("./swagger");
const { connectToDatabase, ensureConnection } = require("./utils/database");
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
const { ensureDatabaseConnection } = require("./middleware/database");

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
  // Trust the X-Forwarded-For header
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
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
connectToDatabase()
  .then(() => console.log("Database connection established"))
  .catch((err) => console.error("Database connection failed:", err));

// Routes with database connection middleware for critical endpoints
app.use("/api/auth", ensureDatabaseConnection, authRoutes);
app.use("/api/users", ensureDatabaseConnection, userRoutes);
app.use("/api/events", ensureDatabaseConnection, eventRoutes);
app.use("/api/announcements", ensureDatabaseConnection, announcementRoutes);
app.use("/api/payments", ensureDatabaseConnection, paymentRoutes);
app.use("/api/jobs", ensureDatabaseConnection, jobRoutes);
// app.use("/api/messages", messageRoutes)
app.use("/api/dashboard", ensureDatabaseConnection, dashboardRoutes);
app.use("/api/system", ensureDatabaseConnection, systemRoutes);
app.use("/api/upload", ensureDatabaseConnection, uploadRoutes);
app.use("/api/alumni", ensureDatabaseConnection, alumniRoutes);
app.use("/api/donations", ensureDatabaseConnection, donationRoutes);
app.use("/api/notifications", ensureDatabaseConnection, notificationRoutes);
app.use("/api/transactions", ensureDatabaseConnection, transactionRoutes);
app.use("/api/communications", ensureDatabaseConnection, communicationRoutes);
app.use("/api/emails", ensureDatabaseConnection, emailRoutes);

// Health check endpoint
app.get("/api/health", async (req, res) => {
  try {
    // Test database connection
    await ensureConnection();
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    res.status(200).json({
      status: "OK",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbStatus,
      environment: process.env.NODE_ENV,
      isVercel: !!process.env.VERCEL,
    });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;

// Only start server if not in Vercel environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });

  // Socket.io setup for real-time messaging (only in development)
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
