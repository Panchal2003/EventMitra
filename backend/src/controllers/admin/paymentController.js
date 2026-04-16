import { Booking } from "../../models/Booking.js";
import { Payment } from "../../models/Payment.js";
import { AppError } from "../../utils/appError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { groupPaymentsByBookingId } from "../../utils/bookingPayments.js";
import {
  DEFAULT_COMMISSION_PERCENT,
  calculateCommissionAmount,
  calculateProviderPayout,
  upsertProviderPayoutForBooking,
} from "../../utils/paymentLifecycle.js";

const adminPaymentPopulate = [
  {
    path: "service",
    select: "name startingPrice image",
  },
  {
    path: "services",
    select: "name startingPrice image",
  },
  { path: "customer", select: "name email phone" },
  { path: "provider", select: "name email businessName phone providerBankAccount upiId paymentDetailsVerified" },
];

const buildAdminPaymentRow = (booking, paymentSummary) => {
  const payout = paymentSummary?.payout || null;
  const commissionRate = Number(payout?.commissionRate ?? DEFAULT_COMMISSION_PERCENT);
  const providerAmount = Number(
    payout?.providerAmount ?? calculateProviderPayout(booking.totalAmount, commissionRate)
  );
  const adminProfit = Number(
    payout?.adminProfit ?? calculateCommissionAmount(booking.totalAmount, commissionRate)
  );
  const advancePayment = paymentSummary?.advance || null;
  const remainingPayment = paymentSummary?.remaining || null;
  const refundPayment = paymentSummary?.refund || null;

  return {
    _id: payout?._id || String(booking._id),
    bookingId: booking._id,
    booking,
    provider: booking.provider,
    customer: booking.customer,
    totalAmount: Number(booking.totalAmount || 0),
    advancePaid: Number(booking.advancePaid || 0),
    remainingPaid:
      remainingPayment?.status === "paid"
        ? Number(remainingPayment.amount || 0)
        : Number(booking.totalAmount || 0) - Number(booking.advancePaid || 0) - Number(booking.remainingAmount || 0),
    remainingDue: Number(booking.remainingAmount || 0),
    paymentStatus: booking.paymentStatus,
    advancePayment,
    remainingPayment,
    refundPayment,
    payout,
    amount: Number(payout?.amount || booking.totalAmount || 0),
    providerAmount,
    adminProfit,
    commissionRate,
    providerBankAccount: booking.provider?.providerBankAccount || null,
    providerUpiId: booking.provider?.upiId || null,
    paymentDetailsVerified: booking.provider?.paymentDetailsVerified || false,
    status:
      payout?.status ||
      (booking.paymentStatus === "full_paid" && booking.status === "completed" ? "pending" : "collection_pending"),
    method: payout?.method || "bank_transfer",
    transactionId: payout?.transactionId || "",
    releasedAt: payout?.releasedAt || null,
    payoutDueDate: payout?.payoutDueDate || null,
    createdAt: payout?.createdAt || booking.createdAt,
  };
};

export const getPayments = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ paymentStatus: { $ne: "advance_pending" } })
    .populate(adminPaymentPopulate)
    .sort({ createdAt: -1 });

  const paymentMap = await groupPaymentsByBookingId(bookings.map((booking) => booking._id));

  for (const booking of bookings) {
    const paymentSummary = paymentMap.get(String(booking._id));
    const shouldHavePayout =
      booking.status === "completed" &&
      booking.paymentStatus === "full_paid" &&
      !paymentSummary?.payout;

    if (shouldHavePayout) {
      const payout = await upsertProviderPayoutForBooking(booking);
      paymentMap.set(String(booking._id), {
        ...(paymentSummary || { all: [] }),
        payout,
        advance: paymentSummary?.advance || null,
        remaining: paymentSummary?.remaining || null,
        refund: paymentSummary?.refund || null,
        all: [...(paymentSummary?.all || []), payout],
      });
    }
  }

  res.json({
    success: true,
    data: bookings.map((booking) =>
      buildAdminPaymentRow(booking, paymentMap.get(String(booking._id)))
    ),
  });
});

export const releasePayout = asyncHandler(async (req, res) => {
  const { transactionId, commissionRate } = req.body;
  const payment = await Payment.findById(req.params.paymentId).populate({
    path: "booking",
    populate: adminPaymentPopulate,
  });

  if (!payment || payment.paymentType !== "provider_payout") {
    throw new AppError("Payout record not found.", 404);
  }

  if (payment.status !== "pending") {
    throw new AppError("Only pending payouts can be released.", 400);
  }

  if (payment.booking.status !== "completed" || payment.booking.paymentStatus !== "full_paid") {
    throw new AppError("Payouts can only be released after full payment and booking completion.", 400);
  }

  const nextCommissionRate =
    commissionRate === undefined || commissionRate === null || commissionRate === ""
      ? Number(payment.commissionRate || DEFAULT_COMMISSION_PERCENT)
      : Number(commissionRate);

  if (!Number.isFinite(nextCommissionRate) || nextCommissionRate < 0 || nextCommissionRate > 100) {
    throw new AppError("Commission rate must be between 0 and 100.", 400);
  }

  payment.commissionRate = nextCommissionRate;
  payment.providerAmount = calculateProviderPayout(payment.amount, nextCommissionRate);
  payment.adminProfit = calculateCommissionAmount(payment.amount, nextCommissionRate);
  payment.status = "released";
  payment.releasedAt = new Date();
  payment.transactionId = transactionId?.trim() || `EM-PAYOUT-${Date.now()}`;
  await payment.save();

  const refreshedPayment = await Payment.findById(payment._id).populate({
    path: "booking",
    populate: adminPaymentPopulate,
  });

  res.json({
    success: true,
    message: "Payout released successfully.",
    data: buildAdminPaymentRow(refreshedPayment.booking, { payout: refreshedPayment }),
  });
});
