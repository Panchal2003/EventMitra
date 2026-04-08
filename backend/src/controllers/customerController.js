import { Booking } from "../models/Booking.js";
import { Service } from "../models/Service.js";
import { AppError } from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { BOOKING_STATUS, assertBookingStatus } from "../utils/bookingLifecycle.js";
import { checkTimeOverlap, getAvailableTimeSlots } from "../utils/bookingValidation.js";

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
  { path: "provider", select: "name email businessName phone address" },
];

const serializeBookingForCustomer = (booking) => {
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

  // Show completion OTP when provider completes job (provider gives this to customer)
  if (
    serialized.status === BOOKING_STATUS.OTP_PENDING &&
    serialized.completionOtp?.code &&
    !serialized.completionOtp?.isVerified
  ) {
    serialized.completionOtpCode = serialized.completionOtp?.code || "";
  }

  return serialized;
};

export const getCustomerDashboard = asyncHandler(async (req, res) => {
  const customerId = req.user._id;

  const statusCounts = await Booking.aggregate([
    {
      $match: {
        customer: customerId,
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
      awaitingProvider:
        (countMap[BOOKING_STATUS.PENDING] || 0) +
        (countMap[BOOKING_STATUS.PROVIDER_ASSIGNED] || 0),
      awaitingAdmin:
        (countMap[BOOKING_STATUS.PENDING] || 0) +
        (countMap[BOOKING_STATUS.PROVIDER_ASSIGNED] || 0),
      activeBookings:
        (countMap[BOOKING_STATUS.CONFIRMED] || 0) +
        (countMap[BOOKING_STATUS.IN_PROGRESS] || 0) +
        (countMap[BOOKING_STATUS.OTP_PENDING] || 0),
      otpPending: countMap[BOOKING_STATUS.OTP_PENDING] || 0,
      completedBookings: countMap[BOOKING_STATUS.COMPLETED] || 0,
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
    const overlapCheck = await checkTimeOverlap(providerId, eventDate, eventTime, null, serviceIdArray, null);
    if (overlapCheck.hasOverlap) {
      const availableSlots = await getAvailableTimeSlots(providerId, eventDate, 2, serviceIdArray);
      throw new AppError(
        `Time slot already booked for these services at ${eventTime}. Available slots: ${availableSlots.slice(0, 5).join(", ")}${availableSlots.length > 5 ? "..." : ""}`,
        400
      );
    }
  }

  const totalAmount = services.reduce((sum, service) => {
    if (service.allowsMembers && service.pricePerMember && guestCount) {
      const members = Number(guestCount);
      if (members <= 1) {
        return sum + (service.startingPrice || 0);
      }
      // For 2+ members: base price + (pricePerMember × (members - 1))
      return sum + (service.startingPrice || 0) + (service.pricePerMember * (members - 1));
    }
    return sum + (service.startingPrice || 0);
  }, 0);

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
    notes,
    status: BOOKING_STATUS.PROVIDER_ASSIGNED,
    providerAssignedAt: new Date(),
  });

  const populatedBooking = await booking.populate(customerBookingPopulate);

  res.status(201).json({
    success: true,
    message: `Booking request sent to the provider for ${services.length} service(s).`,
    data: serializeBookingForCustomer(populatedBooking),
  });
});

export const getCustomerBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ customer: req.user._id })
    .populate(customerBookingPopulate)
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: bookings.map(serializeBookingForCustomer),
  });
});

export const verifyCustomerBookingOtp = asyncHandler(async (req, res) => {
  const { otp, rating, comment } = req.body;

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

  if (!otp?.trim()) {
    throw new AppError("Please enter the OTP shared for this booking.", 400);
  }

  if (booking.completionOtp?.code !== otp.trim()) {
    throw new AppError("Invalid OTP. Please enter the correct code to complete the booking.", 400);
  }

  const numericRating = Number(rating);
  const trimmedComment = comment?.trim();

  if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
    throw new AppError("Please add a rating between 1 and 5 before closing the booking.", 400);
  }

  if (!trimmedComment) {
    throw new AppError("Please share your feedback before completing the booking.", 400);
  }

  booking.status = BOOKING_STATUS.COMPLETED;
  booking.completedAt = new Date();
  booking.completionOtp.isVerified = true;
  booking.completionOtp.verifiedAt = new Date();
  booking.feedback = {
    rating: numericRating,
    comment: trimmedComment,
    submittedAt: new Date(),
  };

  await booking.save();
  await booking.populate(customerBookingPopulate);

  res.json({
    success: true,
    message: "Booking completed successfully and your feedback has been saved.",
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
    serviceIdArray = serviceIds.split(',');
  }

  const slots = await getAvailableTimeSlots(providerId, new Date(eventDate), Number(duration) || 2, serviceIdArray);

  res.json({
    success: true,
    data: slots
  });
});
