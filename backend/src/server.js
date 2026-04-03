import { app } from "./app.js";
import { connectDatabase } from "./config/db.js";

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  try {
    await connectDatabase();
    isConnected = true;
    console.log("Database connected");
  } catch (error) {
    console.error("Database connection error:", error);
  }
};

export default async function handler(req, res) {
  await connectDB();
  return app(req, res);
}