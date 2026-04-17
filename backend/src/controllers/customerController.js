import { Booking } from "../models/Booking.js";
import { Service } from "../models/Service.js";
import { AppError } from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ensureRemainingPaymentOrder, groupPaymentsByBookingId } from "../utils/bookingPayments.js";
import { BOOKING_STATUS, assertBookingStatus } from "../utils/bookingLifecycle.js";
import { checkTimeOverlap, getAvailableTimeSlots } from "../utils/bookingValidation.js";
import { env } from "../config/env.js";
import {
  buildPaymentReceipt,
  calculateAdvanceAmount,
  calculateRemainingAmount,
  getBookingPaymentBreakdown,
  roundCurrency,
  syncBookingPaymentState,
  toPaise,
  upsertPaymentRecord,
  upsertProviderPayoutForBooking,
} from "../utils/paymentLifecycle.js";
import { calculateRefundDetails } from "../utils/refundPolicy.js";
import {
  createRazorpayOrder,
  createRazorpayRefund,
  verifyRazorpayPaymentSignature,
} from "../utils/razorpay.js";

const customerBookingPopulate = [
  {
    path: "service",
    select: "name description startingPrice image category allowsMembers pricePerMember",
    populate: {
      path: "category",
      select: "name slug",
    },
  },
  {
    path: "services",
    select: "name description startingPrice image category allowsMembers pricePerMember",
    populate: {
      path: "category",
      select: "name slug",
    },
  },
  { path: "customer", select: "name email phone" },
  { path: "provider", select: "name email businessName phone address upiId" },
  { path: "cancellation.cancelledBy", select: "name email role" },
];

const getBookingServices = (booking) =>
  booking?.services?.length ? booking.services : booking?.service ? [booking.service] : [];

const calculateBookingTotal = (services, guestCount) =>
  services.reduce((sum, service) => {
    if (service.allowsMembers && service.pricePerMember && guestCount) {
      const members = Number(guestCount);
      if (members <= 1) {
        return sum + (service.startingPrice || 0);
      }

      return sum + (service.startingPrice || 0) + service.pricePerMember * (members - 1);
    }

    return sum + (service.startingPrice || 0);
  }, 0);

const buildPaymentSummary = (booking, paymentSummary) => ({
  totalAmount: roundCurrency(booking.totalAmount || 0),
  advancePaid: roundCurrency(booking.advancePaid || 0),
  remainingAmount: roundCurrency(booking.remainingAmount || 0),
  paymentStatus: booking.paymentStatus,
  advancePayment: paymentSummary?.advance || null,
  remainingPayment: paymentSummary?.remaining || null,
  refundPayment: paymentSummary?.refund || null,
  payout: paymentSummary?.payout || null,
  remainingPaymentLink: booking.paymentMeta?.remainingPaymentLink || "",
});

const serializeBookingForCustomer = (booking, paymentSummary) => {
  const serialized = booking.toObject ? booking.toObject() : booking;

  if (
    serialized.status === BOOKING_STATUS.CONFIRMED &&
    serialized.bookingOtp?.code &&
    !serialized.bookingOtp?.isVerified
  ) {
    serialized.bookingOtp = serialized.bookingOtp.code;
  } else {
    delete serialized.bookingOtp;
  }

  if (
    serialized.status === BOOKING_STATUS.OTP_PENDING &&
    serialized.completionOtp?.code &&
    !serialized.completionOtp?.isVerified
  ) {
    serialized.completionOtpCode = serialized.completionOtp?.code || "";
  }

  serialized.payment = buildPaymentSummary(serialized, paymentSummary);

  return serialized;
};

const validateBookingRequest = async ({ serviceIds, eventDate, eventTime, guestCount }) => {
  const serviceIdArray = Array.isArray(serviceIds)
    ? [...new Set(serviceIds.filter(Boolean))]
    : [serviceIds].filter(Boolean);

  if (!serviceIdArray.length) {
    throw new AppError("Please select at least one service to book.", 400);
  }

  const services = await Service.find({
    _id: { $in: serviceIdArray },
    status: "active",
  }).populate("category", "name slug");

  if (services.length !== serviceIdArray.length) {
    throw new AppError("One or more selected services are not available for booking.", 404);
  }

  const providerId = services[0].createdBy;
  const allSameProvider = services.every(
    (service) => String(service.createdBy) === String(providerId)
  );

  if (!allSameProvider) {
    throw new AppError("Please select services from the same provider.", 400);
  }

  if (eventTime) {
    const overlapCheck = await checkTimeOverlap(
      providerId,
      eventDate,
      eventTime,
      null,
      serviceIdArray,
      null
    );

    if (overlapCheck.hasOverlap) {
      const availableSlots = await getAvailableTimeSlots(providerId, eventDate, 2, serviceIdArray);
      throw new AppError(
        `Time slot already booked for these services at ${eventTime}. Available slots: ${availableSlots
          .slice(0, 5)
          .join(", ")}${availableSlots.length > 5 ? "..." : ""}`,
        400
      );
    }
  }

  const totalAmount = calculateBookingTotal(services, guestCount);
  const breakdown = getBookingPaymentBreakdown(totalAmount);

  return {
    services,
    serviceIdArray,
    providerId,
    totalAmount,
    breakdown,
  };
};

