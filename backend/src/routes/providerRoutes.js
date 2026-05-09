import { Router } from "express";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import { portfolioUpload, serviceImageUpload, serviceMultipleImageUpload, serviceVideoUpload } from "../middleware/uploadMiddleware.js";
import {
  completeProviderJob,
  createProviderService,
  createProviderServiceCategory,
  deleteProviderService,
  getProviderBookings,
  getProviderDashboard,
  getProviderEarnings,
  getProviderProfile,
  getProviderRemainingPayment,
  getProviderServiceCategories,
  getProviderServices,
  regenerateCompletionOtp,
  respondToBooking,
  startProviderJob,
  updateProviderProfile,
  updateProviderService,
  uploadMultipleServiceImages,
  uploadPortfolio,
  uploadServiceImage,
  uploadServiceVideos,
  verifyBookingOtp,
  verifyCompletionOtp,
  verifyProviderRemainingPayment,
} from "../controllers/providerController.js";

export const providerRoutes = Router();

providerRoutes.use(authenticate, authorize("serviceProvider"));
providerRoutes.get("/dashboard", getProviderDashboard);
providerRoutes.get("/service-categories", getProviderServiceCategories);
providerRoutes.post("/service-categories", createProviderServiceCategory);
providerRoutes.get("/services", getProviderServices);
providerRoutes.post("/services", createProviderService);
providerRoutes.post("/service-categories", createProviderServiceCategory);
providerRoutes.put("/services/:serviceId", updateProviderService);
providerRoutes.delete("/services/:serviceId", deleteProviderService);
providerRoutes.post("/services/upload", serviceImageUpload.single("image"), uploadServiceImage);
providerRoutes.post("/services/upload-images", serviceMultipleImageUpload.array("images", 15), uploadMultipleServiceImages);
providerRoutes.post("/services/upload-videos", serviceVideoUpload.array("videos", 5), uploadServiceVideos);
providerRoutes.get("/profile", getProviderProfile);
providerRoutes.put("/profile", updateProviderProfile);
providerRoutes.post("/profile/portfolio", portfolioUpload.array("files", 6), uploadPortfolio);
providerRoutes.get("/bookings", getProviderBookings);
providerRoutes.get("/bookings/:bookingId/remaining-payment", getProviderRemainingPayment);
providerRoutes.post("/bookings/:bookingId/payments/remaining/verify", verifyProviderRemainingPayment);
providerRoutes.patch("/bookings/:bookingId/respond", respondToBooking);
providerRoutes.patch("/bookings/:bookingId/start", startProviderJob);
providerRoutes.patch("/bookings/:bookingId/verify-start-otp", verifyBookingOtp);
providerRoutes.patch("/bookings/:bookingId/complete", completeProviderJob);
providerRoutes.patch("/bookings/:bookingId/verify-completion-otp", verifyCompletionOtp);
providerRoutes.patch("/bookings/:bookingId/regenerate-completion-otp", regenerateCompletionOtp);
providerRoutes.get("/earnings", getProviderEarnings);
