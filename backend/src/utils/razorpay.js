import crypto from "crypto";
import QRCode from "qrcode";
import Razorpay from "razorpay";
import { env } from "../config/env.js";
import { AppError } from "./appError.js";

let razorpayClient = null;

export const isRazorpayConfigured = () => {
  const configured = Boolean(env.razorpayKeyId && env.razorpayKeySecret);
  console.log("=== Razorpay Configuration Check ===");
  console.log("Key ID exists:", Boolean(env.razorpayKeyId));
  console.log("Key ID value:", env.razorpayKeyId);
  console.log("Key Secret exists:", Boolean(env.razorpayKeySecret));
  console.log("Key Secret (first 5 chars):", env.razorpayKeySecret?.substring(0, 5));
  console.log("Fully configured:", configured);
  return configured;
};

export const getRazorpayClient = () => {
  if (!isRazorpayConfigured()) {
    throw new AppError("Razorpay is not configured on the server.", 500);
  }

  if (!razorpayClient) {
    console.log("Initializing Razorpay client with:");
    console.log("- Key ID:", env.razorpayKeyId);
    console.log("- Key Secret:", env.razorpayKeySecret?.substring(0, 5) + "...");
    
    razorpayClient = new Razorpay({
      key_id: env.razorpayKeyId,
      key_secret: env.razorpayKeySecret,
    });
    
    console.log("Razorpay client initialized");
  }

  return razorpayClient;
};

export const createRazorpayOrder = async ({
  amountInPaise,
  receipt,
  notes = {},
}) => {
  const normalizedAmountInPaise = Number(amountInPaise);
  const normalizedReceipt = String(receipt || "").trim();

  console.log("=== Creating Razorpay Order ===");
  console.log("Amount (paise):", normalizedAmountInPaise);
  console.log("Receipt:", normalizedReceipt);
  console.log("Notes:", notes);
  console.log("Razorpay Key ID:", env.razorpayKeyId);

  if (!Number.isInteger(normalizedAmountInPaise) || normalizedAmountInPaise <= 0) {
    throw new AppError("Payment amount must be a positive integer in paise.", 400);
  }

  if (!normalizedReceipt) {
    throw new AppError("Payment receipt is required.", 400);
  }

  if (normalizedReceipt.length > 40) {
    throw new AppError("Payment receipt exceeds Razorpay's 40 character limit.", 400);
  }
  
  if (!isRazorpayConfigured()) {
    throw new AppError("Razorpay is not configured on the server.", 500);
  }
  
  const client = getRazorpayClient();
  console.log("Creating order via Razorpay SDK...");
  
  try {
    const order = await client.orders.create({
      amount: normalizedAmountInPaise,
      currency: "INR",
      receipt: normalizedReceipt,
      payment_capture: 1,
      notes,
    });
    
    console.log("Razorpay order created successfully:", order.id);
    return order;
  } catch (error) {
    console.error("Razorpay SDK Error:");
    console.error("Status:", error.statusCode);
    console.error("Error code:", error.error?.code);
    console.error("Error description:", error.error?.description);
    console.error("Full error:", JSON.stringify(error, null, 2));
    
    if (error.statusCode === 401 || error.error?.code === "BAD_REQUEST_ERROR") {
      if (error.error?.description?.includes("Authentication failed")) {
        throw new AppError("Payment service authentication failed. Please verify your API keys in the Razorpay dashboard.", 503);
      }
    }
    
    if (error.statusCode === 400) {
      throw new AppError(error.error?.description || "Invalid payment request.", 400);
    }
    
    throw new AppError(error.error?.description || "Failed to create payment order.", 500);
  }
};

export const verifyRazorpayPaymentSignature = ({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}) => {
  const expectedSignature = crypto
    .createHmac("sha256", env.razorpayKeySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  return expectedSignature === razorpaySignature;
};

export const createRazorpayRefund = async ({ paymentId, amountInPaise, notes = {} }) => {
  const client = getRazorpayClient();
  return client.payments.refund(paymentId, {
    amount: amountInPaise,
    speed: "normal",
    notes,
  });
};

export const createQrCodeDataUrl = async (value) =>
  QRCode.toDataURL(value, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 320,
  });

export const isValidUpiId = (value) =>
  /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z]{2,64}$/.test(String(value || "").trim());

export const createUpiQrPayment = async ({
  amountInPaise,
  description,
  bookingId,
  upiId,
  payeeName,
}) => {
  const normalizedUpiId = String(upiId || "").trim();
  const normalizedPayeeName = String(payeeName || env.platformUpiName || "EventMitra").trim();
  const amountNumber = Number((Number(amountInPaise || 0) / 100).toFixed(2));
  const amountForUpi = amountNumber.toFixed(2);

  if (!isValidUpiId(normalizedUpiId)) {
    throw new AppError("A valid UPI ID is not configured for this payment.", 400);
  }
  
  return {
    upiId: normalizedUpiId,
    payeeName: normalizedPayeeName,
    amount: amountNumber,
    note: description || `Payment for booking ${bookingId}`,
    qrContent: `upi://pay?pa=${encodeURIComponent(normalizedUpiId)}&pn=${encodeURIComponent(normalizedPayeeName)}&am=${amountForUpi}&cu=INR&tn=${encodeURIComponent(description || `Booking ${bookingId}`)}`,
    id: `upi_${Date.now()}`,
  };
};
