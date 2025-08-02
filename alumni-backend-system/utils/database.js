const mongoose = require('mongoose');

let cachedConnection = null;

async function connectToDatabase() {
  if (cachedConnection) {
    return cachedConnection;
  }

  // Get MongoDB URI - add your actual MongoDB Atlas URI here for testing
  const mongoUri = process.env.MONGODB_URI || "mongodb+srv://user:user@cluster0.i6rkc5n.mongodb.net/alumni-network?retryWrites=true&w=majority&";
  
  console.log('Attempting to connect to MongoDB...');
  console.log('MongoDB URI length:', mongoUri.length);
  console.log('MongoDB URI starts with:', mongoUri.substring(0, 20) + '...');

  try {
    const connection = await mongoose.connect(mongoUri, {
      // Serverless-optimized settings
      maxPoolSize: 1,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      // Remove bufferMaxEntries as it's not supported
      retryWrites: true,
      w: 'majority',
    });

    cachedConnection = connection;
    console.log('Connected to MongoDB');
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

module.exports = { connectToDatabase }; 