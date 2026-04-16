import { Booking } from "../../models/Booking.js";
import { Payment } from "../../models/Payment.js";
import { User } from "../../models/User.js";
import { AppError } from "../../utils/appError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { groupPaymentsByBookingId } from "../../utils/bookingPayments.js";
import {
  BOOKING_ASSIGNABLE_STATUSES,
  BOOKING_STATUS,
  assertBookingStatus,
} from "../../utils/bookingLifecycle.js";
import { toPaise, upsertPaymentRecord } from "../../utils/paymentLifecycle.js";
import { calculateRefundDetails } from "../../utils/refundPolicy.js";
import { createRazorpayRefund } from "../../utils/razorpay.js";

const adminBookingPopulate = [
  {
    path: "service",
    select: "name category startingPrice image",
    populate: {
      path: "category",
      select: "name slug",
    },
  },
  {
    path: "services",
    select: "name category startingPrice image",
    populate: {
      path: "category",
      select: "name slug",
    },
  },
  { path: "customer", select: "name email" },
  { path: "provider", select: "name email businessName providerStatus" },
  { path: "cancellation.cancelledBy", select: "name email role" },
];

export const getBookings = asyncHandler(async (req, res) => {
  const { status, startDate, endDate, providerId, customerId } = req.query;

  const query = {};

  if (status) {
    query.status = status;
  }

  if (providerId) {
    query.provider = providerId;
  }

  if (customerId) {
    query.customer = customerId;
  }

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) {
      query.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      query.createdAt.$lte = new Date(endDate);
    }
  }

  const bookings = await Booking.find({
    ...query,
    paymentStatus: { $ne: "advance_pending" }
  })
    .populate(adminBookingPopulate)
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: bookings,
  });
});

export const getCancelledBookings = asyncHandler(async (req, res) => {
  const { startDate, endDate, providerId, customerId } = req.query;

  const query = { status: BOOKING_STATUS.CANCELLED };

  if (providerId) {
    query.provider = providerId;
  }

  if (customerId) {
    query.customer = customerId;
  }

  if (startDate || endDate) {
    query["cancellation.cancelledAt"] = {};
    if (startDate) {
      query["cancellation.cancelledAt"].$gte = new Date(startDate);
    }
    if (endDate) {
      query["cancellation.cancelledAt"].$lte = new Date(endDate);
    }
  }

  const bookings = await Booking.find(query)
    .populate(adminBookingPopulate)
    .sort({ "cancellation.cancelledAt": -1 });

  const totalRefunds = bookings.reduce((sum, booking) => sum + (booking.cancellation?.refundAmount || 0), 0);

  res.json({
    success: true,
    data: {
      bookings,
      summary: {
        totalCancelled: bookings.length,
        totalRefunds,
      },
    },
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

  await Payment.deleteMany({
    booking: booking._id,
    status: { $in: ["pending", "created"] },
  });

  await booking.save();

  const populatedBooking = await booking.populate(adminBookingPopulate);

  res.json({
    success: true,
    message: "Provider assigned successfully.",
    data: populatedBooking,
  });
});

export const cancelBooking = asyncHandler(async (req, res) => {
  const { cancelReason } = req.body;

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

  const refundDetails = calculateRefundDetails({
    totalAmount: booking.totalAmount,
    advancePaid: booking.advancePaid,
    eventDate: booking.eventDate,
    eventTime: booking.eventTime,
  });

  const paymentSummary = await groupPaymentsByBookingId([booking._id]);
  const advancePayment = paymentSummary.get(String(booking._id))?.advance || null;

  if (
    refundDetails.refundAmount > 0 &&
    advancePayment?.razorpay_payment_id &&
    advancePayment.status === "paid"
  ) {
    const refund = await createRazorpayRefund({
      paymentId: advancePayment.razorpay_payment_id,
      amountInPaise: toPaise(refundDetails.refundAmount),
      notes: {
        bookingId: String(booking._id),
        cancelledBy: String(req.user._id),
      },
    });

    await upsertPaymentRecord({
      booking,
      paymentType: "refund",
      amount: refundDetails.refundAmount,
      status: "processed",
      method: "online",
      razorpay_payment_id: advancePayment.razorpay_payment_id,
      razorpay_refund_id: refund.id,
      metadata: { refund },
    });
  }

  booking.status = BOOKING_STATUS.CANCELLED;
  booking.cancellation = {
    cancelledAt: new Date(),
    cancelledBy: req.user._id,
    cancelReason: cancelReason?.trim() || "Cancelled by admin",
    refundAmount: refundDetails.refundAmount,
    refundStatus: refundDetails.refundAmount > 0 ? "completed" : "none",
    refundProcessedAt: refundDetails.refundAmount > 0 ? new Date() : undefined,
    cancellationPolicy: refundDetails.cancellationPolicy,
  };

  await booking.save();

  let message = "Booking cancelled successfully.";
  if (refundDetails.refundAmount > 0) {
    message += ` Refund of Rs. ${refundDetails.refundAmount} processed as per the cancellation policy.`;
  }

  res.json({
    success: true,
    message,
    data: booking,
  });
});
