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

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan("dev"));

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