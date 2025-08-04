const mongoose = require('mongoose');

/**
 * Middleware to check database connection status
 * This is a lightweight check since connectDB handles the main connection
 */
async function ensureDatabaseConnection(req, res, next) {
  try {
    // Simple check if mongoose is connected
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database not connected');
    }
    next();
  } catch (error) {
    console.error('Database connection check failed:', error);
    res.status(500).json({ 
      message: 'Database connection failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}

module.exports = { ensureDatabaseConnection }; 