import { Router } from "express";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import {
  createCustomerBooking,
  getCustomerBookings,
  getCustomerDashboard,
  getCustomerServices,
  verifyCustomerBookingOtp,
  getAvailableSlots,
  cancelCustomerBooking,
} from "../controllers/customerController.js";

export const customerRoutes = Router();

customerRoutes.use(authenticate, authorize("customer"));
customerRoutes.get("/dashboard", getCustomerDashboard);
customerRoutes.get("/services", getCustomerServices);
customerRoutes.get("/available-slots", getAvailableSlots);
customerRoutes.post("/bookings", createCustomerBooking);
customerRoutes.get("/bookings", getCustomerBookings);
customerRoutes.patch("/bookings/:bookingId/verify-otp", verifyCustomerBookingOtp);
customerRoutes.patch("/bookings/:bookingId/cancel", cancelCustomerBooking);
