import { Router } from "express";
import {
  assignProvider,
  cancelBooking,
  getBookings,
} from "../../controllers/admin/bookingController.js";

export const bookingRoutes = Router();

bookingRoutes.get("/", getBookings);
bookingRoutes.patch("/:bookingId/provider", assignProvider);
bookingRoutes.patch("/:bookingId/cancel", cancelBooking);