const loadSerializedBookings = async (bookings) => {
  const paymentMap = await groupPaymentsByBookingId(bookings.map((booking) => booking._id));
  return bookings.map((booking) =>
    serializeBookingForCustomer(booking, paymentMap.get(String(booking._id)))
  );
};

export const getCustomerDashboard = asyncHandler(async (req, res) => {
  const customerId = req.user._id;

  const statusCounts = await Booking.aggregate([
    {
      $match: {
        customer: customerId,
        paymentStatus: { $ne: "advance_pending" }
      },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const countMap = statusCounts.reduce((accumulator, item) => {
    accumulator[item._id] = item.count;
    return accumulator;
  }, {});

  res.json({
    success: true,
    data: {
      totalBookings: statusCounts.reduce((sum, item) => sum + item.count, 0),
      pendingPayments: countMap[BOOKING_STATUS.PENDING] || 0,
      activeBookings:
        (countMap[BOOKING_STATUS.CONFIRMED] || 0) +
        (countMap[BOOKING_STATUS.IN_PROGRESS] || 0) +
        (countMap[BOOKING_STATUS.OTP_PENDING] || 0),
      otpPending: countMap[BOOKING_STATUS.OTP_PENDING] || 0,
      completedBookings: countMap[BOOKING_STATUS.COMPLETED] || 0,
      cancelledBookings: countMap[BOOKING_STATUS.CANCELLED] || 0,
    },
  });
});

export const getCustomerServices = asyncHandler(async (req, res) => {
  const services = await Service.find({ status: "active" })
    .populate("category", "name slug")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: services,
  });
});

export const createCustomerBooking = asyncHandler(async (req, res) => {
  const { serviceIds, eventDate, eventTime, location, guestCount, notes } = req.body;

  const { services, providerId, totalAmount, breakdown } = await validateBookingRequest({
    serviceIds,
    eventDate,
    eventTime,
    guestCount,
  });

  const booking = await Booking.create({
    service: services[0]._id,
    services: services.map((service) => service._id),
    customer: req.user._id,
    provider: providerId,
    eventDate,
    eventTime: eventTime || "",
    location,
    guestCount: Number(guestCount) || 1,
    totalAmount,
    advancePaid: 0,
    remainingAmount: breakdown.remainingAmount,
    paymentStatus: "advance_pending",
    paymentMeta: {
      advancePercentage: 20,
      remainingPercentage: 80,
    },
    notes,
    status: BOOKING_STATUS.PENDING,
    providerAssignedAt: new Date(),
  });

  try {
    console.log("=== Customer Booking - Creating Payment ===");
    console.log("Advance amount:", breakdown.advanceAmount);
    console.log("Amount in paise:", toPaise(breakdown.advanceAmount));
    console.log("Razorpay Key ID from env:", env.razorpayKeyId);
    console.log("Razorpay Key Secret from env:", env.razorpayKeySecret ? "present" : "missing");
    
    const order = await createRazorpayOrder({
      amountInPaise: toPaise(breakdown.advanceAmount),
      receipt: buildPaymentReceipt(booking._id, "advance"),
      notes: {
        bookingId: String(booking._id),
        paymentType: "advance",
        customerId: String(req.user._id),
        providerId: String(providerId),
      },
    });

    const payment = await upsertPaymentRecord({
      booking,
      paymentType: "advance",
      amount: breakdown.advanceAmount,
      status: "created",
      razorpay_order_id: order.id,
      receipt: order.receipt,
      metadata: {
        razorpayOrder: order,
      },
    });

    const populatedBooking = await booking.populate(customerBookingPopulate);

    res.status(201).json({
      success: true,
      message: "Advance payment order created successfully.",
      data: {
        booking: serializeBookingForCustomer(populatedBooking, { advance: payment }),
        payment: {
          key: env.razorpayKeyId,
          amount: toPaise(breakdown.advanceAmount),
          amountInRupees: breakdown.advanceAmount,
          totalAmount: roundCurrency(totalAmount),
          remainingAmount: breakdown.remainingAmount,
          orderId: order.id,
          paymentId: payment._id,
          currency: "INR",
          bookingId: booking._id,
          providerName:
            populatedBooking.provider?.businessName || populatedBooking.provider?.name || "EventMitra",
          serviceNames: getBookingServices(populatedBooking).map((service) => service.name).join(", "),
        },
      },
    });
  } catch (error) {
    await booking.deleteOne();
    throw error;
  }
});

export const verifyAdvancePayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new AppError("Missing Razorpay payment verification fields.", 400);
  }

  const booking = await Booking.findOne({
    _id: req.params.bookingId,
    customer: req.user._id,
  }).populate(customerBookingPopulate);

  if (!booking) {
    throw new AppError("Booking not found.", 404);
  }

  const advancePayment = await upsertPaymentRecord({
    booking,
    paymentType: "advance",
    amount: calculateAdvanceAmount(booking.totalAmount),
    status: "created",
  });

  if (
    advancePayment.razorpay_order_id &&
    advancePayment.razorpay_order_id !== razorpay_order_id
  ) {
    throw new AppError("Advance payment order mismatch.", 400);
  }

  const signatureIsValid = verifyRazorpayPaymentSignature({
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    razorpaySignature: razorpay_signature,
  });

  if (!signatureIsValid) {
    advancePayment.status = "failed";
    await advancePayment.save();
    throw new AppError("Payment signature verification failed.", 400);
  }

  booking.advancePaid = calculateAdvanceAmount(booking.totalAmount);
  booking.remainingAmount = calculateRemainingAmount(booking.totalAmount, booking.advancePaid);
  booking.paymentStatus = "advance_paid";
  booking.status = BOOKING_STATUS.CONFIRMED;
  booking.providerRespondedAt = new Date();
  booking.paymentMeta = {
    ...booking.paymentMeta,
    advancePaidAt: new Date(),
    lastPaymentAt: new Date(),
  };
  syncBookingPaymentState(booking);
  await booking.save();

  advancePayment.status = "paid";
  advancePayment.razorpay_order_id = razorpay_order_id;
  advancePayment.razorpay_payment_id = razorpay_payment_id;
  advancePayment.razorpay_signature = razorpay_signature;
  advancePayment.paidAt = new Date();
  await advancePayment.save();

  res.json({
    success: true,
    message: "Advance payment verified and booking confirmed.",
    data: serializeBookingForCustomer(booking, { advance: advancePayment }),
  });
});

