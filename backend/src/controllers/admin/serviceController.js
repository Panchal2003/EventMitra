import { Service } from "../../models/Service.js";
import { Booking } from "../../models/Booking.js";
import { ServiceCategory } from "../../models/ServiceCategory.js";
import { AppError } from "../../utils/appError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const getServices = asyncHandler(async (req, res) => {
  const services = await Service.find()
    .populate("category", "name slug")
    .populate("createdBy", "name email businessName")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: services,
  });
});

export const createService = asyncHandler(async (req, res) => {
  const category = await ServiceCategory.findById(req.body.category);

  if (!category) {
    throw new AppError("Selected service category does not exist.", 404);
  }

  const service = await Service.create({
    ...req.body,
    createdBy: req.user._id,
  });

  const populatedService = await service.populate([
    { path: "category", select: "name slug" },
    { path: "createdBy", select: "name email businessName" },
  ]);

  res.status(201).json({
    success: true,
    message: "Service created successfully.",
    data: populatedService,
  });
});

export const updateService = asyncHandler(async (req, res) => {
  if (req.body.category) {
    const category = await ServiceCategory.findById(req.body.category);

    if (!category) {
      throw new AppError("Selected service category does not exist.", 404);
    }
  }

  const service = await Service.findByIdAndUpdate(req.params.serviceId, req.body, {
    new: true,
    runValidators: true,
  }).populate([
    { path: "category", select: "name slug" },
    { path: "createdBy", select: "name email businessName" },
  ]);

  if (!service) {
    throw new AppError("Service not found.", 404);
  }

  res.json({
    success: true,
    message: "Service updated successfully.",
    data: service,
  });
});

export const deleteService = asyncHandler(async (req, res) => {
  const hasLinkedBookings = await Booking.exists({ service: req.params.serviceId });

  if (hasLinkedBookings) {
    throw new AppError(
      "This service is linked to existing bookings. Archive it instead of deleting it.",
      400
    );
  }

  const service = await Service.findByIdAndDelete(req.params.serviceId);

  if (!service) {
    throw new AppError("Service not found.", 404);
  }

  res.json({
    success: true,
    message: "Service deleted successfully.",
  });
});

const createSlug = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const getServiceCategories = asyncHandler(async (req, res) => {
  const categories = await ServiceCategory.find()
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 })
    .lean();

  const serviceCounts = await Service.aggregate([
    {
      $group: {
        _id: "$category",
        totalServices: { $sum: 1 },
      },
    },
  ]);

  const countMap = serviceCounts.reduce((accumulator, item) => {
    accumulator[item._id?.toString()] = item.totalServices;
    return accumulator;
  }, {});

  const enrichedCategories = categories.map((category) => ({
    ...category,
    totalServices: countMap[category._id.toString()] || 0,
  }));

  res.json({
    success: true,
    data: enrichedCategories,
  });
});

export const createServiceCategory = asyncHandler(async (req, res) => {
  const { name, description = "" } = req.body;
  const slug = createSlug(name);

  const existingCategory = await ServiceCategory.findOne({
    $or: [{ name: new RegExp(`^${escapeRegex(name.trim())}$`, "i") }, { slug }],
  });

  if (existingCategory) {
    throw new AppError("A service category with this name already exists.", 409);
  }

  const category = await ServiceCategory.create({
    name,
    description,
    slug,
    createdBy: req.user._id,
  });

  const populatedCategory = await category.populate("createdBy", "name email");

  res.status(201).json({
    success: true,
    message: "Service category created successfully.",
    data: {
      ...populatedCategory.toObject(),
      totalServices: 0,
    },
  });
});
