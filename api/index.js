import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
  res.json({ success: true, message: "EventMitra API is running" });
});

app.use((err, req, res, next) => {
  console.error("API Error:", err);
  res.status(500).json({ success: false, message: err.message || "Internal Server Error" });
});

export default app;