export const getCustomerBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ 
    customer: req.user._id,
    paymentStatus: { $ne: "advance_pending" }
  })
    .populate(customerBookingPopulate)
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: await loadSerializedBookings(bookings),
  });
});

export const getRemainingPaymentQr = asyncHandler(async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.bookingId,
      customer: req.user._id,
    }).populate(customerBookingPopulate);

    console.log("getRemainingPaymentQr - booking:", booking?._id);
    console.log("getRemainingPaymentQr - status:", booking?.status);
    console.log("getRemainingPaymentQr - paymentStatus:", booking?.paymentStatus);
    console.log("getRemainingPaymentQr - provider:", booking?.provider);
    console.log("getRemainingPaymentQr - totalAmount:", booking?.totalAmount);
    console.log("getRemainingPaymentQr - advancePaid:", booking?.advancePaid);
    console.log("getRemainingPaymentQr - remainingAmount:", booking?.remainingAmount);

    if (!booking) {
      throw new AppError("Booking not found.", 404);
    }

    if (!booking.provider) {
      console.error("Booking has no provider!");
      throw new AppError("Booking has no provider assigned.", 400);
    }

    console.log("getRemainingPaymentQr - customer:", booking.customer);
    console.log("getRemainingPaymentQr - user._id:", req.user._id);

    if (!["otp_pending", "completed"].includes(booking.status)) {
      throw new AppError(`Remaining payment is not available yet. Current booking status: ${booking.status}. The provider needs to complete the service first.`, 400);
    }

    if (booking.paymentStatus === "full_paid") {
      const paymentsMap = await groupPaymentsByBookingId([booking._id]);
      return res.json({
        success: true,
        message: "Remaining payment has already been completed.",
        data: {
          booking: serializeBookingForCustomer(booking, paymentsMap.get(String(booking._id))),
        },
      });
    }

    const {
      payment,
      paymentLink,
      qrCodeDataUrl,
      amount,
      upiPayment,
      upiQrCodeUrl,
      razorpayOrder,
      razorpayReady,
      razorpayErrorMessage,
    } = await ensureRemainingPaymentOrder(booking);

    res.json({
      success: true,
      message: razorpayReady
        ? "Remaining payment order created successfully."
        : "Remaining payment QR generated. Razorpay popup is temporarily unavailable.",
      data: {
        bookingId: booking._id,
        paymentId: payment._id,
        orderId: payment.razorpay_order_id,
        amount: Number(razorpayOrder?.amount || payment.metadata?.razorpayOrder?.amount || toPaise(amount)),
        amountInRupees: amount,
        currency: razorpayOrder?.currency || payment.metadata?.razorpayOrder?.currency || "INR",
        key: env.razorpayKeyId,
        paymentLink,
        qrCodeDataUrl,
        providerName: booking.provider?.businessName || booking.provider?.name || "EventMitra",
        serviceNames: getBookingServices(booking).map((service) => service.name).join(", "),
        requiresCompletionOtp: Boolean(booking.completionOtp?.code && !booking.completionOtp?.isVerified),
        upiId: upiPayment?.upiId || "",
        upiAmount: upiPayment?.amount || amount,
        upiNote: upiPayment?.note || `Remaining payment for booking ${booking._id}`,
        upiQrCodeUrl: upiQrCodeUrl || "",
        razorpayReady,
        razorpayErrorMessage,
      },
    });
  } catch (error) {
    console.error("getRemainingPaymentQr error:", error);
    throw error;
  }
});

