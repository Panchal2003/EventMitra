import { Payment } from "../models/Payment.js";
import { env } from "../config/env.js";

export const ADVANCE_PAYMENT_PERCENT = 20;
export const REMAINING_PAYMENT_PERCENT = 80;
export const DEFAULT_COMMISSION_PERCENT = Number(env.adminCommissionPercent || 10);

export const roundCurrency = (value) =>
  Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;

export const toPaise = (value) => Math.round(roundCurrency(value) * 100);

export const fromPaise = (value) => roundCurrency(Number(value || 0) / 100);

export const calculateAdvanceAmount = (totalAmount) =>
  roundCurrency((Number(totalAmount || 0) * ADVANCE_PAYMENT_PERCENT) / 100);

export const calculateRemainingAmount = (totalAmount, advanceAmount = calculateAdvanceAmount(totalAmount)) =>
  roundCurrency(Number(totalAmount || 0) - Number(advanceAmount || 0));

export const calculateCommissionAmount = (amount, commissionPercent = DEFAULT_COMMISSION_PERCENT) =>
  roundCurrency((Number(amount || 0) * Number(commissionPercent || 0)) / 100);

export const calculateProviderPayout = (amount, commissionPercent = DEFAULT_COMMISSION_PERCENT) =>
  roundCurrency(Number(amount || 0) - calculateCommissionAmount(amount, commissionPercent));

export const calculatePayoutDueDate = (eventDate) => {
  const dueDate = new Date(eventDate);
  dueDate.setDate(dueDate.getDate() + 2);
  return dueDate;
};

export const getBookingPaymentBreakdown = (totalAmount) => {
  const advanceAmount = calculateAdvanceAmount(totalAmount);
  return {
    totalAmount: roundCurrency(totalAmount),
    advanceAmount,
    remainingAmount: calculateRemainingAmount(totalAmount, advanceAmount),
  };
};

export const getPaymentStatusFromBooking = (booking) => {
  const advancePaid = roundCurrency(booking?.advancePaid || 0);
  const remainingAmount = roundCurrency(booking?.remainingAmount || 0);

  if (booking?.paymentStatus === "refunded" || booking?.paymentStatus === "partially_refunded") {
    return booking.paymentStatus;
  }

  if (advancePaid <= 0) {
    return "unpaid";
  }

  if (remainingAmount <= 0) {
    return "full_paid";
  }

  return "advance_paid";
};

export const syncBookingPaymentState = (booking) => {
  const { advanceAmount, remainingAmount } = getBookingPaymentBreakdown(booking.totalAmount);

  if (!booking.advancePaid) {
    booking.advancePaid = 0;
  }

  if (booking.advancePaid >= advanceAmount) {
    booking.advancePaid = advanceAmount;
    booking.remainingAmount = roundCurrency(Math.max(remainingAmount, 0));
  } else {
    booking.remainingAmount = roundCurrency(Math.max(Number(booking.totalAmount || 0) - Number(booking.advancePaid || 0), 0));
  }

  booking.paymentStatus = getPaymentStatusFromBooking(booking);
  return booking;
};

export const buildPaymentReceipt = (bookingId, paymentType) =>
  `EM-${paymentType.toUpperCase()}-${String(bookingId).slice(-6)}-${Date.now()}`;

export const getExistingPaymentForType = (bookingId, paymentType) =>
  Payment.findOne({ booking: bookingId, paymentType }).sort({ createdAt: -1 });

export const upsertPaymentRecord = async ({
  booking,
  paymentType,
  amount,
  status,
  method = "online",
  paymentGateway = "razorpay",
  ...rest
}) => {
  try {
    const result = await Payment.findOneAndUpdate(
      { booking: booking._id, paymentType },
      {
        booking: booking._id,
        customer: booking.customer,
        provider: booking.provider,
        paymentType,
        amount: roundCurrency(amount),
        currency: "INR",
        status,
        method,
        paymentGateway,
        ...rest,
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );
    return result;
  } catch (error) {
    // On duplicate key error, try to find the existing payment
    if (error.code === 11000) {
      // First try to find the specific payment type
      let existing = await Payment.findOne({ booking: booking._id, paymentType });
      if (existing) {
        return existing;
      }
      // If not found, find any payment for this booking and return it
      existing = await Payment.findOne({ booking: booking._id });
      if (existing) {
        return existing;
      }
    }
    throw error;
  }
};

export const upsertProviderPayoutForBooking = async (booking, commissionPercent = DEFAULT_COMMISSION_PERCENT) => {
  const eligibleAmount = roundCurrency(booking.totalAmount || 0);
  const providerAmount = calculateProviderPayout(eligibleAmount, commissionPercent);
  const adminProfit = calculateCommissionAmount(eligibleAmount, commissionPercent);

  return upsertPaymentRecord({
    booking,
    paymentType: "provider_payout",
    amount: eligibleAmount,
    providerAmount,
    adminProfit,
    commissionRate: Number(commissionPercent),
    status: "pending",
    method: "bank_transfer",
    paymentGateway: "manual",
    payoutDueDate: calculatePayoutDueDate(booking.eventDate),
    releasedAt: undefined,
    transactionId: undefined,
  });
};

export const getPaymentSummaryForBooking = async (bookingId) => {
  const payments = await Payment.find({ booking: bookingId }).sort({ createdAt: -1 });
  const summary = {
    payments,
    advance: payments.find((payment) => payment.paymentType === "advance") || null,
    remaining: payments.find((payment) => payment.paymentType === "remaining") || null,
    refund: payments.find((payment) => payment.paymentType === "refund") || null,
    payout: payments.find((payment) => payment.paymentType === "provider_payout") || null,
  };

  return summary;
};
