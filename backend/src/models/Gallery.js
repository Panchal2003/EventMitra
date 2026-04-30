import mongoose from "mongoose";

const gallerySchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    default: "General",
  },
  alt: {
    type: String,
    default: "Gallery image",
  },
  serviceName: {
    type: String,
    default: "",
  },
  sourceServiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
    default: null,
  },
  sourceProviderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

export const Gallery = mongoose.model("Gallery", gallerySchema);