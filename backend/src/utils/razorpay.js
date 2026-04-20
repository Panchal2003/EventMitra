import crypto from "crypto";
import QRCode from "qrcode";
import Razorpay from "razorpay";
import { env } from "../config/env.js";
import { AppError } from "./appError.js";

let razorpayClient = null;

export const isRazorpayConfigured = () => {
  const configured = Boolean(env.razorpayKeyId && env.razorpayKeySecret);
  if (!configured) {
    console.log("=== Razorpay NOT Configured ===");
    console.log("Key ID:", env.razorpayKeyId ? "present" : "MISSING");
    console.log("Key Secret:", env.razorpayKeySecret ? "present" : "MISSING");
  }
  return configured;
};

export const getRazorpayClient = () => {
  if (!isRazorpayConfigured()) {
    throw new AppError("Razorpay is not configured on the server. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env", 500);
  }

  if (!razorpayClient) {
    console.log("=== Initializing Razorpay Client ===");
    console.log("Key ID:", env.razorpayKeyId);
    console.log("Key Secret:", env.razorpayKeySecret ? env.razorpayKeySecret.substring(0, 5) + "..." : "undefined");
    
    try {
      razorpayClient = new Razorpay({
        key_id: env.razorpayKeyId,
        key_secret: env.razorpayKeySecret,
      });

      console.log("Razorpay client initialized");
      console.log("Instance type:", typeof razorpayClient);
      console.log("Available methods:", Object.keys(razorpayClient));
      
    } catch (initError) {
      console.error("Razorpay initialization error:", initError);
      throw new AppError("Failed to initialize Razorpay: " + initError.message, 500);
    }

    console.log("Razorpay client created");
    console.log("Instance type:", typeof razorpayClient);
    console.log("Instance keys:", Object.keys(razorpayClient || {}));
    
    // Different SDK versions have different API structures
    const hasContacts = !!(razorpayClient?.contacts || razorpayClient?.API?.contacts);
    const hasFundAccounts = !!(razorpayClient?.fundAccounts || razorpayClient?.API?.fundAccounts);
    const hasPayouts = !!(razorpayClient?.payouts || razorpayClient?.API?.payouts);
    
    console.log("Has contacts API:", hasContacts);
    console.log("Has fundAccounts API:", hasFundAccounts);
    console.log("Has payouts API:", hasPayouts);
  }

  return razorpayClient;
};

