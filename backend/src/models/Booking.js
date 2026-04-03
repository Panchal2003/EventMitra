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
  },
  {
    timestamps: true,
  }
);

export const Booking = mongoose.model("Booking", bookingSchema);
