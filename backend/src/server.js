import { app } from "./app.js";
import { connectDatabase } from "./config/db.js";

let dbConnected = false;

export default async function handler(req, res) {
  try {
    if (!dbConnected) {
      await connectDatabase();
      dbConnected = true;
    }
    return app(req, res);
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
}