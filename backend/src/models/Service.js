import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceCategory",
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    startingPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["active", "draft", "archived"],
      default: "active",
    },
    images: {
      type: [String],
      required: false,
      default: [],
    },
    basePricing: {
      type: String,
      trim: true,
      default: "",
    },
    allowsMembers: {
      type: Boolean,
      default: false,
    },
    pricePerMember: {
      type: Number,
      min: 0,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export const Service = mongoose.model("Service", serviceSchema);
