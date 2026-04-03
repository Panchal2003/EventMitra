import multer from "multer";
import path from "path";
import { ensureUploadDirectories, providerPortfolioDir, serviceImagesDir } from "../utils/uploadPaths.js";

try {
  ensureUploadDirectories();
} catch (e) {
  console.warn("Upload directories initialization skipped:", e.message);
}

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, providerPortfolioDir);
  },
  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname);
    const sanitizedBase = path
      .basename(file.originalname, extension)
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .slice(0, 48);

    callback(null, `${Date.now()}-${sanitizedBase || "portfolio"}${extension}`);
  },
});

const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
  "application/pdf",
];

const fileFilter = (req, file, callback) => {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    callback(new Error("Only JPG, PNG, WEBP, and PDF portfolio files are allowed."));
    return;
  }

  callback(null, true);
};

const allowedServiceImageMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
  "image/gif",
  "image/bmp",
  "image/tiff",
  "image/heic",
  "image/heif",
];

const serviceImageFileFilter = (req, file, callback) => {
  if (!allowedServiceImageMimeTypes.includes(file.mimetype)) {
    callback(new Error("Only JPG, PNG, and WEBP image files are allowed for service images."));
    return;
  }

  callback(null, true);
};

export const portfolioUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 6,
  },
});

const serviceImageStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, serviceImagesDir);
  },
  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname);
    const sanitizedBase = path
      .basename(file.originalname, extension)
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .slice(0, 48);

    callback(null, `${Date.now()}-${sanitizedBase || "service"}${extension}`);
  },
});

export const serviceImageUpload = multer({
  storage: serviceImageStorage,
  fileFilter: serviceImageFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1,
  },
});

export const serviceMultipleImageUpload = multer({
  storage: serviceImageStorage,
  fileFilter: serviceImageFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 5,
  },
});