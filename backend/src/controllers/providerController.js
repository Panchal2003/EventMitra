import { Booking } from "../models/Booking.js";
import { Payment } from "../models/Payment.js";
import { Service } from "../models/Service.js";
import { ServiceCategory } from "../models/ServiceCategory.js";
import { User } from "../models/User.js";
import { AppError } from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { BOOKING_STATUS, assertBookingStatus } from "../utils/bookingLifecycle.js";
import { upsertPendingPaymentForBooking } from "../utils/paymentLifecycle.js";
import { generateOtp } from "../utils/otp.js";
import { getProviderRatingSummary } from "../utils/providerRatings.js";

const providerProfilePopulate = {
  path: "serviceCategory",
  select: "name slug description",
};

const bookingPopulate = [
  {
    path: "service",
    select: "name description startingPrice image category",
    populate: {
      path: "category",
      select: "name slug",
    },
  },
  {
    path: "services",
    select: "name description startingPrice image category",
    populate: {
      path: "category",
      select: "name slug",
    },
  },
  { path: "customer", select: "name email phone" },
  { path: "provider", select: "name businessName serviceCategory experience basePrice address phone" },
];

const serializeBookingForProvider = (booking) => {
  const serialized = booking.toObject ? booking.toObject() : booking;

  serialized.startOtpRequested = Boolean(
    serialized.status === BOOKING_STATUS.CONFIRMED &&
      serialized.bookingOtp?.code &&
      !serialized.bookingOtp?.isVerified
  );
  serialized.completionOtpGenerated = Boolean(
    serialized.status === BOOKING_STATUS.OTP_PENDING &&
      serialized.completionOtp?.code &&
      !serialized.completionOtp?.isVerified
  );

  // Calculate provider's share after admin commission
  const totalAmount = Number(serialized.totalAmount || 0);
  serialized.providerAmount = Math.round(totalAmount * 0.89); // 11% admin fee
  serialized.adminProfit = totalAmount - serialized.providerAmount;

  delete serialized.bookingOtp;
  delete serialized.completionOtp;

  return serialized;
};

const buildProviderProfileResponse = async (userId) => {
  const [profile, ratingSummary] = await Promise.all([
    User.findById(userId).select("-password").populate(providerProfilePopulate),
    getProviderRatingSummary(userId),
  ]);

  if (!profile) {
    return null;
  }

  return {
    ...profile.toObject(),
    rating: ratingSummary.rating,
    ratingCount: ratingSummary.ratingCount,
  };
};

const ensureProviderBooking = async (bookingId, providerId) => {
  const booking = await Booking.findOne({ _id: bookingId, provider: providerId }).populate(bookingPopulate);

  if (!booking) {
    throw new AppError("Booking not found for this provider.", 404);
  }

  return booking;
};

export const getProviderDashboard = asyncHandler(async (req, res) => {
  const providerId = req.user._id;

  const [bookingCounts, payments, serviceCount, ratingSummary] = await Promise.all([
    Booking.aggregate([
      {
        $match: {
          provider: providerId,
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]),
    Payment.find({ provider: providerId }).select("amount providerAmount adminProfit status"),
    Service.countDocuments({ createdBy: providerId }),
    getProviderRatingSummary(providerId),
  ]);

  const countMap = bookingCounts.reduce((accumulator, item) => {
    accumulator[item._id] = item.count;
    return accumulator;
  }, {});

  const totalEarnings = payments
    .filter((payment) => payment.status === "released")
    .reduce((sum, payment) => sum + (payment.providerAmount || Math.round(payment.amount * 0.89)), 0);
  const totalAmount = payments
    .filter((payment) => payment.status === "released")
    .reduce((sum, payment) => sum + payment.amount, 0);
  const completedPayments = payments.filter((payment) => payment.status === "released");
  const pendingPayments = payments.filter((payment) => payment.status === "pending");

  res.json({
    success: true,
    data: {
      pendingRequests: countMap.provider_assigned || 0,
      activeJobs: (countMap.confirmed || 0) + (countMap.in_progress || 0) + (countMap.otp_pending || 0),
      completedJobs: countMap.completed || 0,
      totalEarnings,
      totalAmount,
      completedPayments: completedPayments.length,
      pendingPayments: pendingPayments.length,
      completedPaymentAmount: completedPayments.reduce((sum, payment) => sum + (payment.providerAmount || Math.round(payment.amount * 0.89)), 0),
      pendingPaymentAmount: pendingPayments.reduce((sum, payment) => sum + (payment.providerAmount || Math.round(payment.amount * 0.89)), 0),
      serviceCount,
      averageRating: ratingSummary.rating,
      ratingCount: ratingSummary.ratingCount,
    },
  });
});

export const getProviderProfile = asyncHandler(async (req, res) => {
  const profile = await buildProviderProfileResponse(req.user._id);

  res.json({
    success: true,
    data: profile,
  });
});

export const getProviderServiceCategories = asyncHandler(async (req, res) => {
  const categories = await ServiceCategory.find().sort({ name: 1 });

  res.json({
    success: true,
    data: categories,
  });
});

// Create a new service category
export const createProviderServiceCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name || !name.trim()) {
    throw new AppError("Category name is required", 400);
  }

  // Generate slug from name
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  // Check if category with same name or slug already exists
  const existingCategory = await ServiceCategory.findOne({
    $or: [{ name: name.trim() }, { slug }],
  });

  if (existingCategory) {
    throw new AppError("A category with this name already exists", 400);
  }

  const category = await ServiceCategory.create({
    name: name.trim(),
    description: description?.trim() || "",
    slug,
    createdBy: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: "Category created successfully",
    data: category,
  });
});

