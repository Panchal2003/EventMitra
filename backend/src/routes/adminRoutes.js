import { Router } from "express";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import { bookingRoutes } from "./admin/bookingRoutes.js";
import { customerRoutes } from "./admin/customerRoutes.js";
import { dashboardRoutes } from "./admin/dashboardRoutes.js";
import { paymentRoutes } from "./admin/paymentRoutes.js";
import { providerRoutes } from "./admin/providerRoutes.js";
import { serviceRoutes } from "./admin/serviceRoutes.js";
import { galleryRoutes } from "./admin/galleryRoutes.js";

export const adminRoutes = Router();

adminRoutes.use(authenticate, authorize("admin"));
adminRoutes.use("/dashboard", dashboardRoutes);
adminRoutes.use("/services", serviceRoutes);
adminRoutes.use("/providers", providerRoutes);
adminRoutes.use("/customers", customerRoutes);
adminRoutes.use("/bookings", bookingRoutes);
adminRoutes.use("/payments", paymentRoutes);
adminRoutes.use("/gallery", galleryRoutes);

