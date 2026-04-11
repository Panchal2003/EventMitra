import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";
import { promises as fsPromises } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cloudinary config (use env variables in production)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "your-cloud-name",
  api_key: process.env.CLOUDINARY_API_KEY || "your-api-key",
  api_secret: process.env.CLOUDINARY_API_SECRET || "your-api-secret",
});

const uploadsRoot = path.resolve(__dirname, "../../uploads");

// Upload to Cloudinary and return URL
const uploadToCloudinary = async (filePath, folder) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: `eventmitra/${folder}`,
      resource_type: "image",
    });
    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return null;
  }
};

// Delete local file after Cloudinary upload
const deleteLocalFile = async (filePath) => {
  try {
    await fsPromises.unlink(filePath);
  } catch (error) {
    console.warn("Could not delete local file:", error.message);
  }
};

const ensureUploadDirectories = () => {
  try {
    const portfolioDir = path.join(uploadsRoot, "portfolio");
    const serviceDir = path.join(uploadsRoot, "services");
    if (!fs.existsSync(portfolioDir)) {
      fs.mkdirSync(portfolioDir, { recursive: true });
    }
    if (!fs.existsSync(serviceDir)) {
      fs.mkdirSync(serviceDir, { recursive: true });
    }
  } catch (error) {
    console.warn("Could not create upload directories:", error.message);
  }
};

// Storage that also uploads to Cloudinary
const createCloudinaryStorage = (folder) => {
  ensureUploadDirectories();
  return {
    destination: async (req, file, callback) => {
      const tempDir = path.join(uploadsRoot, "temp");
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      callback(null, tempDir);
    },
    filename: (req, file, callback) => {
      const extension = path.extname(file.originalname);
      const sanitizedBase = path
        .basename(file.originalname, extension)
        .replace(/[^a-zA-Z0-9-_]/g, "-")
        .slice(0, 48);
      callback(null, `${Date.now()}-${sanitizedBase || "file"}${extension}`);
    },
  };
};

const getPortfolioStorage = () => {
  ensureUploadDirectories();
  return multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, path.join(uploadsRoot, "portfolio"));
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
};

const getServiceImageStorage = () => {
  ensureUploadDirectories();
  return multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, path.join(uploadsRoot, "services"));
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
};

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
  storage: getPortfolioStorage(),
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 6,
  },
});

export const serviceImageUpload = multer({
  storage: getServiceImageStorage(),
  fileFilter: serviceImageFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1,
  },
});

export const serviceMultipleImageUpload = multer({
  storage: getServiceImageStorage(),
  fileFilter: serviceImageFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 5,
  },
});

// Export cloudinary for use in controllers
export { uploadToCloudinary, deleteLocalFile };