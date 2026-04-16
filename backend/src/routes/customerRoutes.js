import { Router } from "express";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import {
  createCustomerBooking,
  getCustomerBookings,
  getCustomerDashboard,
  getCustomerServices,
  getAvailableSlots,
  cancelCustomerBooking,
  getRemainingPaymentQr,
  verifyAdvancePayment,
  verifyCustomerBookingOtp,
  verifyRemainingPayment,
} from "../controllers/customerController.js";

export const customerRoutes = Router();

customerRoutes.use(authenticate, authorize("customer"));
customerRoutes.get("/dashboard", getCustomerDashboard);
customerRoutes.get("/services", getCustomerServices);
customerRoutes.get("/available-slots", getAvailableSlots);
customerRoutes.post("/bookings", createCustomerBooking);
customerRoutes.get("/bookings", getCustomerBookings);
customerRoutes.post("/bookings/:bookingId/payments/advance/verify", verifyAdvancePayment);
customerRoutes.get("/bookings/:bookingId/payments/remaining", getRemainingPaymentQr);
customerRoutes.post("/bookings/:bookingId/payments/remaining/verify", verifyRemainingPayment);
customerRoutes.patch("/bookings/:bookingId/verify-otp", verifyCustomerBookingOtp);
customerRoutes.patch("/bookings/:bookingId/cancel", cancelCustomerBooking);
