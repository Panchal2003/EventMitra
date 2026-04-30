import { Contact } from "../models/Contact.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const submitContact = asyncHandler(async (req, res) => {
  const { name, email, phone, city, serviceInterest, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    throw new Error("Name, email, subject, and message are required.");
  }

  const contact = await Contact.create({
    name,
    email,
    phone: phone || "",
    city: city || "",
    serviceInterest: serviceInterest || "",
    subject,
    message,
  });

  res.status(201).json({
    success: true,
    message: "Message sent successfully. We'll get back to you shortly.",
    data: contact,
  });
});

export const getContacts = asyncHandler(async (req, res) => {
  const contacts = await Contact.find().sort({ createdAt: -1 });

  res.json({
    success: true,
    data: contacts,
  });
});

export const updateContactStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const contact = await Contact.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );

  if (!contact) {
    throw new Error("Contact not found.");
  }

  res.json({
    success: true,
    data: contact,
  });
});