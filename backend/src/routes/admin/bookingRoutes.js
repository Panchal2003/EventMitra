import { Router } from "express";
import {
  assignProvider,
  cancelBooking,
  getBookings,
  getCancelledBookings,
  releaseProviderPayment,
} from "../../controllers/admin/bookingController.js";

export const bookingRoutes = Router();

bookingRoutes.get("/", getBookings);
bookingRoutes.get("/cancelled", getCancelledBookings);
bookingRoutes.patch("/:bookingId/provider", assignProvider);
bookingRoutes.patch("/:bookingId/cancel", cancelBooking);
bookingRoutes.post("/:bookingId/release-payment", releaseProviderPayment);

