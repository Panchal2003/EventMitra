import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    default: "",
  },
  city: {
    type: String,
    default: "",
  },
  serviceInterest: {
    type: String,
    default: "",
  },
  subject: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["unread", "read", "replied"],
    default: "unread",
  },
}, {
  timestamps: true,
});

export const Contact = mongoose.model("Contact", contactSchema);