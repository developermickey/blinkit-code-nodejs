const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

if (!process.env.MONGODB_URL) {
  throw new Error("MONGODB_URL is not defined in the environment variables.");
}

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("MongoDB Connected");
  } catch (error) {
    console.log("MongoDB Connection Error", error);
    process.exit(1);
  }
}

module.exports = connectDB;
