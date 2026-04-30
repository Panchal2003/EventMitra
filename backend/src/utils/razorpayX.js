import axios from "axios";
import { env } from "../config/env.js";
import { AppError } from "./appError.js";

const RAZORPAYX_BASE_URL = "https://api.razorpay.com/v1";

const getAuthHeader = () => {
  const credentials = Buffer.from(`${env.razorpayKeyId}:${env.razorpayKeySecret}`).toString("base64");
  return {
    Authorization: `Basic ${credentials}`,
    "Content-Type": "application/json",
  };
};

const api = axios.create({
  baseURL: RAZORPAYX_BASE_URL,
  headers: getAuthHeader(),
});

api.interceptors.request.use((config) => {
  console.log("API Request:", config.method?.toUpperCase(), config.url);
  console.log("Full URL:", config.baseURL + config.url);
  console.log("Headers:", config.headers);
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const data = error.response?.data;
    console.error("RazorpayX API Error:", {
      status,
      code: data?.code,
      description: data?.description,
      reason: data?.reason,
    });
    return Promise.reject(error);
  }
);

export const isRazorpayXConfigured = () => {
  return Boolean(env.razorpayKeyId && env.razorpayKeySecret && env.razorpayAccountNumber);
};

export const createRazorpayXContact = async ({
  name,
  email,
  contact,
  referenceId,
}) => {
  if (!name || !String(name).trim()) {
    throw new AppError("Contact name is required", 400);
  }

  const payload = {
    name: String(name).trim(),
    type: "vendor",
    reference_id: referenceId ? String(referenceId).substring(0, 40) : undefined,
  };

  if (email) {
    const cleanEmail = String(email).trim().toLowerCase();
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      payload.email = cleanEmail;
    }
  }

  if (contact) {
    const cleanContact = String(contact).replace(/\D/g, "");
    if (cleanContact.length === 10) {
      payload.contact = cleanContact;
    }
  }

  console.log("=== Creating RazorpayX Contact ===");
  console.log("Payload:", JSON.stringify(payload, null, 2));

  try {
    const response = await api.post("/contacts", payload);
    console.log("Contact created:", response.data.id);
    console.log("Contact details:", {
      id: response.data.id,
      name: response.data.name,
      type: response.data.type,
    });
    return {
      id: response.data.id,
      name: response.data.name,
      type: response.data.type,
      email: response.data.email,
      contact: response.data.contact,
    };
  } catch (error) {
    const errData = error.response?.data;
    console.error("Contact creation failed:", errData);
    throw new AppError(
      errData?.description || errData?.error?.description || "Failed to create contact",
      error.response?.status || 500
    );
  }
};

export const createRazorpayXFundAccount = async ({
  contactId,
  bankAccount,
  email,
  mobile,
}) => {
  if (!contactId) {
    throw new AppError("Contact ID is required", 400);
  }

  if (!bankAccount?.name || !bankAccount?.ifsc || !bankAccount?.account_number) {
    throw new AppError("Bank account details are incomplete", 400);
  }

  const accountNumber = String(bankAccount.account_number).trim();
  const ifsc = String(bankAccount.ifsc).trim().toUpperCase();
  const accountName = String(bankAccount.name).trim();

  if (accountNumber.length < 9 || accountNumber.length > 18) {
    throw new AppError("Invalid account number. Must be 9-18 digits", 400);
  }

  if (ifsc.length !== 11) {
    throw new AppError("Invalid IFSC code. Must be 11 characters", 400);
  }

  const payload = {
    contact_id: contactId,
    account_type: "bank_account",
    bank_account: {
      name: accountName,
      ifsc: ifsc,
      account_number: accountNumber,
    },
  };

  if (email) {
    payload.email = String(email).trim().toLowerCase();
  }

  if (mobile) {
    payload.mobile = String(mobile).trim();
  }

  console.log("=== Creating RazorpayX Fund Account ===");
  console.log("Contact ID:", contactId);
  console.log("Account Name:", accountName);
  console.log("IFSC:", ifsc);
  console.log("Account Number:", accountNumber.substring(0, 4) + "****" + accountNumber.slice(-4));

  try {
    const response = await api.post("/fund_accounts", payload);
    console.log("Fund account created:", response.data.id);
    return {
      id: response.data.id,
      contactId: response.data.contact_id,
      accountType: response.data.account_type,
      bankName: response.data.bank_account?.name,
    };
  } catch (error) {
    const errData = error.response?.data;
    console.error("Fund account creation failed:", errData);
    throw new AppError(
      errData?.description || errData?.error?.description || "Failed to create fund account",
      error.response?.status || 500
    );
  }
};