// Get provider's own services
export const getProviderServices = asyncHandler(async (req, res) => {
  const services = await Service.find({ createdBy: req.user._id })
    .populate("category", "name slug")
    .sort({ createdAt: -1 });

  // Get booking counts for each service
  const servicesWithCounts = await Promise.all(
    services.map(async (service) => {
      const bookingCount = await Booking.countDocuments({ service: service._id });
      const completedCount = await Booking.countDocuments({ 
        service: service._id, 
        status: BOOKING_STATUS.COMPLETED 
      });
      return {
        ...service.toObject(),
        bookings: bookingCount,
        completedBookings: completedCount,
      };
    })
  );

  res.json({
    success: true,
    data: servicesWithCounts,
  });
});

// Add a new service
export const createProviderService = asyncHandler(async (req, res) => {
  const { name, category, description, price, duration, images, allowsMembers, pricePerMember } = req.body;

  const categoryDoc = await ServiceCategory.findById(category);
  if (!categoryDoc) {
    throw new AppError("Invalid category", 400);
  }

  // Parse images if it's a string
  let imagesArray = [];
  if (images) {
    try {
      imagesArray = typeof images === 'string' ? JSON.parse(images) : images;
    } catch (e) {
      imagesArray = [];
    }
  }

  if (imagesArray.length !== 5) {
    throw new AppError("Please upload exactly 5 service images before adding this service.", 400);
  }

  const service = await Service.create({
    name,
    category,
    description,
    startingPrice: Number(price) || 0,
    status: "active",
    images: imagesArray,
    createdBy: req.user._id,
    allowsMembers: allowsMembers || false,
    pricePerMember: Number(pricePerMember) || 0,
  });

  const populatedService = await service.populate("category", "name slug");

  res.status(201).json({
    success: true,
    message: "Service created successfully",
    data: populatedService,
  });
});

// Update provider's service
export const updateProviderService = asyncHandler(async (req, res) => {
  const { name, category, description, price, duration, status, images, allowsMembers, pricePerMember } = req.body;

  const service = await Service.findOne({ _id: req.params.serviceId, createdBy: req.user._id });
  
  if (!service) {
    throw new AppError("Service not found", 404);
  }

  if (category) {
    const categoryDoc = await ServiceCategory.findById(category);
    if (!categoryDoc) {
      throw new AppError("Invalid category", 400);
    }
    service.category = category;
  }

  if (name) service.name = name;
  if (description) service.description = description;
  if (price) service.startingPrice = Number(price);
  if (status) service.status = status;
  if (allowsMembers !== undefined) service.allowsMembers = allowsMembers;
  if (pricePerMember !== undefined) service.pricePerMember = Number(pricePerMember);

  // Handle images array
  if (images) {
    try {
      const imagesArray = typeof images === 'string' ? JSON.parse(images) : images;
      service.images = imagesArray;
    } catch (e) {
      // Keep existing images if parsing fails
    }
  }

  await service.save();
  const populatedService = await service.populate("category", "name slug");

  res.json({
    success: true,
    message: "Service updated successfully",
    data: populatedService,
  });
});

// Delete provider's service
export const deleteProviderService = asyncHandler(async (req, res) => {
  const service = await Service.findOneAndDelete({ _id: req.params.serviceId, createdBy: req.user._id });
  
  if (!service) {
    throw new AppError("Service not found", 404);
  }

  res.json({
    success: true,
    message: "Service deleted successfully",
  });
});

