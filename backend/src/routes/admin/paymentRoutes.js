import { Router } from "express";
import {
  getPayments,
  releasePayout,
} from "../../controllers/admin/paymentController.js";

export const paymentRoutes = Router();

paymentRoutes.get("/", getPayments);
paymentRoutes.patch("/:paymentId/release", releasePayout);