export const createRazorpayXPayout = async ({
  fundAccountId,
  amountInPaise,
  currency = "INR",
  mode = "IMPS",
  purpose = "payout",
  narration,
  referenceId,
  idempotencyKey,
}) => {
  if (!fundAccountId) {
    throw new AppError("Fund account ID is required", 400);
  }

  if (!amountInPaise || amountInPaise < 100) {
    throw new AppError("Minimum payout amount is Rs. 1.00", 400);
  }

  if (!env.razorpayAccountNumber) {
    throw new AppError("Razorpay account number not configured", 500);
  }

  const payload = {
    account_number: env.razorpayAccountNumber,
    fund_account_id: fundAccountId,
    amount: Math.round(amountInPaise),
    currency,
    mode,
    purpose,
    narration: narration?.substring(0, 100) || "Payout",
  };

  if (referenceId) {
    payload.reference_id = String(referenceId).substring(0, 40);
  }

  console.log("=== 💰 Creating RazorpayX Payout ===");
  console.log("🔑 KEY ID:", env.razorpayKeyId);
  console.log("🔑 KEY FIRST 5:", env.razorpayKeySecret?.substring(0, 5));
  console.log("📋 ACCOUNT:", env.razorpayAccountNumber);
  console.log("Fund Account ID:", fundAccountId);
  console.log("Amount (paise):", payload.amount);
  console.log("Mode:", mode);
  console.log("Purpose:", purpose);
  console.log("Payload JSON:", JSON.stringify(payload, null, 2));

  const headers = getAuthHeader();
  if (idempotencyKey) {
    headers["Idempotency-Key"] = String(idempotencyKey).substring(0, 40);
  }

  try {
    const response = await api.post("/payouts", payload, { headers });
    console.log("Payout created:", response.data.id);
    console.log("Payout status:", response.data.status);
    return {
      id: response.data.id,
      amount: response.data.amount,
      currency: response.data.currency,
      status: response.data.status,
      mode: response.data.mode,
      purpose: response.data.purpose,
      createdAt: response.data.created_at,
    };
  } catch (error) {
    console.error("=== 💰 RAZORPAY PAYOUT ERROR DETAILS 💰 ===");
    console.error("🔑 Key ID being used:", env.razorpayKeyId);
    console.error("🔑 Key Secret (first 5):", env.razorpayKeySecret?.substring(0, 5));
    console.error("📋 Account Number:", env.razorpayAccountNumber);
    console.error("Status:", error.response?.status);
    console.error("Status Text:", error.response?.statusText);
    console.error("Full Data:", JSON.stringify(error.response?.data, null, 2));
    console.error("Request Payload:", JSON.stringify(payload, null, 2));
    console.error("Full Error:", error);
    
    const errData = error.response?.data;
    console.error("Payout failed:", errData);

    const errorMessages = {
      INSUFFICIENT_BALANCE: "Insufficient balance in RazorpayX account",
      INVALID_IFSC: "Invalid IFSC code",
      INVALID_ACCOUNT: "Invalid bank account",
      ACCOUNT_CLOSED: "Bank account is closed",
      ACCOUNT_FROZEN: "Bank account is frozen",
    };

    const message = errData?.description || 
                 errorMessages[errData?.code] || 
                 "Payout failed";

    throw new AppError(message, error.response?.status || 500);
  }
};

export const getRazorpayXPayout = async (payoutId) => {
  try {
    const response = await api.get(`/payouts/${payoutId}`);
    return response.data;
  } catch (error) {
    console.error("Fetch payout failed:", error.response?.data);
    return null;
  }
};

export const getRazorpayXFundAccount = async (fundAccountId) => {
  try {
    const response = await api.get(`/fund_accounts/${fundAccountId}`);
    return response.data;
  } catch (error) {
    console.error("Fetch fund account failed:", error.response?.data);
    return null;
  }
};