export const verifyRemainingPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new AppError("Missing Razorpay payment verification fields.", 400);
  }

  const booking = await Booking.findOne({
    _id: req.params.bookingId,
    customer: req.user._id,
  }).populate(customerBookingPopulate);

  if (!booking) {
    throw new AppError("Booking not found.", 404);
  }

  const remainingPayment = await ensureRemainingPaymentOrder(booking).then((result) => result.payment);

  if (!remainingPayment.razorpay_order_id) {
    throw new AppError("Razorpay order is not available for this remaining payment yet.", 409);
  }

  if (remainingPayment.razorpay_order_id !== razorpay_order_id) {
    throw new AppError("Remaining payment order mismatch.", 400);
  }

  const signatureIsValid = verifyRazorpayPaymentSignature({
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    razorpaySignature: razorpay_signature,
  });

  if (!signatureIsValid) {
    remainingPayment.status = "failed";
    await remainingPayment.save();
    throw new AppError("Payment signature verification failed.", 400);
  }

  remainingPayment.status = "paid";
  remainingPayment.razorpay_payment_id = razorpay_payment_id;
  remainingPayment.razorpay_signature = razorpay_signature;
  remainingPayment.paidAt = new Date();
  await remainingPayment.save();

  booking.remainingAmount = 0;
  booking.paymentStatus = "full_paid";
  booking.paymentMeta = {
    ...booking.paymentMeta,
    remainingPaidAt: new Date(),
    lastPaymentAt: new Date(),
  };
  syncBookingPaymentState(booking);
  await booking.save();

  res.json({
    success: true,
    message: "Remaining payment verified successfully.",
    data: serializeBookingForCustomer(booking, { remaining: remainingPayment }),
  });
});

