import { Router } from "express";
import { Gallery } from "../../models/Gallery.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const galleryRoutes = Router();

// Get all gallery images
galleryRoutes.get("/", asyncHandler(async (req, res) => {
  const images = await Gallery.find().sort({ createdAt: -1 });
  
  res.json({
    success: true,
    data: images
  });
}));

// Add image to gallery (from service images)
galleryRoutes.post("/", asyncHandler(async (req, res) => {
  const { imageUrl, category, alt, sourceServiceId, sourceProviderId } = req.body;
  
  if (!imageUrl) {
    return res.status(400).json({
      success: false,
      message: "Image URL is required"
    });
  }
  
  const image = await Gallery.create({
    imageUrl,
    category: category || "General",
    alt: alt || "Gallery image",
    sourceServiceId,
    sourceProviderId
  });
  
  res.status(201).json({
    success: true,
    data: image
  });
}));

// Delete gallery image
galleryRoutes.delete("/:id", asyncHandler(async (req, res) => {
  const image = await Gallery.findByIdAndDelete(req.params.id);
  
  if (!image) {
    return res.status(404).json({
      success: false,
      message: "Image not found"
    });
  }
  
  res.json({
    success: true,
    message: "Image deleted successfully"
  });
}));