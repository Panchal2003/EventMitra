import { User } from "../models/User.js";
import { AppError } from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createToken } from "../utils/createToken.js";

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  address: user.address,
  businessName: user.businessName,
  providerStatus: user.providerStatus,
  avatar: user.avatar,
  serviceCategory: user.serviceCategory,
  experience: user.experience,
  basePrice: user.basePrice,
  portfolio: user.portfolio,
});

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role = "customer", phone, businessName, serviceCategory } = req.body;
  const allowedRoles = ["customer", "serviceProvider"];

  if (!allowedRoles.includes(role)) {
    throw new AppError("Only customer and service provider accounts can be registered here.", 400);
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError("An account with this email already exists.", 409);
  }

  const userData = {
    name,
    email,
    password,
    role,
    phone,
    businessName,
    providerStatus: role === "serviceProvider" ? "pending" : "approved",
  };
  if (serviceCategory) {
    userData.serviceCategory = serviceCategory;
  }

  const user = await User.create(userData);

  const token = createToken({ userId: user._id, role: user.role });

  res.status(201).json({
    success: true,
    message: "Account created successfully.",
    data: {
      token,
      user: sanitizeUser(user),
    },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Invalid email or password.", 401);
  }

  if (user.role === "serviceProvider" && user.providerStatus !== "approved") {
    throw new AppError("Your provider account is not approved yet.", 403);
  }

  const token = createToken({ userId: user._id, role: user.role });

  res.json({
    success: true,
    message: "Login successful.",
    data: {
      token,
      user: sanitizeUser(user),
    },
  });
});

export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select("-password")
    .populate("serviceCategory", "name slug");

  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://event-mitra-backend.vercel.app'
    : '';

  const replaceUrl = (url) => {
    if (!url || typeof url !== 'string') return url;
    if (url.includes('localhost:5000')) {
      return url.replace('http://localhost:5000', baseUrl);
    }
    return url;
  };

  const userObj = user.toObject();
  if (userObj.avatar) {
    userObj.avatar = replaceUrl(userObj.avatar);
  }

  res.json({
    success: true,
    data: userObj,
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  if (req.user.role !== "customer") {
    throw new AppError("Only customer profiles can be updated here.", 403);
  }

  const { name, phone, address, avatar } = req.body;
  const user = await User.findOne({ _id: req.user._id, role: "customer" });

  if (!user) {
    throw new AppError("Customer profile not found.", 404);
  }

  if (typeof name === "string") {
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new AppError("Name is required.", 400);
    }
    user.name = trimmedName;
  }

  if (typeof phone === "string") {
    user.phone = phone.trim();
  }

  if (typeof address === "string") {
    user.address = address.trim();
  }

  if (typeof avatar === "string") {
    user.avatar = avatar.trim();
  }

  await user.save();

  const updatedUser = await User.findById(req.user._id)
    .select("-password")
    .populate("serviceCategory", "name slug");

  res.json({
    success: true,
    message: "Profile updated successfully.",
    data: updatedUser,
  });
});