export const updateProviderProfile = asyncHandler(async (req, res) => {
  const { name, serviceCategory, experience, basePrice, address, phone, avatar } = req.body;

  if (serviceCategory) {
    const category = await ServiceCategory.findById(serviceCategory);

    if (!category) {
      throw new AppError("Selected service category does not exist.", 404);
    }
  }

  const updateData = {
    name,
    serviceCategory,
    experience: Number(experience) || 0,
    basePrice: Number(basePrice) || 0,
    address,
    phone,
  };

  if (typeof avatar === "string") {
    updateData.avatar = avatar.trim();
  }

  const provider = await User.findOneAndUpdate(
    { _id: req.user._id, role: "serviceProvider" },
    updateData,
    {
      new: true,
      runValidators: true,
    }
  )
    .select("-password")
    .populate(providerProfilePopulate);

  res.json({
    success: true,
    message: "Provider profile updated successfully.",
    data: provider,
  });
});

export const uploadPortfolio = asyncHandler(async (req, res) => {
  if (!req.files?.length) {
    throw new AppError("Please choose at least one portfolio file to upload.", 400);
  }

  const provider = await User.findById(req.user._id);
  if (!provider) {
    throw new AppError("Provider profile not found.", 404);
  }

  const uploadedItems = req.files.map((file) => ({
    fileName: file.originalname,
    fileUrl: `${req.protocol}://${req.get("host")}/uploads/portfolio/${file.filename}`,
    mimeType: file.mimetype,
    size: file.size,
    uploadedAt: new Date(),
  }));

  provider.portfolio.push(...uploadedItems);
  await provider.save();

  const refreshedProvider = await buildProviderProfileResponse(req.user._id);

  res.status(201).json({
    success: true,
    message: "Portfolio uploaded successfully.",
    data: refreshedProvider,
  });
});

// Upload multiple service images
export const uploadMultipleServiceImages = asyncHandler(async (req, res) => {
  if (!req.files?.length) {
    throw new AppError("Please choose at least one image to upload.", 400);
  }

  if (req.files.length > 5) {
    throw new AppError("You can upload maximum 5 images.", 400);
  }

  const imageUrls = req.files.map((file) =>
    `${req.protocol}://${req.get("host")}/uploads/services/${file.filename}`
  );

  res.status(201).json({
    success: true,
    message: "Service images uploaded successfully.",
    data: {
      images: imageUrls,
    },
  });
});

export const uploadServiceImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError("Please choose an image to upload.", 400);
  }

  const imageUrl = `${req.protocol}://${req.get("host")}/uploads/services/${req.file.filename}`;

  res.status(201).json({
    success: true,
    message: "Service image uploaded successfully.",
    data: {
      url: imageUrl,
      fileName: req.file.filename,
    },
  });
});

export const getProviderBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ provider: req.user._id })
    .populate(bookingPopulate)
    .sort({ createdAt: -1, eventDate: -1 });

  res.json({
    success: true,
    data: bookings.map(serializeBookingForProvider),
  });
});

export const respondToBooking = asyncHandler(async (req, res) => {
  const { action } = req.body;
  const booking = await ensureProviderBooking(req.params.bookingId, req.user._id);

  assertBookingStatus(
    booking,
    [BOOKING_STATUS.PROVIDER_ASSIGNED],
    "This booking is no longer awaiting your response."
  );

  if (!["accept", "reject"].includes(action)) {
    throw new AppError("Invalid provider action.", 400);
  }

  booking.providerRespondedAt = new Date();
  booking.status = action === "accept" ? BOOKING_STATUS.CONFIRMED : BOOKING_STATUS.REJECTED;

  await booking.save();
  if (action === "accept") {
    await upsertPendingPaymentForBooking(booking);
  }
  await booking.populate(bookingPopulate);

  res.json({
    success: true,
    message: action === "accept" ? "Booking accepted successfully." : "Booking rejected successfully.",
    data: serializeBookingForProvider(booking),
  });
});

export const startProviderJob = asyncHandler(async (req, res) => {
  const booking = await ensureProviderBooking(req.params.bookingId, req.user._id);

  assertBookingStatus(booking, [BOOKING_STATUS.CONFIRMED], "Only accepted bookings can be started.");

  if (!booking.bookingOtp?.code || booking.bookingOtp?.isVerified) {
    booking.bookingOtp = {
      code: generateOtp(),
      isVerified: false,
      verifiedAt: undefined,
      sentAt: new Date(),
    };
  }

  await booking.save();
  await booking.populate(bookingPopulate);

  res.json({
    success: true,
    message: "Start OTP generated successfully. Ask the customer to share it so you can begin the job.",
    data: serializeBookingForProvider(booking),
  });
});

