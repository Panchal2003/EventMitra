import { Router } from "express";
import {
  getProviders,
  updateProviderStatus,
} from "../../controllers/admin/providerController.js";

export const providerRoutes = Router();

providerRoutes.get("/", getProviders);
providerRoutes.patch("/:providerId/status", updateProviderStatus);

