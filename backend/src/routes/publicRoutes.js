import { Router } from "express";
import { Service } from "../models/Service.js";
import { ServiceCategory } from "../models/ServiceCategory.js";
import { User } from "../models/User.js";
import { Gallery } from "../models/Gallery.js";
import { Booking } from "../models/Booking.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getProviderRatingSummary, getProviderRatingSummaryMap } from "../utils/providerRatings.js";

export const publicRoutes = Router();

// Get all active service categories (only from approved providers)
publicRoutes.get("/service-categories", asyncHandler(async (req, res) => {
  const categories = await ServiceCategory.find().sort({ name: 1 });

  // Get all approved provider IDs
  const approvedProviders = await User.find({
    role: "serviceProvider",
    providerStatus: "approved"
  }).select("_id");

  const approvedProviderIds = approvedProviders.map(p => p._id);

  const categoriesWithCount = await Promise.all(
    categories.map(async (category) => {
      const providerIds = await Service.distinct("createdBy", {
        category: category._id,
        status: "active",
        createdBy: { $in: approvedProviderIds }
      });
      const listedServices = await Service.countDocuments({
        category: category._id,
        status: "active",
        createdBy: { $in: approvedProviderIds }
      });

      return {
        ...category.toObject(),
        serviceCount: providerIds.length,
        listedServices,
      };
    })
  );

  res.json({
    success: true,
    data: categoriesWithCount
  });
}));

// Get all active services with provider info (only approved providers)
publicRoutes.get("/services", asyncHandler(async (req, res) => {
  const { category, search } = req.query;
  
  const query = { status: "active" };
  
  if (category) {
    query.category = category;
  }
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } }
    ];
  }

  const services = await Service.find(query)
    .populate("category", "name slug")
    .populate({
      path: "createdBy",
      match: { providerStatus: "approved" },
      select: "name businessName avatar experience address providerStatus"
    })
    .sort({ createdAt: -1 });

  const filteredServices = services.filter(service => service.createdBy);

  res.json({
    success: true,
    data: filteredServices
  });
}));

// Get single service with provider details (only from approved providers)
publicRoutes.get("/services/:id", asyncHandler(async (req, res) => {
  const service = await Service.findOne({ 
    _id: req.params.id, 
    status: "active" 
  })
    .populate("category", "name slug description")
    .populate({
      path: "createdBy",
      match: { providerStatus: "approved" },
      select: "name businessName avatar phone experience portfolio address providerStatus"
    });

  if (!service || !service.createdBy) {
    return res.status(404).json({
      success: false,
      message: "Service not found"
    });
  }

  res.json({
    success: true,
    data: service
  });
}));

// Get providers by service category (for customers to browse) - only approved providers
publicRoutes.get("/providers/by-category/:categoryId", asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  
  // Verify category exists
  const category = await ServiceCategory.findById(categoryId);
  if (!category) {
    return res.status(404).json({
      success: false,
      message: "Category not found"
    });
  }
  
  // Get all active services in this category
  const services = await Service.find({ 
    category: categoryId, 
    status: "active" 
  })
    .populate("category", "name slug")
    .populate({
      path: "createdBy",
      match: { providerStatus: "approved" },
      select: "name businessName avatar experience address phone providerStatus"
    })
    .sort({ createdAt: -1 });
  
  // Filter only services with approved providers
  const filteredServices = services.filter(service => service.createdBy);
  
  // Group services by provider
  const providersMap = new Map();
  
  filteredServices.forEach(service => {
    const providerId = service.createdBy._id.toString();
    
    if (!providersMap.has(providerId)) {
      providersMap.set(providerId, {
        provider: service.createdBy,
        services: []
      });
    }
    
    providersMap.get(providerId).services.push({
      _id: service._id,
      name: service.name,
      description: service.description,
      startingPrice: service.startingPrice,
      image: service.image,
      images: service.images || [],
      category: service.category
    });
  });
  
  const ratingMap = await getProviderRatingSummaryMap(Array.from(providersMap.keys()));
  const providers = Array.from(providersMap.entries()).map(([providerId, value]) => ({
    provider: {
      ...(value.provider.toObject ? value.provider.toObject() : value.provider),
      ...(ratingMap.get(String(providerId)) || { rating: null, ratingCount: 0 }),
    },
    services: value.services,
  }));
  
  res.json({
    success: true,
    data: {
      category,
      providers
    }
  });
}));

// Get provider's services (for customers to view) - only approved providers
publicRoutes.get("/provider-services/:providerId", asyncHandler(async (req, res) => {
  const { providerId } = req.params;
  
  console.log("Fetching provider services for providerId:", providerId);
  
  // Validate providerId format
  if (!providerId || providerId === 'undefined' || providerId === 'null') {
    console.log("Invalid providerId:", providerId);
    return res.status(400).json({
      success: false,
      message: "Invalid provider ID"
    });
  }
  
  // Get provider info - only service providers
  const provider = await User.findOne({
    _id: providerId,
    role: "serviceProvider"
  }).select(
    "name businessName avatar experience address phone portfolio serviceCategory providerStatus"
  );
  
  console.log("Provider found:", provider ? "Yes" : "No");
  
  if (!provider) {
    return res.status(404).json({
      success: false,
      message: "Provider not found"
    });
  }
  
  // Check if provider is approved
  if (provider.providerStatus !== "approved") {
    return res.status(403).json({
      success: false,
      message: "This provider is not yet approved by admin.",
      providerStatus: provider.providerStatus
    });
  }
  
  // Get provider's active services
  const services = await Service.find({ 
    createdBy: providerId, 
    status: "active" 
  })
    .populate("category", "name slug")
    .sort({ createdAt: -1 });
  
  console.log("Services found:", services.length);
  
  const ratingSummary = await getProviderRatingSummary(providerId);

  res.json({
    success: true,
    data: {
      provider: {
        ...(provider.toObject ? provider.toObject() : provider),
        rating: ratingSummary.rating,
        ratingCount: ratingSummary.ratingCount,
      },
      services
    }
  });
}));

// Get gallery images (shuffled for randomness)
publicRoutes.get("/gallery", asyncHandler(async (req, res) => {
  const { category } = req.query;
  
  const query = { isActive: true };
  if (category && category !== "All") {
    query.category = category;
  }
  
  const images = await Gallery.find(query).sort({ createdAt: -1 });
  
  // Shuffle array for random display
  const shuffled = images.sort(() => Math.random() - 0.5);
  
  res.json({
    success: true,
    data: shuffled
  });
}));

// Get testimonials from completed bookings with feedback
publicRoutes.get("/testimonials", asyncHandler(async (req, res) => {
  const testimonials = await Booking.find({
    status: "completed",
    "feedback.rating": { $gte: 4 }
  })
  .populate("customer", "name")
  .populate("provider", "name businessName")
  .sort({ "feedback.submittedAt": -1 })
  .limit(20)
  .select("feedback customer provider");

  const formatted = testimonials
    .filter(t => t.feedback?.comment)
    .map(t => ({
      _id: t._id,
      name: t.customer?.name || "Customer",
      role: "Customer",
      content: t.feedback.comment,
      rating: t.feedback.rating,
      providerName: t.provider?.businessName || t.provider?.name
    }));

  res.json({
    success: true,
    data: formatted
  });
}));