export const testRazorpayConnection = async () => {
  const client = getRazorpayClient();
  console.log("Testing Razorpay connection...");
  console.log("Client keys:", Object.keys(client));
  return {
    contacts: client.contacts,
    payouts: client.payouts,
    fundAccounts: client.fundAccounts,
  };
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

export const createRazorpayPayout = async ({
  fundAccountId,
  amountInPaise,
  currency = "INR",
  mode = "IMPS",
  purpose = "payout",
  narration,
  referenceId,
}) => {
  const client = getRazorpayClient();

  if (!env.razorpayAccountNumber) {
    throw new AppError("Razorpay account number not configured. Please contact support.", 500);
  }

  if (!fundAccountId) {
    throw new AppError("Fund account ID is required for payout.", 400);
  }

  if (!amountInPaise || amountInPaise <= 0) {
    throw new AppError("Invalid payout amount.", 400);
  }

  const payoutPayload = {
    account_number: env.razorpayAccountNumber,
    fund_account_id: fundAccountId,
    amount: Math.round(amountInPaise),
    currency,
    mode,
    purpose,
    narration: narration?.substring(0, 100) || `Payout for booking`,
  };

  if (referenceId) {
    payoutPayload.reference_id = referenceId.substring(0, 40);
  }

  console.log("=== Creating Razorpay Payout ===");
  console.log("Account Number:", env.razorpayAccountNumber);
  console.log("Fund Account ID:", fundAccountId);
  console.log("Amount (paise):", amountInPaise);
  console.log("Mode:", mode);
  console.log("Purpose:", purpose);

  // Handle different SDK versions
  const payoutsApi = client?.payouts || client?.API?.payouts;
  
  if (!payoutsApi) {
    console.error("CRITICAL: payouts API not found!");
    throw new AppError("Razorpay payouts API not available.", 500);
  }

  if (typeof payoutsApi?.create !== "function") {
    console.error("CRITICAL: payouts.create is not a function!");
    throw new AppError("Razorpay payouts.create not available.", 500);
  }

  try {
    console.log("Calling payouts.create()...");
    const payout = await payoutsApi.create(payoutPayload);
    console.log("SUCCESS: Payout created:", payout?.id);
    return payout;
  } catch (error) {
    console.error("Razorpay Payout Error:");
    console.error("Status:", error.statusCode);
    console.error("Error code:", error.error?.code);
    console.error("Error description:", error.error?.description);
    console.error("Full error:", JSON.stringify(error, null, 2));
    throw new AppError(error.error?.description || "Failed to create payout. Please try again.", 500);
  }
};

export const createRazorpayContact = async ({ name, email, contact, referenceId }) => {
  const client = getRazorpayClient();

  if (!name || String(name).trim().length === 0) {
    throw new AppError("Contact name is required and cannot be empty.", 400);
  }

  const trimmedName = String(name).trim();
  const trimmedEmail = email ? String(email).trim().toLowerCase() : undefined;
  const trimmedContact = contact ? String(contact).trim() : undefined;

  if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    throw new AppError("Invalid email format.", 400);
  }

  if (trimmedContact && !/^\d{10}$/.test(trimmedContact)) {
    throw new AppError("Contact number must be exactly 10 digits.", 400);
  }

  const contactPayload = {
    name: trimmedName,
    type: "vendor",
    reference_id: referenceId ? String(referenceId).substring(0, 40) : undefined,
  };

  if (trimmedEmail) {
    contactPayload.email = trimmedEmail;
  }

  if (trimmedContact) {
    contactPayload.contact = trimmedContact.toString();
  }

  console.log("=== Creating Razorpay Contact ===");
  console.log("Client type:", typeof client);
  console.log("Payload:", JSON.stringify(contactPayload, null, 2));

  // Handle different SDK versions and RazorpayX APIs
  let contactsApi = client?.contacts || client?.API?.contacts;
  let fundAccountsApi = client?.fundAccounts || client?.fundAccount;
  let payoutsApi = client?.payouts;
  
  console.log("API Search:");
  console.log("- contacts:", contactsApi ? "found" : "not found");
  console.log("- fundAccounts:", fundAccountsApi ? "found" : "not found");
  console.log("- payouts:", payoutsApi ? "found" : "not found");
  
  // Try alternate locations
  if (!contactsApi) contactsApi = client?.api?.contacts;
  if (!fundAccountsApi) fundAccountsApi = client?.api?.fundAccounts;
  if (!payoutsApi) payoutsApi = client?.api?.payouts;
  
  console.log("After alternate search:");
  console.log("- contacts:", contactsApi ? "found" : "not found");
  console.log("- fundAccounts:", fundAccountsApi ? "found" : "not found");
  console.log("- payouts:", payoutsApi ? "found" : "not found");
  
  if (!client || (!contactsApi && !fundAccountsApi && !payoutsApi)) {
    console.error("CRITICAL: Payouts API not found!");
    console.error("This means you are using WRONG API KEY!");
    console.error("Current key:", client?.key_id);
    console.error("RazorpayX keys start with: rzp_x_test_ or rzp_x_live_");
    console.error("Your key starts with:", client?.key_id?.substring(0, 7));
    throw new AppError("RazorpayX Payouts API not available. You are using Payment key, not RazorpayX key!", 500);
  }

  if (!contactsApi) {
    console.error("CRITICAL: contacts API not found!");
    console.error("Available APIs:", Object.keys(client || {}));
    throw new AppError("Razorpay contacts API not available.", 500);
  }

  if (typeof contactsApi?.create !== "function") {
    console.error("CRITICAL: contacts.create is not a function!");
    throw new AppError("Razorpay contacts.create method not available.", 500);
  }

  try {
    console.log("Calling contacts.create()...");
    const razorpayContact = await contactsApi.create(contactPayload);
    console.log("SUCCESS: Razorpay contact created:", razorpayContact?.id);
    return razorpayContact;
  } catch (error) {
    console.error("=== Razorpay Contact Error ===");
    console.error("Error message:", error?.message);
    console.error("Error:", error);
    console.error("Status code:", error?.statusCode);
    console.error("Error code:", error?.error?.code);
    console.error("Error description:", error?.error?.description);
    console.error("Response data:", error?.response?.data);
    console.error("Full error:", JSON.stringify(error, null, 2));
    throw new AppError(error?.error?.description || error?.message || "Failed to create contact. Please verify provider details.", 500);
  }
};

