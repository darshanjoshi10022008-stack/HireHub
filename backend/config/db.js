const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URL, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB Connected: ${connection.connection.host}`);
  } catch (error) {
    console.error("\n=======================================================");
    console.error(" [HIREHUB DATABASE NOTICE] MongoDB Atlas Connection Issue");
    console.error(` Error: ${error.message}`);
    console.error(" Action Required: Whitelist your current IP address in MongoDB Atlas:");
    console.error(" 1. Go to https://cloud.mongodb.com");
    console.error(" 2. Navigate to 'Network Access' -> 'Add IP Address'");
    console.error(" 3. Choose 'Add Current IP Address' (or 0.0.0.0/0 for development)");
    console.error("=======================================================\n");
  }
};

module.exports = connectDB;