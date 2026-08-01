const dns = require('dns');
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const mongoose = require('mongoose');

let dbConnection = null;

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState >= 1) {
      dbConnection = mongoose.connection;
      return dbConnection;
    }

    const candidates = [];
    if (process.env.MONGO_URI) {
      candidates.push(process.env.MONGO_URI);
    }
    candidates.push('mongodb://127.0.0.1:27017/realestate');

    let lastError;

    for (const uri of candidates) {
      try {
        const conn = await mongoose.connect(uri, {
          serverSelectionTimeoutMS: 12000,
          connectTimeoutMS: 12000,
          maxPoolSize: 10,
        });

        dbConnection = conn.connection;
        console.log(`✅ MongoDB Connected: ${dbConnection.host}`);
        return dbConnection;
      } catch (error) {
        lastError = error;
        console.warn(`⚠️ Could not connect to ${uri}: ${error.message}`);
      }
    }

    throw lastError || new Error('MongoDB connection failed');
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    throw error;
  }
};

const getDBConnection = () => dbConnection;

process.on('SIGINT', async () => {
  try {
    if (mongoose.connection.readyState) {
      await mongoose.disconnect();
    }
  } finally {
    process.exit(0);
  }
});

module.exports = connectDB;
module.exports.getDBConnection = getDBConnection;
