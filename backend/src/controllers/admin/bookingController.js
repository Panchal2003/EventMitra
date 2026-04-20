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
import { 
  createRazorpayXContact, 
  createRazorpayXFundAccount, 
  createRazorpayXPayout,
  isRazorpayXConfigured 
} from "../../utils/razorpayX.js";

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

export const releaseProviderPayment = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;

  const booking = await Booking.findById(bookingId).populate("provider", "name email phone businessName providerBankAccount razorpayXContactId razorpayXFundAccountId");

  if (!booking) {
    throw new AppError("Booking not found.", 404);
  }

  console.log("Booking paymentStatus:", booking.paymentStatus);
  console.log("Booking payoutStatus:", booking.payoutStatus);
  console.log("Booking status:", booking.status);

  if (booking.paymentStatus !== "full_paid") {
    throw new AppError(`Payment is not fully completed (${booking.paymentStatus}). Cannot release payout.`, 400);
  }

  if (booking.payoutStatus === "paid") {
    throw new AppError("Payout has already been released for this booking.", 400);
  }

  if (booking.payoutStatus === "processing") {
    throw new AppError("Payout is currently being processed. Please wait.", 400);
  }

  const provider = booking.provider;
  console.log("=== Release Payment Debug ===");
  console.log("Provider:", provider);
  console.log("Provider Bank Account:", provider?.providerBankAccount);

  if (!provider || !provider.providerBankAccount) {
    throw new AppError("Provider bank details not found. Please ask provider to add bank details.", 400);
  }

  const bankDetails = provider.providerBankAccount;
  const { bankName, accountNumber, ifscCode, accountHolderName } = bankDetails;

  console.log("Bank Details:", { bankName, accountNumber, ifscCode, accountHolderName });

  if (!bankName || !accountNumber || !ifscCode || !accountHolderName) {
    throw new AppError("Incomplete provider bank details. Please ask provider to complete their bank details.", 400);
  }

  if (accountNumber.length < 9 || accountNumber.length > 18) {
    throw new AppError("Invalid account number. Must be 9-18 digits.", 400);
  }

  console.log("Full Account Number for payout:", accountNumber);
  console.log("Account Number Length:", accountNumber.length);

  if (ifscCode.length !== 11) {
    throw new AppError("Invalid IFSC code. Must be 11 characters.", 400);
  }

  const totalAmount = Number(booking.totalAmount);
  const commissionRate = 0.11;
  const commission = Math.floor(totalAmount * commissionRate);
  const providerAmount = totalAmount - commission;
  const payoutAmount = providerAmount * 100;

  console.log("Amount Calculation:", { totalAmount, commission, providerAmount, payoutAmount });

  if (providerAmount <= 0) {
    throw new AppError("Invalid payout amount.", 400);
  }

  if (providerAmount < 1) {
    throw new AppError("Minimum payout amount is Rs. 1.00", 400);
  }

  if (!isRazorpayXConfigured()) {
    throw new AppError("RazorpayX is not configured. Please contact support.", 500);
  }

  booking.payoutStatus = "processing";
  await booking.save();

  try {
    console.log("=== Starting RazorpayX Payout ===");

    let contactId = provider.razorpayXContactId;
    let fundAccountId = provider.razorpayXFundAccountId;

    if (!contactId || !fundAccountId) {
      console.log("No stored RazorpayX account, creating new...");
      
      console.log("Step 1: Creating Contact...");
      const contact = await createRazorpayXContact({
        name: provider.name || accountHolderName,
        contact: provider.phone,
        referenceId: provider._id?.toString(),
      });
      contactId = contact.id;
      console.log("Contact created:", contactId);

      console.log("Step 2: Creating Fund Account...");
      const fundAccount = await createRazorpayXFundAccount({
        contactId: contactId,
        bankAccount: {
          name: accountHolderName,
          ifsc: ifscCode,
          account_number: accountNumber,
        },
      });
      fundAccountId = fundAccount.id;
      console.log("Fund account created:", fundAccountId);

      await User.findByIdAndUpdate(provider._id, {
        razorpayXContactId: contactId,
        razorpayXFundAccountId: fundAccountId,
      });
      console.log("Saved RazorpayX IDs to provider profile");
    } else {
      console.log("Using stored RazorpayX account:");
      console.log("- Contact ID:", contactId);
      console.log("- Fund Account ID:", fundAccountId);
    }

    console.log("Step 3: Creating Payout...");
    const idempotencyKey = `payout_${bookingId}_${Date.now()}`;
    const payout = await createRazorpayXPayout({
      fundAccountId: fundAccountId,
      amountInPaise: payoutAmount,
      currency: "INR",
      mode: "IMPS",
      purpose: "payout",
      narration: `Payment for booking ${bookingId}`,
      referenceId: bookingId,
      idempotencyKey,
    });

    booking.payoutStatus = "paid";
    booking.payoutAmount = providerAmount;
    booking.commission = commission;
    booking.payoutDate = new Date();
    booking.payoutId = payout.id;
    await booking.save();

    res.json({
      success: true,
      message: `Payment of Rs. ${providerAmount.toFixed(2)} released to provider. Commission: Rs. ${commission.toFixed(2)}`,
      data: {
        payoutId: payout.id,
        contactId: contactId,
        fundAccountId: fundAccountId,
        providerAmount: providerAmount,
        commission: commission,
        payoutDate: booking.payoutDate,
        status: payout.status,
      },
    });
  } catch (payoutError) {
    console.error("Payout Error:", payoutError);
    booking.payoutStatus = "failed";
    await booking.save();
    throw new AppError(payoutError.message || "Payout failed. Please try again.", 500);
  }
});
