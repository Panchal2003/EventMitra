import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/eventmitra";

const fixImageUrls = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const servicesCollection = mongoose.connection.collection("services");
    const usersCollection = mongoose.connection.collection("users");
    const galleriesCollection = mongoose.connection.collection("galleries");

    const localhostPattern = /http:\/\/localhost:5000/g;
    const newBaseUrl = "https://event-mitra-backend.vercel.app";

    // Fix services
    const servicesResult = await servicesCollection.updateMany(
      { images: { $regex: localhostPattern } },
      { $replaceAll: { images: { original: localhostPattern, replacement: newBaseUrl } } }
    );
    console.log(`Services updated: ${servicesResult.modifiedCount}`);

    // Also fix single image field
    const servicesResult2 = await servicesCollection.updateMany(
      { image: { $regex: localhostPattern } },
      { $replaceAll: { image: { original: localhostPattern, replacement: newBaseUrl } } }
    );
    console.log(`Services (single image) updated: ${servicesResult2.modifiedCount}`);

    // Fix users avatar
    const usersResult = await usersCollection.updateMany(
      { avatar: { $regex: localhostPattern } },
      { $replaceAll: { avatar: { original: localhostPattern, replacement: newBaseUrl } } }
    );
    console.log(`Users avatar updated: ${usersResult.modifiedCount}`);

    // Fix gallery images
    const galleryResult = await galleriesCollection.updateMany(
      { imageUrl: { $regex: localhostPattern } },
      { $replaceAll: { imageUrl: { original: localhostPattern, replacement: newBaseUrl } } }
    );
    console.log(`Gallery images updated: ${galleryResult.modifiedCount}`);

    console.log("\nAll image URLs have been fixed!");
    console.log(`Old: http://localhost:5000`);
    console.log(`New: ${newBaseUrl}`);

  } catch (error) {
    console.error("Error fixing image URLs:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

fixImageUrls();
