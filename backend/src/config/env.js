import dotenv from "dotenv";

dotenv.config();

// ❗ important check
if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI missing in .env ❌");
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5000,
  mongodbUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET || "change-this-to-a-secure-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  adminName: process.env.ADMIN_NAME || "EventMitra Admin",
  adminEmail: process.env.ADMIN_EMAIL || "admin@eventmitra.com",
  adminPassword: process.env.ADMIN_PASSWORD || "Admin@123",
};