import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadsRoot = path.resolve(__dirname, "../../uploads");
export const providerPortfolioDir = path.join(uploadsRoot, "portfolio");
export const serviceImagesDir = path.join(uploadsRoot, "services");

export const ensureUploadDirectories = () => {
  try {
    if (!fs.existsSync(providerPortfolioDir)) {
      fs.mkdirSync(providerPortfolioDir, { recursive: true });
    }
    if (!fs.existsSync(serviceImagesDir)) {
      fs.mkdirSync(serviceImagesDir, { recursive: true });
    }
  } catch (error) {
    console.warn("Could not create upload directories:", error.message);
  }
};