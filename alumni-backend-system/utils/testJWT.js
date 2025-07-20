const jwt = require('jsonwebtoken')
require('dotenv').config()

const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODViZDY0MmIyZmVjZDUyZTgyNTI0OGEiLCJpYXQiOjE3NTA4NjM0MjYsImV4cCI6MTc1MTQ2ODIyNn0.8W9gmzjUP4bSNMSughiaWPAkEAJCdfInq9wWzigklz0'

console.log('Testing JWT Token...')
console.log('Token:', testToken)
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET)

try {
  // Try to decode without verification first
  const decoded = jwt.decode(testToken)
  console.log('\n=== Decoded Token (unverified) ===')
  console.log('Payload:', decoded)
  console.log('User ID:', decoded.userId)
  console.log('Issued at:', new Date(decoded.iat * 1000))
  console.log('Expires at:', new Date(decoded.exp * 1000))
  console.log('Is expired?', Date.now() > decoded.exp * 1000)

  // Try to verify with JWT_SECRET
  if (process.env.JWT_SECRET) {
    const verified = jwt.verify(testToken, process.env.JWT_SECRET)
    console.log('\n=== Verified Token ===')
    console.log('Verification successful:', verified)
  } else {
    console.log('\n❌ JWT_SECRET not found in environment variables')
  }

} catch (error) {
  console.error('\n❌ Token verification failed:', error.message)
  if (error.name === 'TokenExpiredError') {
    console.log('Token has expired')
  } else if (error.name === 'JsonWebTokenError') {
    console.log('Invalid token format or signature')
  }
} 