export const createFundAccount = async ({
  bankAccount,
  email,
  mobile,
  contactId,
  contactName,
  contactReferenceId,
}) => {
  const client = getRazorpayClient();

  if (!bankAccount || !bankAccount.name || !bankAccount.ifsc || !bankAccount.account_number) {
    throw new AppError("Missing required bank account details.", 400);
  }

  let finalContactId = contactId;
  if (!finalContactId) {
    console.log("Creating Razorpay contact with:", {
      name: contactName || bankAccount.name,
      email,
      contact: mobile,
      referenceId: contactReferenceId,
    });
    const contact = await createRazorpayContact({
      name: contactName || bankAccount.name,
      email,
      contact: mobile,
      referenceId: contactReferenceId,
    });
    finalContactId = contact.id;
  }

  const fundAccountPayload = {
    contact_id: finalContactId,
    account_type: "bank_account",
    bank_account: {
      name: String(bankAccount.name).trim(),
      ifsc: String(bankAccount.ifsc).trim().toUpperCase(),
      account_number: String(bankAccount.account_number).trim(),
    },
  };

  if (email) {
    fundAccountPayload.email = String(email).trim().toLowerCase();
  }

  if (mobile) {
    fundAccountPayload.mobile = String(mobile).trim();
  }

  console.log("=== Creating Fund Account ===");
  console.log("Contact ID:", finalContactId);
  console.log("Bank Account Holder:", bankAccount.name);
  console.log("IFSC:", bankAccount.ifsc);
  console.log("Account Number (FULL):", bankAccount.account_number);
  console.log("Account Number Length:", bankAccount.account_number?.length);

  // Handle different SDK versions
  const fundAccountsApi = client?.fundAccounts || client?.API?.fundAccounts;
  
  if (!fundAccountsApi) {
    console.error("CRITICAL: fundAccounts API not found!");
    throw new AppError("Razorpay fundAccounts API not available.", 500);
  }

  if (typeof fundAccountsApi?.create !== "function") {
    console.error("CRITICAL: fundAccounts.create is not a function!");
    throw new AppError("Razorpay fundAccounts.create not available.", 500);
  }

  try {
    console.log("Calling fundAccounts.create()...");
    const fundAccount = await fundAccountsApi.create(fundAccountPayload);
    console.log("SUCCESS: Fund account created:", fundAccount?.id);
    return fundAccount;
  } catch (error) {
    console.error("=== Razorpay Fund Account Error ===");
    console.error("Payload sent:", JSON.stringify(fundAccountPayload, null, 2));
    console.error("Status:", error.statusCode);
    console.error("Error code:", error.error?.code);
    console.error("Error description:", error.error?.description);
    console.error("Full error response:", JSON.stringify(error, null, 2));
    throw new AppError(error.error?.description || "Failed to create fund account. Please verify bank details.", 500);
  }
};

export const getFundAccount = async (fundAccountId) => {
  const client = getRazorpayClient();

  const fundAccountsApi = client?.fundAccounts || client?.API?.fundAccounts;
  if (!fundAccountsApi) {
    throw new AppError("Razorpay fundAccounts API not available.", 500);
  }

  try {
    const fundAccount = await fundAccountsApi.fetch(fundAccountId);
    return fundAccount;
  } catch (error) {
    console.error("Error fetching fund account:", error.error?.description);
    return null;
  }
};
