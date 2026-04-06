import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateCenteredIcon() {
  const inputPath = path.join(__dirname, "public/logo.png");
  const outputDir = path.join(__dirname, "public/icons");
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const inputImage = sharp(inputPath);
  const meta = await inputImage.metadata();
  
  console.log(`Original logo: ${meta.width}x${meta.height}`);
  
  const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
  
  for (const size of sizes) {
    await inputImage
      .resize(size, size, {
        fit: "contain",
        background: { r: 17, g: 24, b: 39, alpha: 1 }
      })
      .toFile(path.join(outputDir, `icon-${size}x${size}.png`));
    console.log(`Generated icon-${size}x${size}.png`);
  }

  await inputImage
    .resize(192, 192, {
      fit: "contain",
      background: { r: 17, g: 24, b: 39, alpha: 1 }
    })
    .toFile(path.join(__dirname, "public/logo-192.png"));

  await inputImage
    .resize(512, 512, {
      fit: "contain",
      background: { r: 17, g: 24, b: 39, alpha: 1 }
    })
    .toFile(path.join(__dirname, "public/logo-512.png"));
    
  console.log("Centered icons generated with equal padding!");
}

generateCenteredIcon().catch(console.error);