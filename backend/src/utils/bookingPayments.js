import { env } from "../config/env.js";
import { Payment } from "../models/Payment.js";
import {
  buildPaymentReceipt,
  calculateRemainingAmount,
  getExistingPaymentForType,
  getPaymentStatusFromBooking,
  roundCurrency,
  toPaise,
  upsertPaymentRecord,
} from "./paymentLifecycle.js";
import { createQrCodeDataUrl, createRazorpayOrder, createUpiQrPayment } from "./razorpay.js";

export const buildRemainingPaymentLink = (bookingId, paymentId) =>
  `${env.clientUrl.replace(/\/$/, "")}/customer/payment/${bookingId}?payment=${paymentId}`;

const getStoredRazorpayOrder = (payment) => {
  const order = payment?.metadata?.razorpayOrder;
  if (!order?.id || order.id !== payment?.razorpay_order_id) {
    return null;
  }

  if (!Number.isFinite(Number(order.amount)) || Number(order.amount) <= 0) {
    return null;
  }

  return order;
};

export const ensureRemainingPaymentOrder = async (booking) => {
  // Ensure provider is converted to ObjectId if populated
  const providerId = booking.provider?._id || booking.provider;
  const providerUpiId = booking.provider?.upiId || env.platformUpiId || "";
  const payeeName =
    booking.provider?.businessName ||
    booking.provider?.name ||
    env.platformUpiName ||
    "EventMitra";

  // Create a clean booking object for upsertPaymentRecord
  const cleanBooking = {
    _id: booking._id,
    customer: booking.customer,
    provider: providerId,
    totalAmount: booking.totalAmount,
    advancePaid: booking.advancePaid,
    remainingAmount: booking.remainingAmount,
    paymentMeta: booking.paymentMeta,
  };

  const remainingAmount = roundCurrency(
    booking.remainingAmount || calculateRemainingAmount(booking.totalAmount, booking.advancePaid)
  );

  let payment = await getExistingPaymentForType(booking._id, "remaining");

  if (payment?.status === "paid") {
    const paymentLink =
      booking.paymentMeta?.remainingPaymentLink ||
      buildRemainingPaymentLink(booking._id, payment._id);
    const upiPayment = payment.metadata?.upiPayment || null;
    const upiQrCodeUrl = upiPayment?.qrContent
      ? await createQrCodeDataUrl(upiPayment.qrContent)
      : null;

    return {
      payment,
      paymentLink,
      qrCodeDataUrl: upiQrCodeUrl || await createQrCodeDataUrl(paymentLink),
      amount: remainingAmount,
      upiPayment,
      upiQrCodeUrl,
      upiId: upiPayment?.upiId || providerUpiId,
      upiAmount: upiPayment?.amount,
      upiNote: upiPayment?.note,
      amountInRupees: remainingAmount,
      razorpayOrder: getStoredRazorpayOrder(payment),
      razorpayReady: Boolean(payment.razorpay_order_id),
      razorpayErrorMessage: payment.metadata?.razorpayErrorMessage || "",
      providerUpiId,
    };
  }

  const paymentLink =
    booking.paymentMeta?.remainingPaymentLink ||
    (payment?._id ? buildRemainingPaymentLink(booking._id, payment._id) : "");
  const storedRazorpayOrder = getStoredRazorpayOrder(payment);
  const storedUpiPayment = payment?.metadata?.upiPayment || null;

  if (payment && storedRazorpayOrder) {
    let upiPayment = storedUpiPayment;
    let upiQrCodeUrl = upiPayment?.qrContent ? await createQrCodeDataUrl(upiPayment.qrContent) : null;

    if (!upiPayment && providerUpiId) {
      try {
        upiPayment = await createUpiQrPayment({
          amountInPaise: Number(storedRazorpayOrder.amount),
          description: `Remaining payment for ${booking.services?.[0]?.name || booking.service?.name || "booking"}`,
          bookingId: String(booking._id),
          upiId: providerUpiId,
          payeeName,
        });
        upiQrCodeUrl = await createQrCodeDataUrl(upiPayment.qrContent);
        payment.metadata = {
          ...(payment.metadata || {}),
          upiPayment,
          providerUpiId,
        };
        await payment.save();
      } catch (upiError) {
        console.error("Failed to create UPI QR:", upiError.message);
      }
    }

    return {
      payment,
      paymentLink,
      qrCodeDataUrl: upiQrCodeUrl || await createQrCodeDataUrl(paymentLink),
      amount: remainingAmount,
      upiPayment,
      upiQrCodeUrl,
      upiId: upiPayment?.upiId || providerUpiId,
      upiAmount: upiPayment?.amount,
      upiNote: upiPayment?.note,
      amountInRupees: remainingAmount,
      razorpayOrder: storedRazorpayOrder,
      razorpayReady: true,
      razorpayErrorMessage: payment.metadata?.razorpayErrorMessage || "",
      providerUpiId,
    };
  }

  // Create UPI QR code for payment (works on any domain)
  let upiPayment = null;
  let upiQrCodeUrl = null;

  try {
    upiPayment = await createUpiQrPayment({
      amountInPaise: toPaise(remainingAmount),
      description: `Remaining payment for ${booking.services?.[0]?.name || booking.service?.name || "booking"}`,
      bookingId: String(booking._id),
      upiId: providerUpiId,
      payeeName,
    });
    upiQrCodeUrl = await createQrCodeDataUrl(upiPayment.qrContent);
  } catch (upiError) {
    console.error("Failed to create UPI QR:", upiError.message);
  }

  // Also create a Razorpay order for popup checkout.
  let orderId = null;
  let razorpayOrder = null;
  let razorpayErrorMessage = "";
  const receipt = buildPaymentReceipt(booking._id, "remaining");
  try {
    console.log("Creating Razorpay order with:", {
      amountInPaise: toPaise(remainingAmount),
      receipt,
    });
    const order = await createRazorpayOrder({
      amountInPaise: toPaise(remainingAmount),
      receipt,
      notes: {
        bookingId: String(booking._id),
        paymentType: "remaining",
        customerId: String(booking.customer),
        providerId: String(providerId || ""),
      },
    });
    razorpayOrder = order;
    orderId = order.id;
    console.log("Razorpay order created:", orderId);
  } catch (orderError) {
    console.error("Razorpay order creation failed:", orderError.message);
    razorpayErrorMessage = orderError.message || "Unable to create Razorpay order.";
  }

  try {
    payment = await upsertPaymentRecord({
      booking: cleanBooking,
      paymentType: "remaining",
      amount: remainingAmount,
      status: "created",
      razorpay_order_id: orderId,
      receipt,
      metadata: {
        upiPayment: upiPayment,
        razorpayOrder,
        razorpayReady: Boolean(orderId),
        razorpayErrorMessage,
        providerUpiId,
      },
    });
  } catch (upsertError) {
    throw new Error(`Failed to create payment record: ${upsertError.message}`);
  }

  if (!payment || !payment._id) {
    throw new Error("Failed to create payment record - no payment returned");
  }

  const refreshedPaymentLink = buildRemainingPaymentLink(booking._id, payment._id);
  const qrCodeDataUrl = upiQrCodeUrl || await createQrCodeDataUrl(refreshedPaymentLink);

  booking.paymentMeta = {
    ...booking.paymentMeta,
    remainingPaymentLink: refreshedPaymentLink,
    remainingQrGeneratedAt: new Date(),
    upiId: upiPayment?.upiId,
    upiAmount: upiPayment?.amount,
  };
  booking.paymentStatus = getPaymentStatusFromBooking(booking);
  await booking.save();

  return {
    payment,
    paymentLink: refreshedPaymentLink,
    qrCodeDataUrl,
    amount: remainingAmount,
    upiPayment,
    upiQrCodeUrl,
    upiId: upiPayment?.upiId || providerUpiId,
    upiAmount: upiPayment?.amount,
    upiNote: upiPayment?.note,
    amountInRupees: remainingAmount,
    razorpayOrder,
    razorpayReady: Boolean(orderId),
    razorpayErrorMessage,
    providerUpiId,
  };
};

export const groupPaymentsByBookingId = async (bookingIds) => {
  const payments = await Payment.find({
    booking: { $in: bookingIds },
  }).sort({ createdAt: -1 });

  return payments.reduce((accumulator, payment) => {
    const key = String(payment.booking);
    if (!accumulator.has(key)) {
      accumulator.set(key, {
        all: [],
        advance: null,
        remaining: null,
        refund: null,
        payout: null,
      });
    }

    const summary = accumulator.get(key);
    summary.all.push(payment);

    if (payment.paymentType === "advance" && !summary.advance) {
      summary.advance = payment;
    }

    if (payment.paymentType === "remaining" && !summary.remaining) {
      summary.remaining = payment;
    }

    if (payment.paymentType === "refund" && !summary.refund) {
      summary.refund = payment;
    }

    if (payment.paymentType === "provider_payout" && !summary.payout) {
      summary.payout = payment;
    }

    return accumulator;
  }, new Map());
};
