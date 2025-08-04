const mongoose = require("mongoose");
const colors = require("colors");

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI or MONGO_URI environment variable is not set');
    }

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority',
      connectTimeoutMS: 10000,
      heartbeatFrequencyMS: 10000,
      maxIdleTimeMS: 30000,
      autoIndex: process.env.NODE_ENV !== 'production',
    });
    
    console.log(colors.yellow(`MongoDB is connected: ${mongoose.connection.host}`));
    console.log(colors.green(`Database: ${mongoose.connection.name}`));
    console.log(colors.blue(`Connection state: ${mongoose.connection.readyState}`));
    
  } catch (error) {
    console.log(colors.red("Error connecting to MongoDB:"), error.message);
    console.log(colors.red("Please check your MONGODB_URI in .env file"));
    process.exit(1);
  }
};

module.exports = { connectDB };