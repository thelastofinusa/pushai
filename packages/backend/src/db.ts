import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/pushai";

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log("✅ Connected to MongoDB");
  } catch (error: any) {
    console.error("❌ Error connecting to MongoDB:", error.message);
    
    if (error.code === 'ESERVFAIL' || error.message.includes('queryTxt ESERVFAIL')) {
      console.log("\n📡 DNS Resolution Error Detected!");
      console.log("💡 Tip: This often happens with MongoDB Atlas on certain networks.");
      console.log("Try one of these fixes:");
      console.log("1. Change your machine's DNS to 8.8.8.8 (Google) or 1.1.1.1 (Cloudflare).");
      console.log("2. If you are on a VPN or public Wi-Fi, try a different connection.");
      console.log("3. Use a local MongoDB: MONGODB_URI=mongodb://127.0.0.1:27017/pushai");
    } else {
      console.log("💡 Tip: Make sure MongoDB is running or your Atlas credentials are correct.");
    }
    process.exit(1);
  }
};
