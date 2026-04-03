import { Router } from "express";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import {
  createCustomerBooking,
  getCustomerBookings,
  getCustomerDashboard,
  getCustomerServices,
  verifyCustomerBookingOtp,
} from "../controllers/customerController.js";

export const customerRoutes = Router();

customerRoutes.use(authenticate, authorize("customer"));
customerRoutes.get("/dashboard", getCustomerDashboard);
customerRoutes.get("/services", getCustomerServices);
customerRoutes.post("/bookings", createCustomerBooking);
customerRoutes.get("/bookings", getCustomerBookings);
customerRoutes.patch("/bookings/:bookingId/verify-otp", verifyCustomerBookingOtp);
