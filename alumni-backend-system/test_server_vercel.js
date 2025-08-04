const express = require('express');
const rateLimit = require('express-rate-limit');

// Test Express app configuration
const app = express();

// Trust proxy for Vercel deployment
app.set('trust proxy', 1);

// Rate limiting with proper configuration for Vercel
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
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

// Test endpoint
app.get('/test', (req, res) => {
  res.json({
    message: 'Rate limiting test successful',
    ip: req.ip,
    forwardedFor: req.headers['x-forwarded-for'],
    userAgent: req.headers['user-agent'],
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
  });
});

console.log('=== VERCEL SERVER CONFIGURATION TEST ===');
console.log('✅ Trust proxy set to 1');
console.log('✅ Rate limiter configured with custom key generator');
console.log('✅ Health check endpoint available at /api/health');
console.log('✅ Test endpoint available at /test');
console.log('\nTo test locally:');
console.log('1. Start the server: node server.js');
console.log('2. Test health endpoint: curl http://localhost:5000/api/health');
console.log('3. Test rate limiting: curl http://localhost:5000/test');
console.log('\n=== TEST COMPLETE ==='); 