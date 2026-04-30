import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
    },
    services: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
    }],
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    eventDate: {
      type: Date,
      required: true,
    },
    eventTime: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    guestCount: {
      type: Number,
      min: 1,
      default: 1,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    advancePaid: {
      type: Number,
      default: 0,
      min: 0,
    },
    remainingAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: [
        "unpaid",
        "advance_pending",
        "advance_paid",
        "full_paid",
        "partially_refunded",
        "refunded",
      ],
      default: "unpaid",
    },
    paymentMeta: {
      advancePercentage: {
        type: Number,
        default: 20,
      },
      remainingPercentage: {
        type: Number,
        default: 80,
      },
      advancePaidAt: {
        type: Date,
      },
      remainingPaidAt: {
        type: Date,
      },
      lastPaymentAt: {
        type: Date,
      },
      remainingPaymentLink: {
        type: String,
        trim: true,
      },
      remainingQrGeneratedAt: {
        type: Date,
      },
    },
    notes: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "provider_assigned",
        "confirmed",
        "rejected",
        "in_progress",
        "otp_pending",
        "completed",
        "cancelled",
      ],
      default: "pending",
    },
    providerAssignedAt: {
      type: Date,
    },
    providerRespondedAt: {
      type: Date,
    },
    startedAt: {
      type: Date,
    },
    providerCompletedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    bookingOtp: {
      code: {
        type: String,
        trim: true,
      },
      isVerified: {
        type: Boolean,
        default: false,
      },
      verifiedAt: {
        type: Date,
      },
      sentAt: {
        type: Date,
      },
    },
    completionOtp: {
      code: {
        type: String,
        trim: true,
      },
      isVerified: {
        type: Boolean,
        default: false,
      },
      verifiedAt: {
        type: Date,
      },
    },
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: {
        type: String,
        trim: true,
      },
      submittedAt: {
        type: Date,
      },
    },
    cancellation: {
      cancelledAt: {
        type: Date,
      },
      cancelledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      cancelReason: {
        type: String,
        trim: true,
      },
      refundAmount: {
        type: Number,
        default: 0,
      },
      refundStatus: {
        type: String,
        enum: ["none", "pending", "processed", "completed"],
        default: "none",
      },
      refundProcessedAt: {
        type: Date,
      },
      cancellationPolicy: {
        type: String,
        enum: ["none", "full_refund", "partial_refund", "no_refund", "more_than_36_hours", "between_24_and_36_hours", "between_18_and_24_hours", "between_12_and_18_hours", "less_than_12_hours"],
        default: "none",
      },
    },
    payoutStatus: {
      type: String,
      enum: ["pending", "processing", "paid", "failed"],
      default: "pending",
    },
    payoutAmount: {
      type: Number,
      default: 0,
    },
    commission: {
      type: Number,
      default: 0,
    },
    payoutDate: {
      type: Date,
    },
    payoutId: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

bookingSchema.virtual("userId").get(function userIdGetter() {
  return this.customer;
});

bookingSchema.virtual("providerId").get(function providerIdGetter() {
  return this.provider;
});

bookingSchema.virtual("serviceId").get(function serviceIdGetter() {
  return this.service;
});

bookingSchema.virtual("totalPrice").get(function totalPriceGetter() {
  return this.totalAmount;
});

bookingSchema.virtual("bookingStatus").get(function bookingStatusGetter() {
  return this.status;
});

export const Booking = mongoose.model("Booking", bookingSchema);
