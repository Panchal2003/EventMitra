import { Router } from "express";
import { Service } from "../models/Service.js";
import { ServiceCategory } from "../models/ServiceCategory.js";
import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getProviderRatingSummary, getProviderRatingSummaryMap } from "../utils/providerRatings.js";

export const publicRoutes = Router();

// Get all active service categories
publicRoutes.get("/service-categories", asyncHandler(async (req, res) => {
  const categories = await ServiceCategory.find().sort({ name: 1 });

  const categoriesWithCount = await Promise.all(
    categories.map(async (category) => {
      const providerIds = await Service.distinct("createdBy", {
        category: category._id,
        status: "active",
      });
      const listedServices = await Service.countDocuments({
        category: category._id,
        status: "active",
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

// Get all active services with provider info
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
    .populate("createdBy", "name businessName avatar experience address")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: services
  });
}));

// Get single service with provider details
publicRoutes.get("/services/:id", asyncHandler(async (req, res) => {
  const service = await Service.findOne({ 
    _id: req.params.id, 
    status: "active" 
  })
    .populate("category", "name slug description")
    .populate("createdBy", "name businessName avatar phone experience portfolio address");

  if (!service) {
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

// Get providers by service category (for customers to browse)
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
    .populate("createdBy", "name businessName avatar experience address phone")
    .sort({ createdAt: -1 });
  
  // Group services by provider
  const providersMap = new Map();
  
  services.forEach(service => {
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

// Get provider's services (for customers to view)
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
    "name businessName avatar experience address phone portfolio serviceCategory"
  );
  
  console.log("Provider found:", provider ? "Yes" : "No");
  
  if (!provider) {
    return res.status(404).json({
      success: false,
      message: "Provider not found"
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