export const verifyCustomerBookingOtp = asyncHandler(async (req, res) => {
  const { otp, rating, comment, feedback } = req.body;

  const booking = await Booking.findOne({
    _id: req.params.bookingId,
    customer: req.user._id,
  }).populate(customerBookingPopulate);

  if (!booking) {
    throw new AppError("Booking not found for this customer.", 404);
  }

  assertBookingStatus(
    booking,
    [BOOKING_STATUS.OTP_PENDING],
    "OTP verification is only available after the provider marks the job complete."
  );

  // Handle both old (rating/comment) and new (feedback object) formats
  const ratingValue = feedback?.rating ?? rating;
  const commentValue = feedback?.comment ?? comment;

  // If OTP is "direct_complete", skip OTP validation - this is for feedback-only submission
  if (otp !== "direct_complete") {
    // Validate OTP if provided
    if (otp?.trim()) {
      if (booking.completionOtp?.code !== otp.trim()) {
        throw new AppError("Invalid OTP. Please enter the correct code to complete the booking.", 400);
      }
      
      // Only verify OTP if it's not already verified
      if (!booking.completionOtp?.isVerified) {
        booking.completionOtp.isVerified = true;
        booking.completionOtp.verifiedAt = new Date();
      }
    } else if (!booking.completionOtp?.isVerified) {
      // If OTP not provided and not verified, check if we can proceed without it
      // This allows feedback submission before payment
    }
  }

  const numericRating = Number(ratingValue);
  const trimmedComment = commentValue?.trim();

  if (numericRating && (numericRating < 1 || numericRating > 5)) {
    throw new AppError("Please add a rating between 1 and 5 before closing the booking.", 400);
  }

  if (trimmedComment) {
    // Save feedback even if payment is not complete
    booking.feedback = {
      rating: numericRating || 5,
      comment: trimmedComment,
      submittedAt: new Date(),
    };
  }

  // If payment is full, mark as completed
  if (booking.paymentStatus === "full_paid") {
    booking.status = BOOKING_STATUS.COMPLETED;
    booking.completedAt = new Date();
    const payout = await upsertProviderPayoutForBooking(booking);
    
    await booking.save();
    
    return res.json({
      success: true,
      message: "Booking completed successfully and your feedback has been saved.",
      data: serializeBookingForCustomer(booking, { payout }),
    });
  }

  // If payment is not full, just save feedback and return
  await booking.save();

  res.json({
    success: true,
    message: "Feedback submitted successfully! Please complete the remaining payment through the provider.",
    data: serializeBookingForCustomer(booking),
  });
});

export const getAvailableSlots = asyncHandler(async (req, res) => {
  const { providerId, eventDate, duration, serviceIds } = req.query;

  if (!providerId || !eventDate) {
    throw new AppError("Provider ID and event date are required.", 400);
  }

  let serviceIdArray = [];
  if (serviceIds) {
    serviceIdArray = serviceIds.split(",");
  }

  const slots = await getAvailableTimeSlots(
    providerId,
    new Date(eventDate),
    Number(duration) || 2,
    serviceIdArray
  );

  res.json({
    success: true,
    data: slots,
  });
});

export const cancelCustomerBooking = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const { cancelReason } = req.body;

  const booking = await Booking.findOne({
    _id: bookingId,
    customer: req.user._id,
  }).populate(customerBookingPopulate);

  if (!booking) {
    throw new AppError("Booking not found.", 404);
  }

  const nonCancellableStatuses = [BOOKING_STATUS.COMPLETED, BOOKING_STATUS.CANCELLED];
  if (nonCancellableStatuses.includes(booking.status)) {
    throw new AppError("This booking cannot be cancelled as it is already completed or cancelled.", 400);
  }

  const refundDetails = calculateRefundDetails({
    totalAmount: booking.totalAmount,
    advancePaid: booking.advancePaid,
    eventDate: booking.eventDate,
    eventTime: booking.eventTime,
  });

  const advancePaymentSummary = await groupPaymentsByBookingId([booking._id]);
  const advancePayment = advancePaymentSummary.get(String(booking._id))?.advance || null;

  let refundRecord = null;
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

    refundRecord = await upsertPaymentRecord({
      booking,
      paymentType: "refund",
      amount: refundDetails.refundAmount,
      status: "processed",
      method: "online",
      razorpay_payment_id: advancePayment.razorpay_payment_id,
      razorpay_refund_id: refund.id,
      metadata: {
        refund,
      },
    });
  }

  booking.status = BOOKING_STATUS.CANCELLED;
  booking.cancellation = {
    cancelledAt: new Date(),
    cancelledBy: req.user._id,
    cancelReason: cancelReason?.trim() || "",
    refundAmount: refundDetails.refundAmount,
    refundStatus: refundDetails.refundAmount > 0 ? "completed" : "none",
    refundProcessedAt: refundDetails.refundAmount > 0 ? new Date() : undefined,
    cancellationPolicy: refundDetails.cancellationPolicy,
  };

  if (refundDetails.refundAmount >= booking.advancePaid && booking.advancePaid > 0) {
    booking.paymentStatus = "refunded";
  } else if (refundDetails.refundAmount > 0) {
    booking.paymentStatus = "partially_refunded";
  }

  await booking.save();

  let message = "Booking cancelled successfully.";
  if (refundDetails.refundAmount > 0) {
    message += ` Refund of Rs. ${refundDetails.refundAmount} processed based on the ${refundDetails.policyLabel} policy.`;
  }

  res.json({
    success: true,
    message,
    data: serializeBookingForCustomer(booking, { advance: advancePayment, refund: refundRecord }),
  });
});
