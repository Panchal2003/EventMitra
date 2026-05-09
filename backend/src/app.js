import cors from "cors";
import express from "express";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import passport from "./middleware/passport.js";
import { env } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

export const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan("dev"));

// Session configuration for Passport
app.use(
  session({
    secret: process.env.SESSION_SECRET || "eventmitra-session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

try {
  app.use("/uploads", express.static(path.resolve(__dirname, "../uploads")));
} catch (e) {
  console.warn("Static uploads not available:", e.message);
}

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "EventMitra API is running.",
  });
});

app.get("/api/test-razorpay", async (req, res) => {
  try {
    const { createRazorpayOrder, isRazorpayConfigured } = await import("./utils/razorpay.js");

    if (!isRazorpayConfigured()) {
      return res.status(503).json({
        success: false,
        message: "Razorpay is not configured",
      });
    }

    const testOrder = await createRazorpayOrder({
      amountInPaise: 100,
      receipt: "test_" + Date.now(),
      notes: { test: "true" },
    });

    res.json({
      success: true,
      message: "Razorpay is working!",
      orderId: testOrder.id,
    });
  } catch (error) {
    console.error("Razorpay test error:", error);
    res.status(500).json({
      success: false,
      message: "Razorpay test failed",
      error: error.message,
    });
  }
});

const authRoutes = (await import("./routes/authRoutes.js")).authRoutes;
const adminRoutes = (await import("./routes/adminRoutes.js")).adminRoutes;
const providerRoutes = (await import("./routes/providerRoutes.js")).providerRoutes;
const customerRoutes = (await import("./routes/customerRoutes.js")).customerRoutes;
const publicRoutes = (await import("./routes/publicRoutes.js")).publicRoutes;
const contactRoutes = (await import("./routes/contactRoutes.js")).default;

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/provider", providerRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/contact", contactRoutes);

app.use(notFound);
app.use(errorHandler);