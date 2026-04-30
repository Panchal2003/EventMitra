import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    paymentType: {
      type: String,
      enum: ["advance", "remaining", "refund", "provider_payout"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "INR",
      trim: true,
    },
    providerAmount: {
      type: Number,
      min: 0,
      default: 0,
    },
    adminProfit: {
      type: Number,
      min: 0,
      default: 0,
    },
    commissionRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    status: {
      type: String,
      enum: ["created", "pending", "paid", "released", "processed", "refunded", "failed", "cancelled"],
      default: "created",
    },
    paymentGateway: {
      type: String,
      enum: ["razorpay", "manual"],
      default: "razorpay",
    },
    method: {
      type: String,
      enum: ["online", "upi", "card", "netbanking", "wallet", "bank_transfer", "manual"],
      default: "online",
    },
    transactionId: {
      type: String,
      trim: true,
    },
    razorpay_order_id: {
      type: String,
      trim: true,
    },
    razorpay_payment_id: {
      type: String,
      trim: true,
    },
    razorpay_signature: {
      type: String,
      trim: true,
    },
    razorpay_refund_id: {
      type: String,
      trim: true,
    },
    receipt: {
      type: String,
      trim: true,
    },
    payoutDueDate: {
      type: Date,
    },
    releasedAt: {
      type: Date,
    },
    paidAt: {
      type: Date,
    },
    refundedAt: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

paymentSchema.virtual("bookingId").get(function bookingIdGetter() {
  return this.booking;
});

paymentSchema.index({ booking: 1, paymentType: 1 }, { unique: true });

export const Payment = mongoose.model("Payment", paymentSchema);
