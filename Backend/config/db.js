const mongoose = require('mongoose');

/**
 * @description Initializes connection to MongoDB using the URI from environment variables
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
      socketTimeoutMS: 45000, // Increase socket timeout
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  }
  catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// Export database connection function
module.exports = connectDB;