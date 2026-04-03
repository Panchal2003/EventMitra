import { Payment } from "../../models/Payment.js";
import { AppError } from "../../utils/appError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const createTransactionId = () => `EM-${Date.now()}`;

export const getPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find()
    .populate({
      path: "booking",
      populate: [
        {
          path: "service",
          select: "name startingPrice image",
        },
        { path: "customer", select: "name" },
      ],
    })
    .populate("provider", "name email businessName")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: payments,
  });
});

export const releasePayout = asyncHandler(async (req, res) => {
  const { transactionId } = req.body;
  const payment = await Payment.findById(req.params.paymentId).populate("booking");

  if (!payment) {
    throw new AppError("Payment not found.", 404);
  }

  if (payment.status !== "pending") {
    throw new AppError("Only pending payouts can be released.", 400);
  }

  if (payment.booking.status !== "completed") {
    throw new AppError("Payouts can only be released after final OTP verification completes the booking.", 400);
  }

  payment.status = "released";
  payment.releasedAt = new Date();
  payment.transactionId = transactionId?.trim() || createTransactionId();

  await payment.save();

  const populatedPayment = await payment.populate([
    {
      path: "booking",
      populate: [
        {
          path: "service",
          select: "name startingPrice image",
        },
        { path: "customer", select: "name" },
      ],
    },
    { path: "provider", select: "name email businessName" },
  ]);

  res.json({
    success: true,
    message: "Payout released successfully.",
    data: populatedPayment,
  });
});
