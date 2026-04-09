import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    providerAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    adminProfit: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "released", "refunded"],
      default: "pending",
    },
    method: {
      type: String,
      enum: ["upi", "bank_transfer", "card", "cash"],
      default: "bank_transfer",
    },
    transactionId: {
      type: String,
      trim: true,
    },
    payoutDueDate: {
      type: Date,
    },
    releasedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const Payment = mongoose.model("Payment", paymentSchema);