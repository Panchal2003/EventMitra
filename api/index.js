import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const { authRoutes } = await import("../backend/src/routes/authRoutes.js");
const { adminRoutes } = await import("../backend/src/routes/adminRoutes.js");
const { providerRoutes } = await import("../backend/src/routes/providerRoutes.js");
const { customerRoutes } = await import("../backend/src/routes/customerRoutes.js");
const { publicRoutes } = await import("../backend/src/routes/publicRoutes.js");

app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/provider", providerRoutes);
app.use("/customer", customerRoutes);
app.use("/public", publicRoutes);

app.get("/health", (req, res) => {
  res.json({ success: true, message: "EventMitra API is running" });
});

export default app;