const dns = require('dns');
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoMemoryServer;

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState >= 1) {
      return mongoose.connection;
    }

    const uri = process.env.MONGO_URI;

    try {
      const conn = await mongoose.connect(uri || 'mongodb://127.0.0.1:27017/realestate');
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      console.warn('⚠️ Primary MongoDB connection failed, starting in-memory MongoDB for local development.');
      mongoMemoryServer = await MongoMemoryServer.create();
      const memoryUri = mongoMemoryServer.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`✅ In-memory MongoDB Connected: ${conn.connection.host}`);
      return conn;
    }
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

process.on('SIGINT', async () => {
  try {
    if (mongoose.connection.readyState) {
      await mongoose.disconnect();
    }
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
    }
  } finally {
    process.exit(0);
  }
});

module.exports = connectDB;
