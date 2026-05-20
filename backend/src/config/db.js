const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  
  if (process.env.NODE_ENV === "development" && (!uri || uri.includes("127.0.0.1"))) {
    // Use in-memory MongoDB for development
    mongoServer = await MongoMemoryServer.create();
    const inMemoryUri = mongoServer.getUri();
    // eslint-disable-next-line no-console
    console.log("Using in-memory MongoDB at:", inMemoryUri);
    await mongoose.connect(inMemoryUri);
  } else {
    if (!uri) {
      throw new Error("MONGO_URI is not configured");
    }
    await mongoose.connect(uri);
    // eslint-disable-next-line no-console
    console.log("MongoDB connected successfully");
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
};

module.exports = { connectDB, disconnectDB };
