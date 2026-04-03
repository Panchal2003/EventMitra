import { Router } from "express";
import { getDashboardMetrics } from "../../controllers/admin/dashboardController.js";

export const dashboardRoutes = Router();

dashboardRoutes.get("/", getDashboardMetrics);

