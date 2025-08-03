const { ensureConnection } = require('../utils/database');

/**
 * Middleware to ensure database connection is ready
 * This is especially important for serverless environments like Vercel
 */
async function ensureDatabaseConnection(req, res, next) {
  try {
    await ensureConnection();
    next();
  } catch (error) {
    console.error('Database connection error in middleware:', error);
    res.status(500).json({ 
      message: 'Database connection failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}

module.exports = { ensureDatabaseConnection }; 