export const completeProviderJob = asyncHandler(async (req, res) => {
  const booking = await ensureProviderBooking(req.params.bookingId, req.user._id);

  assertBookingStatus(
    booking,
    [BOOKING_STATUS.IN_PROGRESS],
    "Only started jobs can be marked complete by the provider."
  );

  booking.status = BOOKING_STATUS.OTP_PENDING;
  booking.providerCompletedAt = new Date();
  booking.completionOtp = {
    code: generateOtp(),
    isVerified: false,
    verifiedAt: undefined,
  };

  await booking.save();
  await booking.populate(bookingPopulate);

  res.json({
    success: true,
    message: "Job marked complete. The customer can now enter the final OTP and submit feedback from their side to close this booking.",
    data: serializeBookingForProvider(booking),
  });
});

export const getProviderEarnings = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ provider: req.user._id })
    .select("amount providerAmount adminProfit status method payoutDueDate releasedAt createdAt booking")
    .populate({
      path: "booking",
      populate: [
        { path: "service", select: "name" },
        { path: "customer", select: "name" },
      ],
    })
    .sort({ createdAt: -1 });

  const releasedPayments = payments.filter((payment) => payment.status === "released");
  const pendingPayments = payments.filter((payment) => payment.status === "pending");

  res.json({
    success: true,
    data: {
      totalEarnings: releasedPayments.reduce((sum, payment) => sum + (payment.providerAmount || Math.round(payment.amount * 0.89)), 0),
      completedPayments: releasedPayments.length,
      pendingPayments: pendingPayments.length,
      completedPaymentAmount: releasedPayments.reduce((sum, payment) => sum + (payment.providerAmount || Math.round(payment.amount * 0.89)), 0),
      pendingPaymentAmount: pendingPayments.reduce((sum, payment) => sum + (payment.providerAmount || Math.round(payment.amount * 0.89)), 0),
      payments,
    },
  });
});

// Verify booking OTP - customer gives this to provider to start work
export const verifyBookingOtp = asyncHandler(async (req, res) => {
  const { otp } = req.body;
  const booking = await ensureProviderBooking(req.params.bookingId, req.user._id);

  assertBookingStatus(
    booking,
    [BOOKING_STATUS.CONFIRMED],
    "OTP verification is only available for confirmed bookings."
  );

  if (!otp?.trim()) {
    throw new AppError("Please enter the OTP shared by the customer.", 400);
  }

  if (booking.bookingOtp?.code !== otp.trim()) {
    throw new AppError("Invalid OTP. Please enter the correct code from the customer.", 400);
  }

  booking.bookingOtp.isVerified = true;
  booking.bookingOtp.verifiedAt = new Date();
  booking.status = BOOKING_STATUS.IN_PROGRESS;
  booking.startedAt = new Date();

  await booking.save();
  await booking.populate(bookingPopulate);

  res.json({
    success: true,
    message: "OTP verified successfully. Job started.",
    data: serializeBookingForProvider(booking),
  });
});

export const verifyCompletionOtp = asyncHandler(async (req, res) => {
  const { otp } = req.body;
  const booking = await ensureProviderBooking(req.params.bookingId, req.user._id);

  assertBookingStatus(
    booking,
    [BOOKING_STATUS.OTP_PENDING],
    "Final OTP verification is only available after the job is marked complete."
  );

  if (!otp?.trim()) {
    throw new AppError("Please enter the final OTP shared by the customer.", 400);
  }

  if (booking.completionOtp?.code !== otp.trim()) {
    throw new AppError("Invalid OTP. Please enter the correct final code from the customer.", 400);
  }

  booking.status = BOOKING_STATUS.COMPLETED;
  booking.completedAt = new Date();
  booking.completionOtp.isVerified = true;
  booking.completionOtp.verifiedAt = new Date();

  await booking.save();
  await booking.populate(bookingPopulate);

  res.json({
    success: true,
    message: "Booking completed successfully.",
    data: serializeBookingForProvider(booking),
  });
});

// Regenerate completion OTP if needed
export const regenerateCompletionOtp = asyncHandler(async (req, res) => {
  const booking = await ensureProviderBooking(req.params.bookingId, req.user._id);

  assertBookingStatus(
    booking,
    [BOOKING_STATUS.IN_PROGRESS, BOOKING_STATUS.OTP_PENDING],
    "Completion OTP can only be generated for in-progress or otp-pending bookings."
  );

  booking.completionOtp = {
    code: generateOtp(),
    isVerified: false,
    verifiedAt: undefined,
  };
  booking.status = BOOKING_STATUS.OTP_PENDING;
  booking.providerCompletedAt = new Date();

  await booking.save();
  await booking.populate(bookingPopulate);

  res.json({
    success: true,
    message: "A new final OTP has been generated. The customer can use it in their booking screen.",
    data: serializeBookingForProvider(booking),
  });
});
