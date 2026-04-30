import { AppError } from "./appError.js";

export const BOOKING_STATUS = Object.freeze({
  PENDING: "pending",
  PROVIDER_ASSIGNED: "provider_assigned",
  CONFIRMED: "confirmed",
  REJECTED: "rejected",
  IN_PROGRESS: "in_progress",
  OTP_PENDING: "otp_pending",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
});

export const BOOKING_ASSIGNABLE_STATUSES = [
  BOOKING_STATUS.PENDING,
  BOOKING_STATUS.REJECTED,
  BOOKING_STATUS.PROVIDER_ASSIGNED,
  BOOKING_STATUS.CONFIRMED,
];

export const assertBookingStatus = (booking, allowedStatuses, message) => {
  if (!allowedStatuses.includes(booking.status)) {
    throw new AppError(message, 400);
  }
};

