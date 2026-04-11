import cors from "cors";
import express from "express";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { env } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

export const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dynamic URL replacement for localhost images
const replaceLocalhost = (url) => {
  if (!url) return url;
  if (typeof url !== 'string') return url;
  
  // Only replace if it's localhost
  if (url.includes('localhost:5000')) {
    return url.replace('http://localhost:5000', 'https://event-mitra-backend.vercel.app');
  }
  return url;
};

// Attach helper to app for use in routes
app.locals.replaceLocalhost = replaceLocalhost;

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan("dev"));

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

const authRoutes = (await import("./routes/authRoutes.js")).authRoutes;
const adminRoutes = (await import("./routes/adminRoutes.js")).adminRoutes;
const providerRoutes = (await import("./routes/providerRoutes.js")).providerRoutes;
const customerRoutes = (await import("./routes/customerRoutes.js")).customerRoutes;
const publicRoutes = (await import("./routes/publicRoutes.js")).publicRoutes;

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/provider", providerRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/public", publicRoutes);

app.use(notFound);
app.use(errorHandler);