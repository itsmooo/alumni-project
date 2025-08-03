const mongoose = require('mongoose');

let cachedConnection = null;

async function connectToDatabase() {
  // For serverless environments, always create a new connection
  if (process.env.VERCEL && cachedConnection) {
    try {
      // Test if the connection is still alive
      await cachedConnection.connection.db.admin().ping();
      return cachedConnection;
    } catch (error) {
      console.log('Cached connection is dead, creating new connection...');
      cachedConnection = null;
    }
  }

  // Get MongoDB URI
  const mongoUri = process.env.MONGODB_URI || "mongodb+srv://user:user@cluster0.i6rkc5n.mongodb.net/alumni-network?retryWrites=true&w=majority&";
  
  console.log('Attempting to connect to MongoDB...');
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Is Vercel:', !!process.env.VERCEL);

  try {
    const connection = await mongoose.connect(mongoUri, {
      // Serverless-optimized settings for Vercel
      maxPoolSize: 1,
      minPoolSize: 0,
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      bufferMaxEntries: 0,
      retryWrites: true,
      w: 'majority',
      // Additional settings for better reliability
      connectTimeoutMS: 15000,
      heartbeatFrequencyMS: 10000,
      maxIdleTimeMS: 30000,
      // Disable auto-index creation in production
      autoIndex: process.env.NODE_ENV !== 'production',
    });

    cachedConnection = connection;
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

module.exports = { connectToDatabase }; 