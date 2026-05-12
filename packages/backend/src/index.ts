import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./db.js";
import { clerkClient, clerkMiddleware, getAuth } from "@clerk/express";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);

app.use(express.json());
app.use(clerkMiddleware());

// Clerk Protected Route
app.get("/api/me", async (req: express.Request, res: express.Response) => {
  try {
    const auth = getAuth(req);

    // console.log("--- CLI Verification Request ---");
    // console.log(
    //   "Headers:",
    //   req.headers.authorization ? "Bearer [EXISTS]" : "MISSING",
    // );
    // console.log("Auth details:", JSON.stringify(auth, null, 2));

    if (!auth.userId) {
      console.log("❌ No userId found in auth");
      return res.status(401).json({ error: "Unauthorized - No session found" });
    }

    console.log("✅ Verified user ID:", auth.userId);

    // Fetch full user details from Clerk using the userId
    console.log("📡 Fetching full user profile from Clerk...");
    const user = await clerkClient.users.getUser(auth.userId);
    console.log(
      "👤 User profile fetched successfully:",
      user.primaryEmailAddress?.emailAddress,
    );

    res.json({
      id: user.id,
      name: user.fullName || user.username || "User",
      email: user.primaryEmailAddress?.emailAddress || "no-email@clerk.com",
    });
  } catch (error: any) {
    console.error("❌ Error in /api/me:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, async () => {
  await connectDB();
  console.log(`Backend server running on http://localhost:${port}`);
});
