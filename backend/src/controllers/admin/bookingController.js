import { Booking } from "../../models/Booking.js";
import { Payment } from "../../models/Payment.js";
import { User } from "../../models/User.js";
import { AppError } from "../../utils/appError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  BOOKING_ASSIGNABLE_STATUSES,
  BOOKING_STATUS,
  assertBookingStatus,
} from "../../utils/bookingLifecycle.js";

export const getBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find()
    .populate({
      path: "service",
      select: "name category startingPrice image",
      populate: {
        path: "category",
        select: "name slug",
      },
    })
    .populate({
      path: "services",
      select: "name category startingPrice image",
      populate: {
        path: "category",
        select: "name slug",
      },
    })
    .populate("customer", "name email")
    .populate("provider", "name email businessName providerStatus")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: bookings,
  });
});

export const assignProvider = asyncHandler(async (req, res) => {
  const { providerId } = req.body;

  const provider = await User.findOne({
    _id: providerId,
    role: "serviceProvider",
    providerStatus: "approved",
  });

  if (!provider) {
    throw new AppError("Approved provider not found.", 404);
  }

  const booking = await Booking.findById(req.params.bookingId);
  if (!booking) {
    throw new AppError("Booking not found.", 404);
  }

  assertBookingStatus(
    booking,
    BOOKING_ASSIGNABLE_STATUSES,
    "Providers can only be assigned before work starts or after a provider rejects."
  );

  booking.provider = provider._id;
  booking.status = BOOKING_STATUS.PROVIDER_ASSIGNED;
  booking.providerAssignedAt = new Date();
  booking.providerRespondedAt = undefined;
  booking.startedAt = undefined;
  booking.providerCompletedAt = undefined;
  booking.completedAt = undefined;
  booking.bookingOtp = undefined;
  booking.completionOtp = {
    code: undefined,
    isVerified: false,
    verifiedAt: undefined,
  };

  await Payment.deleteOne({
    booking: booking._id,
    status: "pending",
  });

  await booking.save();

  const populatedBooking = await booking.populate([
    {
      path: "service",
      select: "name category startingPrice image",
      populate: {
        path: "category",
        select: "name slug",
      },
    },
    { path: "customer", select: "name email" },
    { path: "provider", select: "name email businessName providerStatus" },
  ]);

  res.json({
    success: true,
    message: "Provider assigned successfully.",
    data: populatedBooking,
  });
});

export const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.bookingId);

  if (!booking) {
    throw new AppError("Booking not found.", 404);
  }

  if (booking.status === BOOKING_STATUS.COMPLETED) {
    throw new AppError("Completed bookings cannot be cancelled.", 400);
  }

  if (booking.status === BOOKING_STATUS.CANCELLED) {
    throw new AppError("This booking is already cancelled.", 400);
  }

  booking.status = BOOKING_STATUS.CANCELLED;
  await booking.save();

  res.json({
    success: true,
    message: "Booking cancelled successfully.",
    data: booking,
  });
});
