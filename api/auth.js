import express from "express";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const { authRoutes } = await import("../backend/src/routes/authRoutes.js");
app.use("/", authRoutes);

export default app;