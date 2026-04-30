import { Router } from "express";
import {
  createServiceCategory,
  createService,
  deleteService,
  getServiceCategories,
  getServices,
  updateService,
} from "../../controllers/admin/serviceController.js";

export const serviceRoutes = Router();

serviceRoutes.get("/categories", getServiceCategories);
serviceRoutes.post("/categories", createServiceCategory);
serviceRoutes.get("/", getServices);
serviceRoutes.post("/", createService);
serviceRoutes.put("/:serviceId", updateService);
serviceRoutes.delete("/:serviceId", deleteService);
