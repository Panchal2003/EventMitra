import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use /tmp on Vercel, otherwise use local uploads folder
const isVercel = process.env.VERCEL || process.env.NODE_ENV === 'production';
const uploadsRoot = isVercel ? '/tmp' : path.resolve(__dirname, "../../uploads");

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