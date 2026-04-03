import express from "express";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const { publicRoutes } = await import("../backend/src/routes/publicRoutes.js");
app.use("/", publicRoutes);

export default app;