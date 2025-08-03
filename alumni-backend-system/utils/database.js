const mongoose = require('mongoose');

let cachedConnection = null;

// Helper function to ensure connection is ready
async function ensureConnection() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  
  if (mongoose.connection.readyState === 2) {
    // Connecting, wait a bit
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }
  }
  
  // Not connected, establish new connection
  return await connectToDatabase();
}

async function connectToDatabase() {
  // For Vercel serverless, disable connection caching completely
  if (process.env.VERCEL) {
    console.log('Vercel environment detected - using fresh connection');
    cachedConnection = null;
  }

  // Get MongoDB URI
  const mongoUri = process.env.MONGODB_URI || "mongodb+srv://user:user@cluster0.i6rkc5n.mongodb.net/alumni-network?retryWrites=true&w=majority&";
  
  console.log('Attempting to connect to MongoDB...');
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Is Vercel:', !!process.env.VERCEL);

  try {
    // For Vercel, use minimal connection settings
    const connectionOptions = process.env.VERCEL ? {
      // Ultra-minimal settings for serverless
      maxPoolSize: 1,
      minPoolSize: 0,
      serverSelectionTimeoutMS: 20000,
      socketTimeoutMS: 60000,
      bufferCommands: false,
      bufferMaxEntries: 0,
      retryWrites: true,
      w: 'majority',
      connectTimeoutMS: 20000,
      heartbeatFrequencyMS: 30000,
      maxIdleTimeMS: 60000,
      autoIndex: false,
      // Disable all buffering
      bufferCommands: false,
      bufferMaxEntries: 0,
      // Force immediate connection
      directConnection: true,
    } : {
      // Normal settings for non-serverless
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: true,
      retryWrites: true,
      w: 'majority',
      connectTimeoutMS: 10000,
      heartbeatFrequencyMS: 10000,
      maxIdleTimeMS: 30000,
      autoIndex: process.env.NODE_ENV !== 'production',
    };

    const connection = await mongoose.connect(mongoUri, connectionOptions);

    if (!process.env.VERCEL) {
      cachedConnection = connection;
    }
    
    console.log('Connected to MongoDB successfully');
    return connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Handle connection events
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
  cachedConnection = null;
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
  cachedConnection = null;
});

mongoose.connection.on('connected', () => {
  console.log('MongoDB connected');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
  } catch (err) {
    console.error('Error during MongoDB connection closure:', err);
    process.exit(1);
  }
});

module.exports = { connectToDatabase, ensureConnection }; 