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
    videos: {
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
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: undefined
      },
      address: {
        type: String,
        trim: true,
        default: "",
      },
    },
  },
  {
    timestamps: true,
  }
);

// 2dsphere index for geospatial queries
serviceSchema.index({ location: '2dsphere' });

export const Service = mongoose.model("Service", serviceSchema);
