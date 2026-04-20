import dotenv from "dotenv";

dotenv.config();

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI missing in .env ❌");
}

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.warn("⚠️  Razorpay credentials missing - payment features will not work!");
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
  adminCommissionPercent: Number(process.env.ADMIN_COMMISSION_PERCENT || 10),
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || "",
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || "",
  razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || "",
  razorpayAccountNumber: process.env.RAZORPAY_ACCOUNT_NUMBER || "",
  platformUpiId: process.env.PLATFORM_UPI_ID || "eventmitra312405.rzp@rxairtel",
  platformUpiName: process.env.PLATFORM_UPI_NAME || "EventMitra",
};
